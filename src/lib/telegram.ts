import "server-only";

import crypto from "node:crypto";

export type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
};

export type InitData = {
  query_id?: string;
  user?: TelegramUser;
  auth_date: number;
  hash: string;
  start_param?: string;
  chat_type?: string;
  chat_instance?: string;
};

const MAX_AGE_SECONDS = 60 * 60 * 24; // 24h — matches Telegram guidance

/**
 * Validate Telegram Mini App initData.
 * Spec: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 * secret = HMAC_SHA256(key="WebAppData", msg=bot_token)
 * hash   = HMAC_SHA256(key=secret, msg=data_check_string)
 */
export function validateInitData(raw: string, botToken: string): { ok: true; data: InitData } | { ok: false; error: string } {
  if (!raw) return { ok: false, error: "initData is empty" };
  if (!botToken) return { ok: false, error: "TELEGRAM_BOT_TOKEN is not configured" };

  let params: URLSearchParams;
  try {
    params = new URLSearchParams(raw);
  } catch {
    return { ok: false, error: "Malformed initData" };
  }

  const hash = params.get("hash");
  if (!hash) return { ok: false, error: "Missing hash" };

  const pairs: string[] = [];
  params.forEach((value, key) => {
    if (key !== "hash") pairs.push(`${key}=${value}`);
  });
  pairs.sort();
  const dataCheckString = pairs.join("\n");

  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const calculated = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  const a = Buffer.from(calculated, "hex");
  const b = Buffer.from(hash, "hex");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { ok: false, error: "Signature mismatch" };
  }

  const authDate = Number(params.get("auth_date") ?? 0);
  if (!authDate) return { ok: false, error: "Missing auth_date" };
  if (Date.now() / 1000 - authDate > MAX_AGE_SECONDS) {
    return { ok: false, error: "initData expired" };
  }

  let user: TelegramUser | undefined;
  const rawUser = params.get("user");
  if (rawUser) {
    try {
      user = JSON.parse(rawUser) as TelegramUser;
    } catch {
      return { ok: false, error: "Malformed user payload" };
    }
  }

  return {
    ok: true,
    data: {
      query_id: params.get("query_id") ?? undefined,
      user,
      auth_date: authDate,
      hash,
      start_param: params.get("start_param") ?? undefined,
      chat_type: params.get("chat_type") ?? undefined,
      chat_instance: params.get("chat_instance") ?? undefined,
    },
  };
}

// ---------------------------------------------------------------------------
// Minimal Bot API client (no extra dependency)
// ---------------------------------------------------------------------------

const API = "https://api.telegram.org";

export type InlineKeyboard = { inline_keyboard: Array<Array<{ text: string; url?: string; web_app?: { url: string } }>> };

function makeClient(token: string | undefined) {
  async function call<T = unknown>(method: string, payload: Record<string, unknown> = {}): Promise<T | null> {
    if (!token) return null;
    try {
      const res = await fetch(`${API}/bot${token}/${method}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      });
      const json = (await res.json()) as { ok: boolean; result?: T; description?: string };
      if (!json.ok) {
        console.error(`[telegram] ${method} failed: ${json.description}`);
        return null;
      }
      return json.result ?? null;
    } catch (error) {
      console.error(`[telegram] ${method} network error`, error);
      return null;
    }
  }

  return {
    sendMessage: (chatId: number | string, text: string, keyboard?: InlineKeyboard) =>
      call("sendMessage", {
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
        ...(keyboard ? { reply_markup: keyboard } : {}),
      }),
    setWebhook: (url: string, secretToken?: string) =>
      call("setWebhook", {
        url,
        secret_token: secretToken,
        allowed_updates: ["message", "callback_query"],
        drop_pending_updates: true,
      }),
    setMyCommands: (commands: Array<{ command: string; description: string }>) => call("setMyCommands", { commands }),
    deleteWebhook: () => call("deleteWebhook", { drop_pending_updates: true }),
    getMe: () => call<{ id: number; username: string }>("getMe"),
  };
}

export type TelegramClient = ReturnType<typeof makeClient>;

export function createTelegramClient(token: string) {
  return makeClient(token);
}

/** Default client bound to TELEGRAM_BOT_TOKEN (single-bot deployments). */
export const telegram = makeClient(process.env.TELEGRAM_BOT_TOKEN);
