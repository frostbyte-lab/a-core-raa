import { analyzeAraaEvidence, ARAA_IDENTITY } from "./araa-core.js";

const MAX_BYTES = 256 * 1024;
const corsHeaders = { "access-control-allow-origin": "*", "access-control-allow-methods": "GET,POST,OPTIONS", "access-control-allow-headers": "content-type", "cache-control": "no-store" };
function json(data, status = 200) { return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "content-type": "application/json; charset=utf-8" } }); }

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
    if (url.pathname === "/api/health" && request.method === "GET") return json({ ok: true, service: "a-core-raa-cloudflare", identity: ARAA_IDENTITY, runtime: "cloudflare-worker", externalAI: false });
    if (url.pathname === "/api/analyze" && request.method === "POST") {
      try {
        const raw = await request.text();
        if (new TextEncoder().encode(raw).byteLength > MAX_BYTES) return json({ ok: false, error: "Evidence melebihi batas 256 KB." }, 413);
        const body = JSON.parse(raw);
        const report = analyzeAraaEvidence(body?.evidence ?? body);
        return json({ ok: true, report });
      } catch (error) {
        return json({ ok: false, error: "Evidence tidak valid atau tidak dapat dianalisis." }, 400);
      }
    }
    if (env.ASSETS) return env.ASSETS.fetch(request);
    return new Response("A Core Raa Cloud", { headers: { "content-type": "text/plain; charset=utf-8" } });
  }
};
