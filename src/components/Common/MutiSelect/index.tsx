import { observer } from 'mobx-react-lite';
import Select, { Props } from 'react-select';

export const MutiSelect = observer((props: Props) => {
  return <Select {...props} isMulti />;
});
