import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import UTC from 'dayjs/plugin/utc';

dayjs.extend(relativeTime);
dayjs.extend(UTC);

export const millisecondsToSeconds = (milliseconds: number) => {
  const millisecondsStr = String(milliseconds);
  return Number(millisecondsStr.substring(0, millisecondsStr.length - 3));
};

export default dayjs;
