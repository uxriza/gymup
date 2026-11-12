import { pathToFileURL } from "node:url";

// No dependencies or privileged database credentials required.
export async function checkHeartbeat({ url, key, fetchImpl = fetch }) {
  if (!url || !key) {
    throw new Error("Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in GitHub Actions secrets.");
  }

  const endpoint = new URL(url);
  if (endpoint.protocol !== "https:" || endpoint.username || endpoint.password || endpoint.search || endpoint.hash || endpoint.pathname !== "/") {
    throw new Error("SUPABASE_URL must be an HTTPS project origin, without a path or credentials.");
  }
  endpoint.pathname = "/rest/v1/service_heartbeat";
  endpoint.search = "select=id&id=eq.1&limit=1";

  // apikey supports both publishable keys and legacy anon JWTs.
  // Do not put a publishable key in an Authorization Bearer header.
  const response = await fetchImpl(endpoint, {
    headers: { apikey: key, "Cache-Control": "no-cache" },
    redirect: "error",
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) {
    // Do not print response bodies, URLs or keys to CI logs.
    throw new Error(`Database heartbeat failed (HTTP ${response.status}). Check project status, SQL setup and secrets.`);
  }
  const rows = await response.json();
  if (!Array.isArray(rows) || rows.length !== 1 || rows[0]?.id !== 1) {
    throw new Error("Heartbeat row missing or inaccessible. Run supabase/heartbeat.sql and check its read policy.");
  }
}

// Importing this module for verification does not contact Supabase.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await checkHeartbeat({
      url: process.env.SUPABASE_URL,
      key: process.env.SUPABASE_PUBLISHABLE_KEY,
    });
    console.log("Supabase database heartbeat passed.");
  } catch (error) {
    console.error(error instanceof Error && !["TypeError", "SyntaxError"].includes(error.name)
      ? error.message
      : "Database heartbeat request failed. Check connectivity and project status.");
    process.exitCode = 1;
  }
}
