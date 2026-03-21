const STORAGE_KEY = "driveease_api_key";
const ALERT_TYPE_KEY = "driveease_alert_type";

export const DEFAULT_API_KEY =
  "si_oUku_5_hjQmk.R6ox6+yV52ZgWBJtJ+U39LofY0LKLVW9poaqT3EDoY4x";

// Maps / Geocoding API key (LocationIQ)
export const MAPS_API_KEY = "12fe02cf73a21d19d48b1de8af073ab6";

// LocationIQ tile URL for Leaflet maps
export const LOCATIONIQ_TILE_URL = `https://{s}-tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key=${MAPS_API_KEY}`;

// LocationIQ geocoding base URL
export const LOCATIONIQ_GEOCODE_URL = `https://us1.locationiq.com/v1/search?key=${MAPS_API_KEY}&format=json`;
export const LOCATIONIQ_REVERSE_URL = `https://us1.locationiq.com/v1/reverse?key=${MAPS_API_KEY}&format=json`;

export function getApiKey(): string {
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_API_KEY;
}

export function setApiKey(key: string): void {
  localStorage.setItem(STORAGE_KEY, key);
}

export type AlertType = "push" | "sms" | "whatsapp";

export function getAlertType(): AlertType {
  return (localStorage.getItem(ALERT_TYPE_KEY) as AlertType) || "push";
}

export function setAlertType(type: AlertType): void {
  localStorage.setItem(ALERT_TYPE_KEY, type);
}
