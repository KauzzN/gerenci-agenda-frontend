import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import "./styles/toast.css"

import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
 <>
        <App />
        <Toaster
            position="center"
            reverseOrder={false}
            guitter={10}
            toastOptions={{
                duration: 3000,
                className: "go-toast",

                success: {
                  className: "go-toast go-toast-success",
                },

                error: {
                  className: "go-toast go-toast-error",
                }
            }}
        />
    </>
)