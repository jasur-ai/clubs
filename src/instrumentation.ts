/**
 * Startup hooks. The Node-only work lives in instrumentation.node.ts so the
 * edge compiler never pulls in Node built-ins.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const mod = await import("./instrumentation.node");
  await mod.register();
}
