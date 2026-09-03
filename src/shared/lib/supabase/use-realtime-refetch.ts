"use client";

import { debounce } from "es-toolkit";
import { useEffect, useEffectEvent, useState } from "react";
import { createClient } from "./client";

// 여러 테이블에 걸쳐 변경 이벤트가 몰려 들어와도(예: 라이브 타이밍에 투자/채점이
// 한꺼번에 발생) 리페치가 매번 겹쳐 일어나지 않도록 묶어서 한 번만 호출한다.
const NOTIFY_DEBOUNCE_MS = 400;

export function useRealtimeRefetch(
  channelName: string,
  tables: string[],
  onChange: () => void,
) {
  const [connected, setConnected] = useState(false);
  const notifyChange = useEffectEvent(onChange);

  useEffect(() => {
    const supabase = createClient();
    const debouncedNotify = debounce(notifyChange, NOTIFY_DEBOUNCE_MS);
    let channel = supabase.channel(channelName);
    for (const table of tables) {
      channel = channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => debouncedNotify(),
      );
    }
    channel.subscribe((status) => setConnected(status === "SUBSCRIBED"));
    return () => {
      debouncedNotify.cancel();
      supabase.removeChannel(channel);
    };
  }, [channelName, tables]);

  return connected;
}
