import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css';
import App from './App.jsx'
import "./styles/variables.css"
import "./styles/global.css"
import "./index.css"
import { Toaster } from "react-hot-toast"
import { AuthProvider } from './contexts/AuthContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <AuthProvider>
      <App />
    </AuthProvider>

    <Toaster position='center'/>
  </>
)