import { supabase } from "./supabase";
import {
  isNativePlatform,
  getNativePermissionState,
  requestNativePermissionAndRegister,
  unregisterNativePush,
  updateNativeNotifyHour,
} from "./nativePush";

export type PermissionState = "default" | "granted" | "denied" | "unsupported";

export function getPermissionState(): PermissionState {
  // Native apps don't have window.Notification — permission is checked
  // asynchronously via getPermissionStateAsync() instead.
  if (isNativePlatform()) return "default";
  if (!("Notification" in window) || !("serviceWorker" in navigator)) return "unsupported";
  return Notification.permission as PermissionState;
}

// Prefer this on mount when you can await — it resolves the real state on
// native platforms instead of always reporting "default".
export async function getPermissionStateAsync(): Promise<PermissionState> {
  if (isNativePlatform()) return getNativePermissionState();
  return getPermissionState();
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js");
  } catch {
    return null;
  }
}

export async function requestPermissionAndSubscribe(notifyHour = 8, timezone = Intl.DateTimeFormat().resolvedOptions().timeZone): Promise<boolean> {
  if (isNativePlatform()) return requestNativePermissionAndRegister(notifyHour, timezone);

  if (!("Notification" in window)) return false;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return false;

  const reg = await registerServiceWorker();
  if (!reg) return false;

  const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;
  if (!vapidKey) {
    console.warn("[Push] VITE_VAPID_PUBLIC_KEY not set — subscription skipped");
    return true; // Permission granted, just can't subscribe without key
  }

  try {
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
    });

    const json = sub.toJSON();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    await supabase.from("push_subscriptions").upsert({
      user_id:     user.id,
      endpoint:    json.endpoint!,
      p256dh:      (json.keys as Record<string, string>).p256dh,
      auth:        (json.keys as Record<string, string>).auth,
      notify_hour: notifyHour,
      timezone,
      enabled:     true,
    }, { onConflict: "endpoint" });

    return true;
  } catch {
    return false;
  }
}

export async function unsubscribe(): Promise<void> {
  if (isNativePlatform()) return unregisterNativePush();

  const reg = await navigator.serviceWorker.getRegistration("/sw.js");
  if (!reg) return;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;
  await sub.unsubscribe();
  await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
}

export async function updateNotifyHour(hour: number): Promise<void> {
  if (isNativePlatform()) return updateNativeNotifyHour(hour);

  const reg = await navigator.serviceWorker.getRegistration("/sw.js");
  if (!reg) return;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;
  await supabase.from("push_subscriptions").update({ notify_hour: hour }).eq("endpoint", sub.endpoint);
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw     = window.atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}
