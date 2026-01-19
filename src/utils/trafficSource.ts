// Storage keys
const TRAFFIC_SOURCE_KEY = "traffic_source";
const SESSION_ID_COOKIE = "srm_session_id";

/**
 * Generate a UUID using native crypto API
 */
function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface TrafficSourceData {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  landing_page: string;
  referrer: string;
  first_visit_at: string;
  session_id: string;
}

/**
 * Parse UTM parameters from URL
 */
export function parseUtmParams(): Partial<TrafficSourceData> {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);

  return {
    utm_source: params.get("utm_source") || undefined,
    utm_medium: params.get("utm_medium") || undefined,
    utm_campaign: params.get("utm_campaign") || undefined,
    utm_content: params.get("utm_content") || undefined,
    utm_term: params.get("utm_term") || undefined,
  };
}

/**
 * Detect source from referrer URL (fallback when no UTM params)
 */
export function detectSourceFromReferrer(referrer: string): string {
  if (!referrer) return "direct";

  const referrerLower = referrer.toLowerCase();

  if (
    referrerLower.includes("facebook.com") ||
    referrerLower.includes("fb.com")
  ) {
    return "facebook";
  }
  if (
    referrerLower.includes("google.com") ||
    referrerLower.includes("google.")
  ) {
    return "google";
  }
  if (
    referrerLower.includes("youtube.com") ||
    referrerLower.includes("youtu.be")
  ) {
    return "youtube";
  }
  if (referrerLower.includes("tiktok.com")) {
    return "tiktok";
  }
  if (referrerLower.includes("instagram.com")) {
    return "instagram";
  }
  if (
    referrerLower.includes("twitter.com") ||
    referrerLower.includes("x.com")
  ) {
    return "twitter";
  }

  return "referral";
}

/**
 * Get session ID from cookie or create new one
 */
export function getSessionId(): string {
  if (typeof window === "undefined") return "";

  // Try to get from cookie first
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === SESSION_ID_COOKIE) {
      return value;
    }
  }

  // Generate new session ID
  const sessionId = generateUUID();

  // Save to cookie (expires in 30 days)
  const expires = new Date();
  expires.setDate(expires.getDate() + 30);
  document.cookie = `${SESSION_ID_COOKIE}=${sessionId}; expires=${expires.toUTCString()}; path=/`;

  return sessionId;
}

/**
 * Get traffic source from localStorage
 */
export function getTrafficSource(): TrafficSourceData | null {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem(TRAFFIC_SOURCE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Save traffic source to localStorage (only if not exists - first-touch)
 */
export function saveTrafficSource(data: TrafficSourceData): void {
  if (typeof window === "undefined") return;

  // Only save if not already exists (first-touch attribution)
  const existing = localStorage.getItem(TRAFFIC_SOURCE_KEY);
  if (!existing) {
    localStorage.setItem(TRAFFIC_SOURCE_KEY, JSON.stringify(data));
  }
}

/**
 * Get or create traffic source data
 * This is the main function to call on page load
 */
export function getOrCreateTrafficSource(): TrafficSourceData {
  if (typeof window === "undefined") {
    return {
      utm_source: "direct",
      utm_medium: "",
      utm_campaign: "",
      utm_content: "",
      utm_term: "",
      landing_page: "",
      referrer: "",
      first_visit_at: new Date().toISOString(),
      session_id: "",
    };
  }

  // Check if already exists in localStorage
  const existing = getTrafficSource();
  if (existing) {
    // Update session_id for this visit (new session, same traffic source)
    const sessionId = getSessionId();
    return {
      ...existing,
      session_id: sessionId,
    };
  }

  // Parse UTM from URL
  const utmParams = parseUtmParams();
  const sessionId = getSessionId();
  const referrer = document.referrer || "";

  // Determine UTM source
  let utmSource = utmParams.utm_source || "";
  if (!utmSource) {
    utmSource = detectSourceFromReferrer(referrer);
  }

  const trafficSource: TrafficSourceData = {
    utm_source: utmSource,
    utm_medium: utmParams.utm_medium || "",
    utm_campaign: utmParams.utm_campaign || "",
    utm_content: utmParams.utm_content || "",
    utm_term: utmParams.utm_term || "",
    landing_page: window.location.pathname,
    referrer: referrer,
    first_visit_at: new Date().toISOString(),
    session_id: sessionId,
  };

  // Save to localStorage (first-touch)
  saveTrafficSource(trafficSource);

  return trafficSource;
}

/**
 * Build share URL with UTM parameters
 */
export function buildShareUrl(
  baseUrl: string,
  source: "facebook" | "youtube" | "tiktok",
  campaign?: string,
): string {
  const url = new URL(baseUrl);
  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", "social");
  url.searchParams.set("utm_campaign", campaign || "share");
  url.searchParams.set("utm_content", `${source}_share`);

  return url.toString();
}
