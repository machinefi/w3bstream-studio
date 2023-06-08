import { ValueState } from '@/store/standard/base';
import { Select, SelectProps } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { SelectBox, SelectBoxItem } from '@tremor/react';
export interface TimeRangePick {
  props?: SelectProps;
  value: any;
  onChange: (step: string) => void;
}

export const TimeRangePick = observer(({ props, value, onChange }: TimeRangePick) => {
  return (
    <div className="max-w-sm  space-y-3">
      <SelectBox
        className="w-4"
        defaultValue={value}
        onValueChange={(v) => {
          onChange(v);
        }}
      >
        <SelectBoxItem value="hour" text="Hourly" />
        <SelectBoxItem value="day" text="Daily" />
        <SelectBoxItem value="week" text="Weekly" />
        <SelectBoxItem value="month" text="Monthly" />
      </SelectBox>
    </div>
  );
});
