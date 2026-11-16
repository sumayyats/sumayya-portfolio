import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Readymag site's URLs are /works/ and /about/; keep them canonical.
  trailingSlash: true,
};

export default nextConfig;
