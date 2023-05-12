import { observer } from 'mobx-react-lite';
import { ScrollMenu, VisibilityContext } from 'react-horizontal-scrolling-menu';
import 'react-horizontal-scrolling-menu/dist/styles.css';
import usePreventBodyScroll from './usePreventBodyScroll';
import { Box } from '@chakra-ui/react';

type scrollVisibilityApiType = React.ContextType<typeof VisibilityContext>;

type IProps = {
  children?: any;
  w: string;
};

function onWheel(apiObj: scrollVisibilityApiType, ev: React.WheelEvent): void {
  const isThouchpad = Math.abs(ev.deltaX) !== 0 || Math.abs(ev.deltaY) < 15;
  if (isThouchpad) {
    ev.stopPropagation();
    return;
  }

  if (ev.deltaY < 0) {
    apiObj.scrollNext();
  } else if (ev.deltaY > 0) {
    apiObj.scrollPrev();
  }
}

export const HorizontalScrollBox = observer((props: IProps) => {
  const { disableScroll, enableScroll } = usePreventBodyScroll();
  return (
    <Box onMouseEnter={disableScroll} onMouseLeave={enableScroll} w={props.w}>
      <ScrollMenu onWheel={onWheel}>{props.children}</ScrollMenu>
    </Box>
  );
});
