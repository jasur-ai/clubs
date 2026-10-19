/**
 * Startup hooks. Kept runtime-agnostic so the edge compiler never pulls in
 * Node-only modules; the Telegram bootstrap lives in instrumentation.node.ts.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./instrumentation.node");
  }
}
