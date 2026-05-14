import { createTheme } from '@mui/material'

// Aici definim culorile și fonturile pentru TOATĂ aplicația
const theme = createTheme({
    palette: {
        background: {
            default: '#F7F3EE',   // crem deschis - fundalul paginilor
            paper: '#FFFCF8',     // crem foarte deschis - carduri, formulare
        },
        primary: {
            main: '#8B7355',      // maro cald - butoane principale, accente
            light: '#A68B5B',
            dark: '#6B5940',
        },
        secondary: {
            main: '#7A9E7E',      // verde salvie - accente secundare
        },
        text: {
            primary: '#2C2416',   // maro închis - text principal
            secondary: '#6B5E4E', // maro mediu - text secundar
        },
    },
    typography: {
        fontFamily: '"Cormorant Garamond", "Georgia", serif', // font elegant serif
        h4: { fontWeight: 600, letterSpacing: '0.02em' },
        h5: { fontWeight: 600 },
        button: {
            fontFamily: '"Lato", sans-serif',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontSize: '0.8rem',
        },
        body1: { fontFamily: '"Lato", sans-serif', fontSize: '0.95rem' },
        body2: { fontFamily: '"Lato", sans-serif' },
    },
    shape: {
        borderRadius: 4, // colțuri ușor rotunjite, nu prea mult
    },
    components: {
        // Stilizare globală pentru TextField (câmpurile de input)
        MuiTextField: {
            defaultProps: { variant: 'outlined' },
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        backgroundColor: '#FFFCF8',
                        '& fieldset': { borderColor: '#D4C5B0' },
                        '&:hover fieldset': { borderColor: '#8B7355' },
                    },
                },
            },
        },
        // Stilizare pentru Button
        MuiButton: {
            styleOverrides: {
                containedPrimary: {
                    backgroundColor: '#8B7355',
                    '&:hover': { backgroundColor: '#6B5940' },
                    boxShadow: 'none',
                    padding: '10px 0',
                },
            },
        },
        // Stilizare pentru Paper (carduri, formulare)
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    boxShadow: '0 2px 20px rgba(139, 115, 85, 0.08)',
                    border: '1px solid #EDE5D8',
                },
            },
        },
    },
})

export default theme