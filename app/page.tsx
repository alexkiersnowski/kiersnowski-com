"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { SidebarSimple } from "@phosphor-icons/react";
import { Sidebar } from "@/components/sidebar";
import { PromptCard } from "@/components/prompt-card";
import { ChatInput } from "@/components/chat-input";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { useSmoothText } from "@/hooks/use-smooth-text";
import { cn } from "@/lib/utils";

const prompts = [
  "What do you do and how do you work?",
  "Where have you worked and what have you built?",
  "How do you use AI to build products?",
];

type ChatMessage = { role: "user" | "assistant"; content: string };

export default function Page() {
  const [expanded, setExpanded] = useState(false);
  const toggle = () => setExpanded((v) => !v);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [waiting, setWaiting] = useState(false);

  // The scrollable container created by use-stick-to-bottom. Captured via the
  // ScrollRefCapture sentinel below. We drive it directly with scrollTop because
  // both scrollTo({behavior:'smooth'}) and the library's animated scrollToBottom
  // silently no-op on this container, but direct scrollTop works reliably.
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // "Follow mode": true from the moment the user sends a message until either
  // the user scrolls up (breaking follow) or the stream ends. While follow mode
  // is on, every stream chunk triggers a snap-to-bottom so the assistant's
  // response stays pinned in view. The library's own stick-to-bottom sometimes
  // refuses to re-engage after an escape, so we run this ourselves.
  const followRef = useRef(false);

  // Abort controller for the in-flight stream. Used when resetting the chat so
  // a lingering stream does not keep writing into state after the user bails out.
  const abortRef = useRef<AbortController | null>(null);

  function snapToBottom() {
    const el = chatScrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }

  // Attach wheel/touchmove listeners that break follow mode when the user
  // deliberately scrolls up. Programmatic scrollTop assignments do NOT emit
  // wheel events, so we only see real user intent here.
  const hasMessages = messages.length > 0;
  useEffect(() => {
    if (!hasMessages) return;
    let detach: (() => void) | null = null;
    const timer = setTimeout(() => {
      const scrollEl = chatScrollRef.current;
      if (!scrollEl) return;
      const breakFollow = () => {
        followRef.current = false;
      };
      const onWheel = (e: WheelEvent) => {
        if (e.deltaY < 0) breakFollow();
      };
      scrollEl.addEventListener("wheel", onWheel, { passive: true });
      scrollEl.addEventListener("touchmove", breakFollow, { passive: true });
      detach = () => {
        scrollEl.removeEventListener("wheel", onWheel);
        scrollEl.removeEventListener("touchmove", breakFollow);
      };
    }, 50);
    return () => {
      clearTimeout(timer);
      detach?.();
    };
  }, [hasMessages]);

  // While follow mode is on, keep the view pinned to the bottom via a 50ms
  // interval. Brute force, but reliable across every async source of content
  // growth: fetch chunks, useSmoothText's per-frame reveal that continues after
  // streaming ends, markdown re-layout when a bold tag closes, etc.
  //
  // Driven by `hasMessages` rather than `streaming` so the interval outlives the
  // fetch: useSmoothText typically keeps revealing for ~1 second after the last
  // chunk arrives, and we need to keep following through that tail.
  //
  // Inside the tick we only act if followRef is true — handleSubmit sets it to
  // true on every send, and the user scrolling up clears it. After the reveal
  // finishes the interval still runs but its work is a cheap no-op (scrollTop
  // already at scrollHeight).
  useEffect(() => {
    if (!hasMessages) return;
    const id = setInterval(() => {
      if (!followRef.current) return;
      const el = chatScrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
    return () => clearInterval(id);
  }, [hasMessages]);

  async function handleSubmit(text: string) {
    if (streaming) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setStreaming(true);
    setWaiting(true);

    // Enter follow mode — every subsequent chunk will snap to bottom until the
    // user scrolls up or the stream ends.
    followRef.current = true;
    // Initial snap so the user's own message is visible immediately. A short
    // setTimeout lets React render the new user message to the DOM first.
    // requestAnimationFrame gets coalesced out in some React 19 cases.
    setTimeout(snapToBottom, 40);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        throw new Error(`Request failed: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let firstToken = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;

        if (firstToken) {
          firstToken = false;
          setWaiting(false);
          setMessages((m) => [...m, { role: "assistant", content: chunk }]);
        } else {
          setMessages((m) => {
            const copy = [...m];
            const last = copy[copy.length - 1];
            if (last?.role === "assistant") {
              copy[copy.length - 1] = { ...last, content: last.content + chunk };
            }
            return copy;
          });
        }
        // Note: the ResizeObserver in the effect above handles follow-scroll
        // as content grows, so no per-chunk snap is needed here.
      }
    } catch (err) {
      // Ignore intentional aborts (user reset the chat). Surface everything else.
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: "Something broke on my end. Try again in a sec." },
        ]);
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      // NOTE: followRef intentionally stays true after the stream ends so the
      // interval keeps pinning the view through useSmoothText's tail reveal.
      // It is only cleared when the user scrolls up.
      setWaiting(false);
      setStreaming(false);
    }
  }

  // Resets the chat back to the welcome screen. Aborts any in-flight stream so
  // it cannot keep writing into state after the UI has gone back to prompts.
  function resetChat() {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setStreaming(false);
    setWaiting(false);
  }

  function handleBrandClick(e: MouseEvent<HTMLAnchorElement>) {
    if (messages.length === 0) return;
    e.preventDefault();
    resetChat();
  }

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      <Sidebar expanded={expanded} onToggle={toggle} />

      {/* Mobile backdrop — tap to close */}
      {expanded && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={toggle} />
      )}

      <main
        className={cn(
          "relative flex h-screen flex-1 flex-col transition-transform duration-300 ease-out",
          expanded && "translate-x-[280px] md:translate-x-0",
        )}
      >
        <header className="relative flex flex-wrap shrink-0 items-center justify-center px-4 py-4 md:justify-start md:px-8 md:py-5">
          {/* Mobile-only circular toggle — absolute left, hidden when sidebar is open */}
          {!expanded && (
            <button
              type="button"
              aria-label="Open sidebar"
              onClick={toggle}
              className="text-tertiary absolute left-4 top-4 flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white shadow-sm dark:bg-zinc-800 md:hidden"
            >
              <SidebarSimple size={16} weight="regular" />
            </button>
          )}
          <Link
            href="/"
            onClick={handleBrandClick}
            className="text-tertiary hover:text-primary cursor-pointer text-sm transition-colors"
          >
            kiersnowski.com
          </Link>
          {hasMessages && (
            <p className="text-tertiary mt-1 basis-full text-center text-[14px] md:absolute md:left-1/2 md:mt-0 md:basis-auto md:-translate-x-1/2">
              Hello, I&apos;m Alex. Lead Product Designer.
            </p>
          )}
        </header>

        {!hasMessages ? (
          <div className="flex flex-1 flex-col items-center justify-center px-4 pb-28 pt-4 md:px-6 md:pb-10 md:pt-0">
            <div className="max-w-page relative flex w-full flex-col md:-translate-y-20">
              <h1 className="text-hero text-primary mb-4 font-semibold tracking-tight">
                Hi, I&apos;m Alex.
                <br />
                Lead Product Designer.
              </h1>
              <p className="text-tertiary mb-10 text-base tracking-normal">
                I build products end-to-end, from strategy to code. Ask a question or use a shortcut
                below.
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {prompts.map((text) => (
                  <PromptCard key={text} text={text} onClick={() => handleSubmit(text)} />
                ))}
              </div>

              {/* Chat input — fixed to viewport bottom on mobile; on desktop, anchored 40px below the
                  cards via absolute top-full so it grows downward without shifting the centered content. */}
              <div className="bg-background fixed inset-x-0 bottom-0 z-30 px-4 pb-4 md:absolute md:bottom-auto md:left-0 md:right-0 md:top-full md:mt-10 md:bg-transparent md:px-0 md:pb-0">
                <ChatInput onSubmit={handleSubmit} />
              </div>
            </div>
          </div>
        ) : (
          <>
            <Conversation className="flex-1">
              <ConversationContent className="max-w-page mx-auto flex w-full flex-col gap-8 px-4 pb-40 pt-4 md:px-0 md:pb-32">
                {/* Captures the scrollable div so handleSubmit can drive it
                    directly with scrollTop (the library's own animated
                    scrollToBottom is unreliable on this container). */}
                <ScrollRefCapture targetRef={chatScrollRef} />
                {messages.map((m, i) => {
                  const isLastAssistant =
                    i === messages.length - 1 && m.role === "assistant";
                  return (
                    <ChatTurn
                      key={i}
                      role={m.role}
                      content={m.content}
                      isStreaming={isLastAssistant && streaming}
                    />
                  );
                })}
                {waiting && <ThinkingDots />}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>
            {/* Chat input — fixed to viewport on mobile (so it stays put when the off-canvas
                sidebar slides main), absolute inside main on desktop so it centers against the
                same reference frame as the messages above. */}
            <div className="bg-background fixed inset-x-0 bottom-0 z-30 px-4 pb-4 md:absolute md:px-0 md:pb-6">
              <div className="max-w-page mx-auto w-full">
                <ChatInput onSubmit={handleSubmit} />
                <Disclaimer />
              </div>
            </div>
          </>
        )}

        {/* Welcome-state disclaimer — parked at the bottom of main on desktop so
            it is out of the way of the centered content and the chat input that
            floats beneath the prompt cards. Hidden on mobile because the fixed
            chat input already occupies the viewport bottom there. */}
        {!hasMessages && (
          <div className="absolute inset-x-0 bottom-0 z-20 hidden px-4 pb-6 md:block">
            <Disclaimer />
          </div>
        )}
      </main>
    </div>
  );
}

function ChatTurn({
  role,
  content,
  isStreaming,
}: {
  role: "user" | "assistant";
  content: string;
  isStreaming: boolean;
}) {
  // Always call the hook (rules of hooks). For user messages the value is
  // unused, which is cheap — the hook short-circuits when isStreaming=false.
  const smooth = useSmoothText(content, { isStreaming });

  if (role === "user") {
    return (
      <Message from="user">
        <MessageContent className="group-[.is-user]:bg-zinc-200 dark:group-[.is-user]:bg-muted group-[.is-user]:text-primary whitespace-pre-wrap group-[.is-user]:rounded-[22px] group-[.is-user]:px-5 group-[.is-user]:py-2.5">
          {content}
        </MessageContent>
      </Message>
    );
  }

  const shown = isStreaming ? smooth : content;

  return (
    <Message from="assistant" className="max-w-full">
      <MessageContent className="text-primary w-full max-w-full text-base leading-relaxed">
        <MessageResponse
          isAnimating={isStreaming}
          className="prose-kiersnowski"
        >
          {shown}
        </MessageResponse>
      </MessageContent>
    </Message>
  );
}

function Disclaimer() {
  return (
    <p className="text-tertiary mt-2 text-center text-[12px] leading-tight">
      AI-generated responses can be inaccurate and may not fully represent Alex Kiersnowski.
    </p>
  );
}

function ThinkingDots() {
  return (
    <div className="text-tertiary flex items-center gap-1.5" aria-label="Thinking">
      <span className="size-1.5 animate-pulse rounded-full bg-current [animation-delay:0ms]" />
      <span className="size-1.5 animate-pulse rounded-full bg-current [animation-delay:200ms]" />
      <span className="size-1.5 animate-pulse rounded-full bg-current [animation-delay:400ms]" />
    </div>
  );
}

/**
 * Sentinel that captures the scrollable container use-stick-to-bottom creates.
 * The StickToBottom.Content component renders:
 *   <div ref={scrollRef}>           // <-- the actual scroll container
 *     <div ref={contentRef}>        // <-- where our children render
 *       {children}
 *     </div>
 *   </div>
 * So from a child, walking up 2 parentElements lands us on the scroll element.
 * We write it into a parent-owned ref so the submit handler can drive its
 * scrollTop directly, bypassing the library's unreliable animated scrollToBottom.
 */
function ScrollRefCapture({
  targetRef,
}: {
  targetRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      aria-hidden
      ref={(node) => {
        if (!node) {
          targetRef.current = null;
          return;
        }
        const scrollEl = node.parentElement?.parentElement ?? null;
        targetRef.current = scrollEl as HTMLDivElement | null;
      }}
      style={{ display: "none" }}
    />
  );
}
