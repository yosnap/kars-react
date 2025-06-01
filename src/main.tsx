import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './hooks/use-toast'
import { FavoritesProvider } from './hooks/useFavorites'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <FavoritesProvider>
        <AuthProvider>
    <App />
        </AuthProvider>
      </FavoritesProvider>
    </ToastProvider>
  </StrictMode>,
)
