/** Client device/browser hints for FCM token registration. */
export function getFcmDeviceInfo() {
  if (typeof navigator === "undefined") {
    return { device: "unknown", browser: "unknown" };
  }

  const ua = navigator.userAgent;
  const device = /Mobile|Android|iPhone|iPad|iPod/i.test(ua) ? "mobile" : "desktop";

  let browser = "unknown";
  if (ua.includes("Edg/")) browser = "Edge";
  else if (ua.includes("Chrome/")) browser = "Chrome";
  else if (ua.includes("Firefox/")) browser = "Firefox";
  else if (ua.includes("Safari/") && !ua.includes("Chrome")) browser = "Safari";

  return { device, browser };
}
