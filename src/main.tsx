import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { StorageProvider } from './context/StorageContext.tsx'
import { EntriesProvider } from './context/EntriesContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StorageProvider>
      <EntriesProvider>
        <App />
      </EntriesProvider>
    </StorageProvider>
  </StrictMode>,
)
