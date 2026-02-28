import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthAwareStorageProvider } from './context/StorageContext.tsx'
import { EntriesProvider } from './context/EntriesContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthAwareStorageProvider>
      <EntriesProvider>
        <App />
      </EntriesProvider>
    </AuthAwareStorageProvider>
  </StrictMode>,
)
