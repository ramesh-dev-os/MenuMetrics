import React from 'react'
import { Route , Routes } from "react-router-dom"
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

const App = () => {
  return (
    <div>
        <Routes>
            {/* Auth Routes */}
            <Route path='/' element={<LoginPage />} />
            <Route path='/register' element={<RegisterPage />} />
            {/* User Routes */}
            {/* Admin Routes */}
        </Routes>
    </div>
  )
}

export default App