import { helper } from '@/lib/helper';
import { Box, Flex } from '@chakra-ui/react';
import { Copy } from '../Copy';

type IProps = {
  fullString: string;
  strLen?: number;
  showCopyButton?: boolean;
};

export const TruncateStringWithCopy = ({ fullString, showCopyButton = true, strLen = 8 }: IProps) => {
  return (
    <Flex alignItems={'center'}>
      <Box>{helper.string.truncate(fullString, strLen, '...')}</Box>
      {showCopyButton && <Copy value={fullString} />}
    </Flex>
  );
};
