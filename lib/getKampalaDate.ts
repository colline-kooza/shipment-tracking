/**
 * Gets the current date and time in Kampala/Africa timezone
 * in the format: YYYY-MMM-DD HH:MM:SS (e.g., 2025-Feb-23 22:21:16)
 *
 * @returns {string} Formatted date and time string
 */
export function getKampalaDateTime(): string {
  // Create a date object with the current time
  const now = new Date();

  // Format the date for East Africa Time (EAT) / Kampala timezone (UTC+3)
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Africa/Kampala",
    hour12: false, // Use 24-hour format
  };

  // Get the date components using the Kampala timezone
  const formatter = new Intl.DateTimeFormat("en-US", {
    ...options,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });

  const parts = formatter.formatToParts(now);
  const dateValues: Record<string, string> = {};

  // Extract the different parts of the date
  parts.forEach((part) => {
    dateValues[part.type] = part.value;
  });

  // Get month as abbreviated text (Jan, Feb, etc.)
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthIndex = parseInt(dateValues.month, 10) - 1;
  const monthAbbr = monthNames[monthIndex];

  // Format the final string in the required format
  return `${dateValues.year}-${monthAbbr}-${dateValues.day.padStart(2, "0")} ${dateValues.hour.padStart(
    2,
    "0"
  )}:${dateValues.minute.padStart(2, "0")}:${dateValues.second.padStart(
    2,
    "0"
  )}`;
}
