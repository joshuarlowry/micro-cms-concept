import React from 'react'
import ReactDOM from 'react-dom/client'
import { ContentProvider } from './context/ContentContext'
import App from './App.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ContentProvider>
      <App />
    </ContentProvider>
  </React.StrictMode>,
)
