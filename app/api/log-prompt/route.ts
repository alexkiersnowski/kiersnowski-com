import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const { sessionId, prompt } = (await request.json()) as {
      sessionId?: string;
      prompt?: string;
    };

    if (!sessionId || !prompt) {
      return Response.json({ error: "Missing sessionId or prompt" }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    await sql`
      INSERT INTO chat_sessions (id)
      VALUES (${sessionId})
      ON CONFLICT (id) DO NOTHING
    `;
    await sql`
      INSERT INTO chat_prompts (session_id, prompt_text)
      VALUES (${sessionId}, ${prompt})
    `;

    return Response.json({ ok: true });
  } catch (error) {
    console.error("log-prompt failed", error);
    return Response.json({ error: "Failed to log" }, { status: 500 });
  }
}
