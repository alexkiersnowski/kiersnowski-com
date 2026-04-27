"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowUp } from "@phosphor-icons/react";

export function ChatInput({ onSubmit }: { onSubmit?: (text: string) => void }) {
  const [value, setValue] = useState("");
  const [isDesktop, setIsDesktop] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  // Focus on mount and whenever value resets to empty (i.e. after send)
  useEffect(() => {
    if (value === "") textareaRef.current?.focus();
  }, [value]);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit?.(trimmed);
    setValue("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isDesktop) return;
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  const disabled = value.trim().length === 0;

  return (
    <div className="border-border bg-card flex w-full items-center rounded-2xl border shadow-sm">
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Ask Alex..."
        aria-label="Ask Alex"
        className="text-primary placeholder:text-tertiary field-sizing-content max-h-40 flex-1 resize-none overflow-y-auto bg-transparent px-5 py-4 text-base focus:outline-none"
      />
      <button
        type="button"
        onClick={submit}
        disabled={disabled}
        title="Send"
        aria-label="Send"
        className="bg-foreground text-background m-2 flex size-9 flex-none cursor-pointer items-center justify-center rounded-lg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ArrowUp size={18} weight="bold" />
      </button>
    </div>
  );
}
