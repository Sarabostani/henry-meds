import moment from "moment";

/**
 * Divides a time range into 15-minute intervals.
 *
 * @param startTime - The start time in the format 'HH:mm'
 * @param endTime - The end time in the format 'HH:mm'
 * @returns An array of time intervals in the format 'HH:mm'
 */
export function divideTimeRange(startTime: string, endTime: string): string[] {
  const intervals: string[] = [];
  const start = moment(startTime, "HH:mm");
  const end = moment(endTime, "HH:mm");

  // Ensure start time is before end time
  if (start.isAfter(end)) {
    throw new Error("Start time must be before end time");
  }

  while (start.isBefore(end)) {
    intervals.push(start.format("HH:mm"));
    start.add(15, "minutes");
  }

  // Add the end time to the intervals array if it's not already included
  if (!intervals.includes(end.format("HH:mm"))) {
    intervals.push(end.format("HH:mm"));
  }

  return intervals;
}
