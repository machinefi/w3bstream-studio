import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

export const defaultButtonStyle = {
  bg: '#946FFF',
  color: '#fff',
  _hover: { background: '#9d7cfc' },
  _active: {
    background: '#8e68fc'
  }
};

export const defaultOutlineButtonStyle = {
  variant: 'outline',
  borderColor: '#946FFF',
  color: '#946FFF',
  _hover: { background: '#9d7cfc', color: '#fff' },
  _active: {
    background: '#8e68fc'
  }
};

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
  shadows: {
    largeSoft: 'rgba(60, 64, 67, 0.15) 0px 2px 10px 6px;'
  },
  components: {
    Text: {
      baseStyle: {
        letterSpacing: "-0.020625rem",
        fontweight: "400",
      }
    }
  }
});
