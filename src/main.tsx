import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { applySecurityMeta } from './lib/security-headers'

// Apply security meta tags only
applySecurityMeta();

createRoot(document.getElementById("root")!).render(<App />)