import { Box } from '@chakra-ui/react';

export const InnerHTMLWidget = (html: string) => {
  return (
    <Box
      color={'#7A7A7A'}
      fontSize="12px"
      lineHeight={'14px'}
      css={{
        '.chakra-text': {
          marginTop: 0,
          marginBottom: '8px'
        }
      }}
      mb={2}
      dangerouslySetInnerHTML={{ __html: html }}
    ></Box>
  );
};
