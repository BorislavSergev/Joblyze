import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './components/Home'
import Analyze from './components/Analyze'
import About from './components/About'
import Templates from './components/Templates'
import Auth from './components/Auth'
import Register from './components/Register'
import Profile from './components/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#f8f9fb] via-white to-[#f8f9fb]">
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 xl:py-20">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/analyze"
                element={(
                  <ProtectedRoute>
                    <Analyze />
                  </ProtectedRoute>
                )}
              />
              <Route path="/about" element={<About />} />
              <Route
                path="/profile"
                element={(
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/templates"
                element={(
                  <ProtectedRoute>
                    <Templates />
                  </ProtectedRoute>
                )}
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
