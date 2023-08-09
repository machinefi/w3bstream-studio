import { Tooltip, Text, CopyButton, ActionIcon } from '@mantine/core';
import { observer, useLocalStore } from 'mobx-react-lite';
import { IconCheck, IconCopy } from '@tabler/icons';
import { Box } from '@chakra-ui/react';
import copy from 'copy-to-clipboard';
import { FiExternalLink } from 'react-icons/fi';

interface IProps {
  link: string;
  tooltipLabel: string;
}
export const ExternalLink = observer(({ link, tooltipLabel }: IProps) => {
  return (
    <Box
      onClick={async (e) => {
        window.open(link);
      }}
    >
      <Tooltip label={tooltipLabel} withArrow position="top">
        <Box borderRadius={'4px'} p={1.5} _hover={{ bg: 'rgba(248, 249, 250, 1)' }}>
          <FiExternalLink cursor={'pointer'} color="gray"  />
        </Box>
      </Tooltip>
    </Box>
  );
});
