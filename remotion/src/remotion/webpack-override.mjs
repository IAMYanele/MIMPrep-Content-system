import { enableTailwind } from "@remotion/tailwind-v4";
import crypto from "crypto";

// Polyfill for webpack 5.98 + Node 22 issues:
// 1. md4 was removed from Node's OpenSSL — alias it to md5.
// 2. Node 22 rejects `undefined` in Hash.update() with ERR_INVALID_ARG_TYPE,
//    which webpack's FileSystemInfo hits when fingerprinting some file
//    entries. Older Node treated undefined as empty — we restore that.
const originalCreateHash = crypto.createHash;
crypto.createHash = (algorithm) => {
  const hash = originalCreateHash(algorithm === "md4" ? "md5" : algorithm);
  const originalUpdate = hash.update.bind(hash);
  hash.update = (data, ...rest) => {
    if (data === undefined || data === null) return hash;
    return originalUpdate(data, ...rest);
  };
  return hash;
};

/**
 *  @param {import('webpack').Configuration} currentConfig
 */
export const webpackOverride = (currentConfig) => {
  return enableTailwind({
    ...currentConfig,
    // Force a Node-native hash and disable persistent caching. (On 4.0.501 the
    // fs cache no longer crashes, but it cost 1.4GB for only ~25% on a 95%-full
    // disk — not worth it. The real fix for repeat bundles is a warm bundle-once
    // process / Remotion Studio, which costs no disk.)
    output: {
      ...currentConfig.output,
      hashFunction: "sha256",
    },
    cache: false,
  });
};
