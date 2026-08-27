/**
 * Chrome DevTools and other debug clients probe /json/* on localhost
 * (normally served by the Node inspector on a separate port). Respond
 * quickly so dev logs are not filled with 404s.
 */
export function GET() {
  return new Response(null, { status: 204 });
}
