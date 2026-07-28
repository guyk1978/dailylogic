export { default, alt, size, contentType } from "./opengraph-image";

// Must be a local export — Cloudflare/next-on-pages cannot detect re-exported `runtime`.
export const runtime = "edge";
