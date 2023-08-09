import { Tooltip, Text, CopyButton, ActionIcon } from '@mantine/core';
import { observer, useLocalStore } from 'mobx-react-lite';
import { IconCheck, IconCopy } from '@tabler/icons';
import { Box } from '@chakra-ui/react';
import copy from 'copy-to-clipboard';

interface IProps {
  value: string;
}
export const Copy = observer(({ value }: IProps) => {
  const store = useLocalStore(() => ({
    isIOTipOpen: false,
    toggleIOTipOpen(val: boolean) {
      this.isTipOpen = val;
    }
  }));

  return (
    <Box
      onClick={async (e) => {
        copy(value)
      }}
    >
      <CopyButton value={value} timeout={2000}>
        {({ copied, copy }) => (
          <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="top">
            <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy}>
              {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
            </ActionIcon>
          </Tooltip>
        )}
      </CopyButton>
    </Box>
  );
});
