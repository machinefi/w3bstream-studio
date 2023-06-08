import { ValueState } from '@/store/standard/base';
// import { Select, SelectProps } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { Select, SelectItem, SelectProps } from '@tremor/react';

export interface TimeRangePick {
  props?: SelectProps;
  value: any;
  onChange: (step: string) => void;
}

export const TimeRangePick = observer(({ props, value, onChange }: TimeRangePick) => {
  return (
    <div className="max-w-sm  space-y-3">
      <Select
        className="w-4"
        defaultValue={value}
        onValueChange={(v) => {
          onChange(v);
        }}
      >
        <SelectItem value="hour">Hourly</SelectItem>
        <SelectItem value="day">Daily</SelectItem>
        <SelectItem value="week">Weekly</SelectItem>
        <SelectItem value="month">Monthly</SelectItem>
      </Select>
    </div>
  );
});
