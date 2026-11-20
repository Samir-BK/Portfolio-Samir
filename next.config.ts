import type { NextConfig } from 'next';

export default {
  // Wait for publication checks before sending a detail page's HTTP status.
  htmlLimitedBots: /.*/,
} satisfies NextConfig;
