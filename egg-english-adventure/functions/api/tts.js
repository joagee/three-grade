/**
 * Cloudflare Pages Function: Proxy to Google Cloud Text-to-Speech API.
 *
 * GET /api/tts?text=hello&lang=en-US
 *
 * Environment variable: GOOGLE_TTS_KEY (set in Cloudflare Pages dashboard)
 */
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const text = url.searchParams.get('text');
  const lang = url.searchParams.get('lang') || 'en-US';

  if (!text || text.length > 200) {
    return new Response('Bad Request', { status: 400 });
  }

  const apiKey = env.GOOGLE_TTS_KEY;
  if (!apiKey) {
    return new Response('Server config error: missing GOOGLE_TTS_KEY', { status: 500 });
  }

  const gain = parseFloat(url.searchParams.get('gain')) || 6.0;

  const body = {
    input: { text },
    voice: { languageCode: lang },
    audioConfig: { audioEncoding: 'MP3', speakingRate: 0.9, volumeGainDb: gain }
  };

  if (lang === 'en-US') {
    body.voice.name = 'en-US-Wavenet-C';
  }

  const resp = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }
  );

  if (!resp.ok) {
    const errText = await resp.text();
    console.error('[tts] Google API error:', resp.status, errText);
    return new Response('TTS API error', { status: 502 });
  }

  const data = await resp.json();
  if (!data.audioContent) {
    return new Response('No audio in response', { status: 502 });
  }

  const binary = Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0));

  return new Response(binary, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=86400'
    }
  });
}
