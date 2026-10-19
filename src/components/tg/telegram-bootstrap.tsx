"use client";

import { useEffect } from "react";

type TG = {
  ready: () => void;
  expand: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  disableVerticalSwipes?: () => void;
  BackButton?: { show: () => void; hide: () => void };
  HapticFeedback?: { impactOccurred: (style: string) => void };
};

export function TelegramBootstrap() {
  useEffect(() => {
    const tg = (window as unknown as { Telegram?: { WebApp?: TG } }).Telegram?.WebApp;
    if (!tg) return;
    tg.ready();
    tg.expand();
    try {
      tg.setHeaderColor?.("#ffffff");
      tg.setBackgroundColor?.("#f6f7f8");
      tg.disableVerticalSwipes?.();
    } catch {
      /* older clients */
    }
  }, []);
  return null;
}
