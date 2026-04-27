import Anthropic from "@anthropic-ai/sdk";
import { persona } from "@/lib/persona";

export const runtime = "nodejs";

const client = new Anthropic();

const PER_MINUTE_LIMIT = 10;
const PER_HOUR_LIMIT = 60;
const MAX_MESSAGES = 30;
const MAX_TOTAL_CHARS = 16_000;

type Bucket = {
  minute: { count: number; reset: number };
  hour: { count: number; reset: number };
};
const buckets = new Map<string, Bucket>();

function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function checkRateLimit(ip: string): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now();
  let bucket = buckets.get(ip);
  if (!bucket) {
    bucket = {
      minute: { count: 0, reset: now + 60_000 },
      hour: { count: 0, reset: now + 3_600_000 },
    };
    buckets.set(ip, bucket);
  }
  if (now > bucket.minute.reset) bucket.minute = { count: 0, reset: now + 60_000 };
  if (now > bucket.hour.reset) bucket.hour = { count: 0, reset: now + 3_600_000 };
  bucket.minute.count++;
  bucket.hour.count++;
  if (bucket.minute.count > PER_MINUTE_LIMIT) {
    return { ok: false, retryAfter: Math.ceil((bucket.minute.reset - now) / 1000) };
  }
  if (bucket.hour.count > PER_HOUR_LIMIT) {
    return { ok: false, retryAfter: Math.ceil((bucket.hour.reset - now) / 1000) };
  }
  return { ok: true };
}

function totalChars(messages: Anthropic.MessageParam[]): number {
  let total = 0;
  for (const m of messages) {
    if (typeof m.content === "string") {
      total += m.content.length;
    } else if (Array.isArray(m.content)) {
      for (const block of m.content) {
        if (block.type === "text") total += block.text.length;
      }
    }
  }
  return total;
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limit = checkRateLimit(ip);
  if (!limit.ok) {
    return Response.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: { "retry-after": String(limit.retryAfter) } },
    );
  }

  let body: { messages?: Anthropic.MessageParam[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { messages } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "messages array required" }, { status: 400 });
  }
  if (messages.length > MAX_MESSAGES) {
    return Response.json({ error: "Conversation too long" }, { status: 413 });
  }
  if (totalChars(messages) > MAX_TOTAL_CHARS) {
    return Response.json({ error: "Message too large" }, { status: 413 });
  }

  let stream: ReturnType<typeof client.messages.stream>;
  try {
    stream = client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: [
        {
          type: "text",
          text: persona,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages,
    });
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      return Response.json({ error: err.message }, { status: err.status ?? 500 });
    }
    return Response.json({ error: "Failed to start stream" }, { status: 500 });
  }

  const encoder = new TextEncoder();
  const body$ = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body$, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-accel-buffering": "no",
    },
  });
}
