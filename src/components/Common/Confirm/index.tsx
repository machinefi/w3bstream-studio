import React, { cloneElement } from 'react';
import { Portal, Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverBody, PopoverFooter, PopoverArrow, PopoverCloseButton, Button, ButtonGroup } from '@chakra-ui/react';
import { observer, useLocalObservable } from 'mobx-react-lite';
export * from './ConfirmModal';


export interface OpenState {
  isOpen: boolean;
  toggleOpen: (isOpen: boolean) => void;
}

export interface ConfirmProps {
  title?: string;
  description?: string;
  trigger?: React.ReactElement;
  onOk?: () => any;
  onCancel?: () => any;
  cancelText?: string;
  okText?: string;
  openState?: OpenState;
}

export const Confirm = observer((props: ConfirmProps) => {
  const { title, description, trigger, okText, cancelText  } = props;
  const openState = props.openState || useLocalObservable(() => ({
    isOpen: false,
    toggleOpen(val: boolean) {
      this.isOpen = val;
    }
  }));

  const triggerClone = cloneElement(trigger, {
    onClick: (e: MouseEvent) => {
      openState.toggleOpen(true);
      e.stopPropagation();
      e.preventDefault();
    }
  });

  const handleApply = async (e) => {
    try {
      const res = await trigger.props?.onClick(e);
      if (res !== false) {
        openState.toggleOpen(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Popover isOpen={openState.isOpen} onClose={() => openState.toggleOpen(false)} placement="bottom-end" closeOnBlur={true}>
        <PopoverTrigger>{triggerClone}</PopoverTrigger>
        <Portal>
          <PopoverContent>
            <PopoverHeader fontWeight="semibold">{title}</PopoverHeader>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverBody>{description}</PopoverBody>
            <PopoverFooter display="flex" justifyContent="flex-end">
              <ButtonGroup size="sm">
                <Button variant="outline" onClick={() => openState.toggleOpen(false)}>
                  {cancelText || 'Cancel'}
                </Button>
                <Button colorScheme="red" onClick={handleApply}>
                  {okText || 'Apply'}
                </Button>
              </ButtonGroup>
            </PopoverFooter>
          </PopoverContent>
        </Portal>
      </Popover>
    </>
  );
});
