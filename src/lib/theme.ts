import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

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
      '.preview':{
        border:'none'
      }
    }
  }
});
