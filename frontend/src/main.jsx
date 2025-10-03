import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";

import './index.css'
import { AuthProvider } from "./contexts/AuthContext.jsx";

import Login from "./pages/Login.jsx"
import Dashboard from "./pages/Dashboard.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <AuthProvider>
          <BrowserRouter>
              <Routes>
                  <Route path="/" element={<Login />}/>
                  <Route path="/dashboard" element={<Dashboard />}/>
              </Routes>
          </BrowserRouter>
      </AuthProvider>
  </StrictMode>,
)
