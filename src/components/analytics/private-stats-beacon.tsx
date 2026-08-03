"use client";

import { useEffect, useRef } from "react";
import { trackToolOpen } from "@/lib/analytics/private-stats";
import type { ToolSlug } from "@/lib/tools-registry";

/** Records an anonymous tool-page open once per mount. */
export function PrivateStatsBeacon({ toolSlug }: { toolSlug: ToolSlug }) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackToolOpen(toolSlug);
  }, [toolSlug]);

  return null;
}
