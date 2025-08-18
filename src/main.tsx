import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { applySecurityMeta, enhanceSessionSecurity } from './lib/security-headers'
import './lib/replace-console-logs'

// Apply security enhancements
applySecurityMeta();
enhanceSessionSecurity();

createRoot(document.getElementById("root")!).render(<App />)