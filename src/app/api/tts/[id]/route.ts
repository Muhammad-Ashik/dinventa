import { getCachedAudio } from "@/lib/tts";

// Twilio's <Play> fetches ElevenLabs-generated call audio from here; ids are
// server-generated (src/lib/tts.ts) and short-lived, not user-derivable.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const audio = getCachedAudio(id);
  if (!audio) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(new Blob([Uint8Array.from(audio.buffer)]), {
    headers: { "Content-Type": audio.contentType },
  });
}
