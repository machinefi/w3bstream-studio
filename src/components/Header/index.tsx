import React from 'react';
import { Box, Flex, Container, Stack, useDisclosure, IconButton, useColorModeValue, Text } from '@chakra-ui/react';
import { CloseIcon, HamburgerIcon } from '@chakra-ui/icons';
import DesktopNav from '@/components/Header/DesktopNav';
import { observer } from 'mobx-react-lite';

const Header = observer(() => {
  const { isOpen: isMobileNavOpen, onToggle } = useDisclosure();

  return (
    <Box>
      <Flex
        as="header"
        position="fixed"
        top="0px"
        left="350px"
        zIndex="999"
        w="calc(100vw - 350px)"
        minH="60px"
        boxShadow="sm"
        justify="center"
        css={{
          backdropFilter: 'saturate(180%) blur(5px)',
          backgroundColor: useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)')
        }}
      >
        <Container as={Flex} maxW="100%" align="center">
          <Flex flex={{ base: 1, md: 'auto' }} ml={{ base: -2 }} display={{ base: 'flex', md: 'none' }}>
            <IconButton onClick={onToggle} icon={isMobileNavOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />} variant="ghost" size="sm" aria-label="Toggle Navigation" />
          </Flex>
          <Text fontSize="2xl" fontWeight={600}>Welcome to W3bstream!</Text>
          <Stack direction="row" align="center" spacing={2} flex={{ base: 1, md: 'auto' }} justify="flex-end">
            <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
              <DesktopNav />
            </Flex>
          </Stack>
        </Container>
      </Flex>
    </Box>
  );
});

export default Header;
