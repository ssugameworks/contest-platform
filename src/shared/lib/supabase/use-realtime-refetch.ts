"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "./client";

export function useRealtimeRefetch(
  channelName: string,
  tables: string[],
  onChange: () => void,
) {
  const [connected, setConnected] = useState(false);
  const onChangeRef = useRef(onChange);
  // Kept in an effect, not written directly during render — React can
  // discard/replay a render, and this ref is read later by an async
  // subscription callback, not during this same render pass.
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    const supabase = createClient();
    let channel = supabase.channel(channelName);
    for (const table of tables) {
      channel = channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => onChangeRef.current(),
      );
    }
    channel.subscribe((status) => setConnected(status === "SUBSCRIBED"));
    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName, tables]);

  return connected;
}
