import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

export const gradientButtonStyle = {
  bg: 'linear-gradient(93.42deg, #6FB2FF 2.82%, #946FFF 97.18%)',
  color: '#fff',
  _hover: { background: 'linear-gradient(93.42deg, rgba(111, 178, 255, 0.9) 2.82%, rgba(148, 111, 255, 0.9) 97.18%)' },
  _active: {
    background: 'linear-gradient(93.42deg, #729EDF 2.82%, #8166DE 97.18%)'
  }
};

export const theme = extendTheme({
  initialColorMode: 'light',
  useSystemColorMode: false,
  fonts: {
    body: 'Oxanium, sans-serif',
    heading: 'Oxanium, sans-serif'
  },
});
