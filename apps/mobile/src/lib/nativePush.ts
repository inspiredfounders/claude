// Native (iOS/Android) push registration via Capacitor.
// Web push (browser service worker) lives in pushNotifications.ts and is
// unaffected — this module only runs when Capacitor.isNativePlatform().
//
// Sending pushes TO these tokens requires the daily-notify edge function
// (or a new one) to be extended with Firebase Admin credentials (Android/FCM)
// and an APNs auth key (iOS) — see APP_STORE_SUBMISSION.md. This module only
// handles the client-side registration and token storage half of the flow.

import { Capacitor } from "@capacitor/core";
import { PushNotifications, type PermissionStatus } from "@capacitor/push-notifications";
import { supabase } from "./supabase";

export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

export async function getNativePermissionState(): Promise<"granted" | "denied" | "default"> {
  if (!isNativePlatform()) return "default";
  const status: PermissionStatus = await PushNotifications.checkPermissions();
  if (status.receive === "granted") return "granted";
  if (status.receive === "denied") return "denied";
  return "default";
}

let listenersAttached = false;

function attachListenersOnce(notifyHour: number, timezone: string) {
  if (listenersAttached) return;
  listenersAttached = true;

  PushNotifications.addListener("registration", async (token) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const platform = Capacitor.getPlatform(); // "ios" | "android"
    if (platform !== "ios" && platform !== "android") return;

    await supabase.from("device_push_tokens").upsert(
      {
        user_id: user.id,
        platform,
        token: token.value,
        notify_hour: notifyHour,
        timezone,
        enabled: true,
      },
      { onConflict: "user_id,token" },
    );
  });

  PushNotifications.addListener("registrationError", (err) => {
    console.warn("[NativePush] registration error", err);
  });

  // Foreground notification received — the OS already shows it in the
  // background/killed states, this only fires while the app is open.
  PushNotifications.addListener("pushNotificationReceived", (notification) => {
    console.log("[NativePush] received while foregrounded", notification);
  });

  PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
    console.log("[NativePush] user tapped notification", action.notification);
  });
}

export async function requestNativePermissionAndRegister(
  notifyHour = 8,
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
): Promise<boolean> {
  if (!isNativePlatform()) return false;

  const current = await PushNotifications.checkPermissions();
  let receive = current.receive;
  if (receive !== "granted") {
    const requested = await PushNotifications.requestPermissions();
    receive = requested.receive;
  }
  if (receive !== "granted") return false;

  attachListenersOnce(notifyHour, timezone);
  await PushNotifications.register();
  return true;
}

export async function unregisterNativePush(): Promise<void> {
  if (!isNativePlatform()) return;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("device_push_tokens").update({ enabled: false }).eq("user_id", user.id);
}

export async function updateNativeNotifyHour(hour: number): Promise<void> {
  if (!isNativePlatform()) return;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("device_push_tokens").update({ notify_hour: hour }).eq("user_id", user.id).eq("enabled", true);
}
