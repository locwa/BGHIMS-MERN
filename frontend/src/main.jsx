import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";

import './index.css'
import { AuthProvider } from "./contexts/AuthContext.jsx";

import Login from "./pages/Login.jsx"
import Home from "./pages/Home.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <AuthProvider>
          <BrowserRouter>
              <Routes>
                  <Route path="/" element={<Login />}/>
                  <Route path="/home" element={
                      <ProtectedRoute>
                          <Home />
                      </ProtectedRoute>
                  }/>
              </Routes>
          </BrowserRouter>
      </AuthProvider>
  </StrictMode>,
)
