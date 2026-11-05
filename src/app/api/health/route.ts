export const dynamic = "force-dynamic";
export function GET() { return Response.json({ status: "ok", checkedAt: new Date().toISOString() }, { headers: { "Cache-Control": "no-store, max-age=0", "X-Robots-Tag": "noindex" } }); }
export function HEAD() { return new Response(null, { status: 200, headers: { "Cache-Control": "no-store, max-age=0", "X-Robots-Tag": "noindex" } }); }
