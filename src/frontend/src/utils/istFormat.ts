// Converts any date/timestamp to IST format: "DD-MM-YYYY hh:mm:ss AM/PM IST"
export function formatIST(input?: string | number | Date): string {
  const date = input ? new Date(input) : new Date();
  // Convert to IST (UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(date.getTime() + istOffset);
  const dd = String(istTime.getUTCDate()).padStart(2, "0");
  const mm = String(istTime.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = istTime.getUTCFullYear();
  let hh = istTime.getUTCHours();
  const min = String(istTime.getUTCMinutes()).padStart(2, "0");
  const sec = String(istTime.getUTCSeconds()).padStart(2, "0");
  const ampm = hh >= 12 ? "PM" : "AM";
  hh = hh % 12 || 12;
  return `${dd}-${mm}-${yyyy} ${String(hh).padStart(2, "0")}:${min}:${sec} ${ampm} IST`;
}
