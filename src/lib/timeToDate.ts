export default function timeToDate(timeStr: string | null | undefined) {
  if (!timeStr) return null;

  const [hourStr, minuteStr] = timeStr.split(":");

  const hour = Number(hourStr);
  const minute = Number(minuteStr);

  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;

  // Create a UTC date so timezone doesn't shift the time
  return new Date(Date.UTC(1970, 0, 1, hour, minute, 0));
}