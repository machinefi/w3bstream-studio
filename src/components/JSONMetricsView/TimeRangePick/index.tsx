import { Select, SelectProps } from '@chakra-ui/react';

export interface TimeRangePick {
  props?: SelectProps;
  onChange: (startTime: Date, endTime: Date, step: number) => void;
}

export const TimeRangePick = ({ props = {}, onChange }: { props?: SelectProps; onChange: (startTime: Date, endTime: Date, step: number) => void }) => {
  return (
    <Select
      size="sm"
      w="200px"
      outline="none"
      borderColor="#9d7cfc"
      _hover={{ borderColor: '#9d7cfc' }}
      {...props}
      onChange={(e) => {
        const v = e.target.value;
        const now = new Date();
        now.setMinutes(0);
        now.setSeconds(0);
        now.setMilliseconds(0);
        switch (v) {
          case '1':
            onChange(new Date(now.getTime() - 24 * 60 * 60 * 1000), now, 3600);
            break;
          case '2':
            onChange(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), now, 3600 * 6);
            break;
          case '3':
            onChange(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), now, 3600 * 24);
            break;
          default:
            break;
        }
      }}
    >
      <option value="1">One Day</option>
      <option value="2">One Week</option>
      <option value="3">One Month</option>
    </Select>
  );
};
