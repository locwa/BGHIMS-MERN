import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";

import './index.css'
import { AuthProvider } from "./contexts/AuthContext.jsx";

import Login from "./pages/Login.jsx"
import Home from "./pages/Home.jsx";
import Inventory from "./pages/Inventory.jsx"
import AddOrRemove from "./pages/AddOrRemove.jsx"
import GenerateReport from "./pages/GenerateReport.jsx"

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
                  <Route path="/inventory" element={
                      <ProtectedRoute>
                          <Inventory />
                      </ProtectedRoute>
                  }/>
                  <Route path="/add-or-remove" element={
                      <ProtectedRoute>
                          <AddOrRemove />
                      </ProtectedRoute>
                  }/>
                  <Route path="/generate-report" element={
                      <ProtectedRoute>
                        <GenerateReport />
                      </ProtectedRoute>
                  }/>
              </Routes>
          </BrowserRouter>
      </AuthProvider>
  </StrictMode>,
)
