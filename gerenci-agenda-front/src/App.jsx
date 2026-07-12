import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './pages/Login_Page.jsx';
import Register from './pages/Register_page.jsx';
import Dashboard from './pages/Dashboard_page.jsx';
import PrivateRoute from './routes/PrivateRoute.jsx'
import './App.css'
import PublicPage from './pages/Public_Page/Public_page.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path='/book/'  element={PublicPage}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
