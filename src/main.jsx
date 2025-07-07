import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { UserProvider } from './context/UserContext'
import { ThemeProvider } from './context/ThemeContext'
import { Toaster } from 'react-hot-toast'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/LIGHTING-MAP_admin-platform">
      <ThemeProvider>
        <UserProvider>
          <App />
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'glass-toast',
              duration: 4000,
              style: {
                background: 'rgba(15, 23, 42, 0.8)',
                color: '#fff',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
              },
            }}
          />
        </UserProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)
