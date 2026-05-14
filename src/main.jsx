import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import theme from './theme.js'

// Importăm fonturile Google direct în JS
import '@fontsource/lato/400.css'
import '@fontsource/lato/700.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        {/* ThemeProvider aplică tema noastră crem la toată aplicația */}
        <ThemeProvider theme={theme}>
            {/* AuthProvider ține minte dacă ești logat sau nu */}
            <AuthProvider>
                {/* CssBaseline resetează stilurile implicite ale browserului */}
                <CssBaseline />
                <App />
            </AuthProvider>
        </ThemeProvider>
    </BrowserRouter>
)