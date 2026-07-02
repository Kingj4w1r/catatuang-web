import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ── Spotify Design System tokens ─────────────────────────────
      colors: {
        // Brand
        spgreen:  '#1ed760',   // Spotify Green — functional only
        'spgreen-border': '#1db954',

        // Surfaces (near-black stack)
        sp0:  '#121212',   // deepest background
        sp1:  '#181818',   // cards / sidebar / containers
        sp2:  '#1f1f1f',   // button bg / interactive surfaces
        sp3:  '#252525',   // elevated card
        sp4:  '#272727',   // alternate card

        // Text
        'sp-white':  '#ffffff',
        'sp-silver': '#b3b3b3',   // secondary / inactive
        'sp-near':   '#cbcbcb',   // slightly brighter secondary
        'sp-light':  '#fdfdfd',   // maximum emphasis

        // Semantic
        'sp-neg':   '#f3727f',   // error / negative
        'sp-warn':  '#ffa42b',   // warning
        'sp-info':  '#539df5',   // announcement / info

        // Borders / dividers
        'sp-border': '#4d4d4d',  // button border on dark
        'sp-lborder':'#7c7c7c',  // outlined button, muted link
        'sp-sep':    '#b3b3b3',  // divider lines
        'sp-light-surface': '#eeeeee',  // rare light mode
      },

      fontFamily: {
        spotify: [
          'SpotifyMixUI',
          'CircularSp-Arab', 'CircularSp-Hebr', 'CircularSp-Cyrl',
          'CircularSp-Grek', 'CircularSp-Deva', 'Helvetica Neue',
          'helvetica', 'arial', 'Hiragino Sans', 'sans-serif',
        ],
        'spotify-title': [
          'SpotifyMixUITitle',
          'CircularSp-Arab', 'CircularSp-Hebr', 'CircularSp-Cyrl',
          'CircularSp-Grek', 'CircularSp-Deva', 'Helvetica Neue',
          'helvetica', 'arial', 'Hiragino Sans', 'sans-serif',
        ],
      },

      fontSize: {
        'sp-section': ['24px', { lineHeight: 'normal', fontWeight: '700' }],
        'sp-feature': ['18px', { lineHeight: '1.30', fontWeight: '600' }],
        'sp-body-bold': ['16px', { lineHeight: 'normal', fontWeight: '700' }],
        'sp-body':      ['16px', { lineHeight: 'normal', fontWeight: '400' }],
        'sp-btn-upper': ['14px', { lineHeight: '1.00', letterSpacing: '1.4px', fontWeight: '700' }],
        'sp-btn':       ['14px', { lineHeight: 'normal', letterSpacing: '0.14px', fontWeight: '700' }],
        'sp-nav-bold':  ['14px', { lineHeight: 'normal', fontWeight: '700' }],
        'sp-nav':       ['14px', { lineHeight: 'normal', fontWeight: '400' }],
        'sp-cap-bold':  ['14px', { lineHeight: '1.50', fontWeight: '700' }],
        'sp-cap':       ['14px', { lineHeight: 'normal', fontWeight: '400' }],
        'sp-sm-bold':   ['12px', { lineHeight: '1.50', fontWeight: '700' }],
        'sp-sm':        ['12px', { lineHeight: 'normal', fontWeight: '400' }],
        'sp-badge':     ['10.5px', { lineHeight: '1.33', fontWeight: '600' }],
        'sp-micro':     ['10px', { lineHeight: 'normal', fontWeight: '400' }],
      },

      borderRadius: {
        'sp-min': '2px',
        'sp-sub': '4px',
        'sp-std': '6px',
        'sp-card': '8px',
        'sp-med': '12px',
        'sp-lg':  '100px',
        'sp-pill':'500px',
        'sp-full':'9999px',
        'sp-circle': '50%',
      },

      boxShadow: {
        'sp-heavy': '0px 8px 24px rgba(0,0,0,0.5)',
        'sp-med':   '0px 8px 8px rgba(0,0,0,0.3)',
        'sp-inset': 'rgb(18,18,18) 0px 1px 0px, rgb(124,124,124) 0px 0px 0px 1px inset',
        'sp-dialog':'0px 8px 24px rgba(0,0,0,0.5)',
      },

      keyframes: {
        'sp-fade-up':   { '0%':{ opacity:'0', transform:'translateY(12px)' }, '100%':{ opacity:'1', transform:'translateY(0)' } },
        'sp-fade-in':   { '0%':{ opacity:'0' }, '100%':{ opacity:'1' } },
        'sp-scale-in':  { '0%':{ opacity:'0', transform:'scale(0.96)' }, '100%':{ opacity:'1', transform:'scale(1)' } },
        'sp-modal-in':  { '0%':{ opacity:'0', transform:'scale(0.95) translateY(8px)' }, '100%':{ opacity:'1', transform:'scale(1) translateY(0)' } },
        'sp-slide-in':  { '0%':{ opacity:'0', transform:'translateX(-12px)' }, '100%':{ opacity:'1', transform:'translateX(0)' } },
        'sp-pulse':     { '0%,100%':{ opacity:'1' }, '50%':{ opacity:'0.6' } },
      },
      animation: {
        'sp-fade-up':  'sp-fade-up 0.35s ease-out forwards',
        'sp-fade-in':  'sp-fade-in 0.2s ease-out forwards',
        'sp-scale-in': 'sp-scale-in 0.25s ease-out forwards',
        'sp-modal-in': 'sp-modal-in 0.25s ease-out forwards',
        'sp-slide-in': 'sp-slide-in 0.3s ease-out forwards',
        'sp-pulse':    'sp-pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
export default config
