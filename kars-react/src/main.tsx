import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { FavoritesProvider } from './hooks/useFavorites'
import { ToastProvider } from './hooks/use-toast'

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
