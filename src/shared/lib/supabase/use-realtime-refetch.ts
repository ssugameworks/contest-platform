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
  onChangeRef.current = onChange;

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
