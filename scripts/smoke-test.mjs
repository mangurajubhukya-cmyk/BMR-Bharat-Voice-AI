const base = process.env.SMOKE_BASE_URL || `http://127.0.0.1:${process.env.PORT || 3000}`;
const checks = [
  ["/healthz", "application/json"],
  ["/manus-routes.json", "application/json"],
  ["/", "text/html"],
  ["/plans", "text/html"],
  ["/checkout/test", "text/html"],
];
let failed = false;
for (const [path, expectedType] of checks) {
  const response = await fetch(`${base}${path}`);
  const contentType = response.headers.get("content-type") || "";
  const body = await response.text();
  const ok = response.ok && contentType.includes(expectedType);
  if (path === "/healthz") {
    try { const json = JSON.parse(body); if (json.status !== "ok" || json.application !== "BMR Bharat Voice AI") throw new Error("unexpected health payload"); } catch { failed = true; console.error(`FAIL ${path}: invalid health JSON`); continue; }
  }
  if (path === "/manus-routes.json") {
    try { const json = JSON.parse(body); if (!Array.isArray(json.routes) || !json.routes.some(route => route.path === "/")) throw new Error("unexpected route manifest"); } catch { failed = true; console.error(`FAIL ${path}: invalid route manifest`); continue; }
  }
  console.log(`${ok ? "PASS" : "FAIL"} ${path} ${response.status} ${contentType}`);
  if (!ok) failed = true;
}
const auth = await fetch(`${base}/api/trpc/auth.me?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D`);
console.log(`${auth.ok ? "PASS" : "FAIL"} /api/trpc/auth.me ${auth.status}`);
if (!auth.ok) failed = true;
process.exitCode = failed ? 1 : 0;
