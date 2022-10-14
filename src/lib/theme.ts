import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

export const gradientButtonStyle = {
  bg: 'linear-gradient(93.42deg, #6FB2FF 2.82%, #946FFF 97.18%)',
  color: '#fff',
  borderRadius: 'base',
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
  colors: {
    discord: '#7289da',
    dark: {
      100: 'rgba(255, 255, 255, 0.08)',
      200: 'rgba(255, 255, 255, 0.16)',
      300: 'rgba(255, 255, 255, 0.24)',
      400: 'rgba(255, 255, 255, 0.32)'
    }
  },
  shadows: {
    largeSoft: 'rgba(60, 64, 67, 0.15) 0px 2px 10px 6px;'
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: 12
      }
    }
  },
  fontSizes: {
    md: '0.9rem'
  },
  styles: {
    global: {
      html: {
        height: '100%',
        scrollBehavior: 'smooth'
      },
      '#__next': {
        display: 'flex',
        flexDirection: 'column'
      },
      '.body': {
        overflowY: 'scroll' // Always show scrollbar to avoid flickering
      },
      '.preview': {
        border: 'none'
      }
    }
  }
});
