// The visitor's own motion switch (footer toggle), on top of the OS
// prefers-reduced-motion setting. Stored in localStorage, never a cookie, and
// mirrored to <html data-motion="off"> so CSS can stop animations.

export type MotionPreference = "on" | "off";

export const MOTION_STORAGE_KEY = "pb-motion";

const listeners = new Set<() => void>();

export function readMotionPreference(): MotionPreference {
  try {
    return localStorage.getItem(MOTION_STORAGE_KEY) === "off" ? "off" : "on";
  } catch {
    // Storage blocked (private mode, policy): fall back to the page state.
    return document.documentElement.dataset.motion === "off" ? "off" : "on";
  }
}

function persist(preference: MotionPreference): void {
  try {
    if (preference === "off") localStorage.setItem(MOTION_STORAGE_KEY, "off");
    else localStorage.removeItem(MOTION_STORAGE_KEY);
  } catch {
    // Not persisted; it still applies for this page view.
  }
}

export function writeMotionPreference(preference: MotionPreference): void {
  persist(preference);
  if (preference === "off") document.documentElement.dataset.motion = "off";
  else delete document.documentElement.dataset.motion;
  listeners.forEach((listener) => listener());
}

export function subscribeMotionPreference(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Inline <head> script: applies a stored "off" before first paint so scroll
 * reveals never flash. Kept tiny; its hash is added to each page's CSP.
 */
export const MOTION_BOOT_SCRIPT = `try{if(localStorage.getItem("${MOTION_STORAGE_KEY}")==="off")document.documentElement.dataset.motion="off"}catch(e){}`;
