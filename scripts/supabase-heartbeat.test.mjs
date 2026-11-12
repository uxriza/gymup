import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { checkHeartbeat } from "./supabase-heartbeat.mjs";

const config = { url: "https://example.supabase.co", key: "sb_publishable_test" };

test("reads only the heartbeat row using the public API key", async () => {
  let requests = 0;
  await checkHeartbeat({ ...config, fetchImpl: async (url, options) => {
    requests++;
    assert.equal(url.origin, config.url);
    assert.equal(url.pathname, "/rest/v1/service_heartbeat");
    assert.equal(url.search, "?select=id&id=eq.1&limit=1");
    assert.equal(options.method, undefined); // fetch defaults to GET
    assert.equal(options.headers.apikey, config.key);
    assert.equal(options.headers.Authorization, undefined);
    assert.equal(options.redirect, "error");
    assert.ok(options.signal instanceof AbortSignal);
    return new Response('[{"id":1}]');
  }});
  assert.equal(requests, 1);
});

test("rejects missing configuration before making a request", async () => {
  for (const values of [{}, { url: config.url }, { key: config.key }]) {
    await assert.rejects(checkHeartbeat(values), /Set SUPABASE_URL/);
  }
});

test("rejects unsafe project URLs before sending credentials", async () => {
  for (const url of ["http://example.com", "https://user:password@example.com", "https://example.com/path", "https://example.com/?key=secret", "https://example.com/#fragment"]) {
    await assert.rejects(checkHeartbeat({ ...config, url }), /HTTPS project origin/);
  }
});

test("fails on HTTP errors without exposing the server response", async () => {
  for (const status of [401, 403, 404, 503]) {
    await assert.rejects(checkHeartbeat({ ...config, fetchImpl: async () => new Response("sensitive server detail", { status }) }), error => {
      assert.match(error.message, new RegExp(`HTTP ${status}`));
      assert.ok(!error.message.includes("sensitive server detail"));
      return true;
    });
  }
});

test("rejects a missing or malformed heartbeat row", async () => {
  for (const body of ["[]", "null", '{"id":1}', '[{"id":2}]', '[{"id":1},{"id":1}]']) {
    await assert.rejects(checkHeartbeat({ ...config, fetchImpl: async () => new Response(body) }), /missing or inaccessible/);
  }
});

test("fails on invalid JSON and network timeouts", async () => {
  await assert.rejects(checkHeartbeat({ ...config, fetchImpl: async () => new Response("not JSON") }), SyntaxError);
  await assert.rejects(checkHeartbeat({ ...config, fetchImpl: async () => { throw new DOMException("Request timed out", "TimeoutError"); } }), /timed out/);
});

test("CLI exits unsuccessfully when secrets are absent", () => {
  const result = spawnSync(process.execPath, ["scripts/supabase-heartbeat.mjs"], {
    env: { ...process.env, SUPABASE_URL: "", SUPABASE_PUBLISHABLE_KEY: "" }, encoding: "utf8",
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Set SUPABASE_URL/);
  assert.ok(!result.stdout.includes("passed"));
});
