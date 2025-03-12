import React from 'react'
import { Route , Routes } from "react-router-dom"
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MultiFactorAuth from './pages/MultiFactorAuth'
import LandingPage from './pages/LandingPage'

const App = () => {
  return (
    <div>
        <Routes>
            {/* Auth Routes */}
            <Route path='/' element={<LoginPage />} />
            <Route path='/register' element={<RegisterPage />} />
            <Route path='/2fa' element={<MultiFactorAuth />} />
            {/* User Routes */}
            <Route path='/home' element={<LandingPage />} />
            {/* Admin Routes */}
        </Routes>
    </div>
  )
}

export default App