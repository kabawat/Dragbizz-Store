"use client";
import { useCallback, useEffect, useState } from "react";
export function useDashboardLayout(scope, section, defaults) {
  const key = scope ? `dragbizz:dashboard-layout:v1:${scope}:${section}` : null;
  const [saved, setSaved] = useState({ key: null, value: undefined });
  useEffect(() => {
    let value;
    if (key) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) value = JSON.parse(raw);
        else if (section === "stats") {
          const oldOrder = JSON.parse(
            localStorage.getItem("dashboard-metrics-order") || "null"
          );
          if (Array.isArray(oldOrder)) value = { order: oldOrder };
        }
      } catch {
        /* Invalid preferences fall back to defaults. */
      }
    }
    setSaved({ key, value });
  }, [key, section]);
  const save = useCallback(
    (layout) => {
      if (!key) throw new Error("User/store scope is not ready");
      const value = {
        order: [...layout.order],
        columns: layout.columns,
        widthPercent: 100,
        minHeight: 0,
      };
      localStorage.setItem(key, JSON.stringify(value));
      setSaved({ key, value });
    },
    [key]
  );
  return {
    layout: saved.key === key ? (saved.value ?? defaults) : defaults,
    save,
  };
}
