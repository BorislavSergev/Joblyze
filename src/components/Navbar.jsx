import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { HiHome, HiChartBar, HiInformationCircle, HiMenu, HiX as HiXIcon, HiTemplate, HiUserCircle } from 'react-icons/hi'
import { FaBrain } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'

function Navbar() {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, profile, signOut } = useAuth()
  const [avatarSrc, setAvatarSrc] = useState('')
  const avatarFallback = profile?.avatar_url || user?.user_metadata?.avatar_url || ''

  const isActive = (path) => location.pathname === path

  const navLinks = [
    { path: '/', label: 'Начало', icon: HiHome },
    { path: '/analyze', label: 'Анализиране', icon: HiChartBar },
    { path: '/templates', label: 'Шаблони', icon: HiTemplate },
    { path: '/profile', label: 'Профил', icon: HiUserCircle },
    { path: '/about', label: 'За нас', icon: HiInformationCircle }
  ]

  const handleSignOut = async () => {
    await signOut()
    setIsMobileMenuOpen(false)
  }

  useEffect(() => {
    let active = true

    const resolveAvatar = async () => {
      if (!user) {
        setAvatarSrc('')
        return
      }

      const avatarPath = profile?.avatar_path || user.user_metadata?.avatar_path
      const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url
      if (avatarUrl) {
        setAvatarSrc((prev) => prev || avatarUrl)
      }

      if (avatarPath) {
        const { data, error } = await supabase.storage.from('Users').createSignedUrl(avatarPath, 60 * 60)
        if (!active) return

        if (!error && data?.signedUrl) {
          setAvatarSrc(data.signedUrl)
          return
        }
      }

      if (avatarUrl) {
        setAvatarSrc((prev) => prev || avatarUrl)
      }
    }

    resolveAvatar()

    return () => {
      active = false
    }
  }, [user, profile])

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-2xl border-b border-[#2d3951]/5 shadow-[0_1px_3px_0_rgb(0,0,0,0.05)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 lg:h-24">
          <Link 
            to="/"
            className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-[#175bbd] to-[#175bbd]/80 rounded-xl shadow-lg shadow-[#175bbd]/20">
              <FaBrain className="text-lg sm:text-xl text-white" />
            </div>
            <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#2d3951] tracking-tight">
              Joblyze
            </span>
          </Link>

          <div className="hidden md:flex gap-4 lg:gap-6 items-center">
            {navLinks.map((link) => {
              const IconComponent = link.icon
              return (
                <Link 
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-semibold transition-all duration-300 flex items-center gap-2 px-3 py-2 rounded-lg ${
                    isActive(link.path)
                      ? 'text-[#175bbd] bg-[#175bbd]/5' 
                      : 'text-[#2d3951]/70 hover:text-[#175bbd] hover:bg-[#175bbd]/5'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              )
            })}
            {user ? (
              <div className="flex items-center gap-3">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border border-[#175bbd]/20"
                    onError={() => setAvatarSrc(avatarFallback || '')}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#175bbd]/10 text-[#175bbd] text-xs font-bold flex items-center justify-center">
                    {(profile?.username || user.user_metadata?.username || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-semibold text-[#2d3951]/60 max-w-[180px] truncate">
                  {profile?.username || user.user_metadata?.username || user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-sm font-semibold px-3 py-2 rounded-lg border border-[#2d3951]/10 text-[#2d3951]/80 hover:text-[#175bbd] hover:border-[#175bbd]/20 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/auth"
                  className={`text-sm font-semibold transition-all duration-300 flex items-center gap-2 px-3 py-2 rounded-lg ${
                    isActive('/auth')
                      ? 'text-[#175bbd] bg-[#175bbd]/5'
                      : 'text-[#2d3951]/70 hover:text-[#175bbd] hover:bg-[#175bbd]/5'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className={`text-sm font-semibold transition-all duration-300 flex items-center gap-2 px-3 py-2 rounded-lg ${
                    isActive('/register')
                      ? 'text-[#175bbd] bg-[#175bbd]/5'
                      : 'text-[#2d3951]/70 hover:text-[#175bbd] hover:bg-[#175bbd]/5'
                  }`}
                >
                  Register
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#2d3951] hover:bg-[#175bbd]/5 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <HiXIcon className="w-6 h-6" />
            ) : (
              <HiMenu className="w-6 h-6" />
            )}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-[#2d3951]/5 mt-2 pt-4">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const IconComponent = link.icon
                return (
                  <Link 
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-base font-semibold transition-all duration-300 flex items-center gap-3 px-4 py-3 rounded-lg ${
                      isActive(link.path)
                        ? 'text-[#175bbd] bg-[#175bbd]/5' 
                        : 'text-[#2d3951]/70 hover:text-[#175bbd] hover:bg-[#175bbd]/5'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span>{link.label}</span>
                  </Link>
                )
              })}
              {user ? (
                <>
                  <div className="px-4 py-2 text-sm text-[#2d3951]/60 truncate">
                    {profile?.username || user.user_metadata?.username || user.email}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="text-base font-semibold transition-all duration-300 flex items-center gap-3 px-4 py-3 rounded-lg text-[#2d3951]/70 hover:text-[#175bbd] hover:bg-[#175bbd]/5 text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-base font-semibold transition-all duration-300 flex items-center gap-3 px-4 py-3 rounded-lg ${
                      isActive('/auth')
                        ? 'text-[#175bbd] bg-[#175bbd]/5'
                        : 'text-[#2d3951]/70 hover:text-[#175bbd] hover:bg-[#175bbd]/5'
                    }`}
                  >
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-base font-semibold transition-all duration-300 flex items-center gap-3 px-4 py-3 rounded-lg ${
                      isActive('/register')
                        ? 'text-[#175bbd] bg-[#175bbd]/5'
                        : 'text-[#2d3951]/70 hover:text-[#175bbd] hover:bg-[#175bbd]/5'
                    }`}
                  >
                    <span>Register</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar

