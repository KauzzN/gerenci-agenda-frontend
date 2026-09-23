import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './pages/Login_Page.jsx';
import Register from './pages/Register_page.jsx';
import Dashboard from './pages/Dashboard_page.jsx';
import PrivateRoute from './routes/PrivateRoute.jsx'
import './App.css'
import PublicPage from './pages/Public_Page/Public_page.jsx';
import SettingsPage from "./pages/SettingsPage.jsx";
import ServicesPage from "./pages/ServicesPage.jsx";
import ClientsPage from "./pages/ClientsPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path='/book/:slug'  element={<PublicPage />}/>
        <Route path="/configuracoes" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
        <Route path="/servicos" element={<PrivateRoute><ServicesPage /></PrivateRoute>} />
        <Route path="/clientes" element={<PrivateRoute><ClientsPage /></PrivateRoute>} />
        <Route path="/historico" element={<PrivateRoute><HistoryPage /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
