import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { HiLockClosed, HiMail, HiSparkles } from 'react-icons/hi'
import { useAuth } from '../context/AuthContext'

function Auth() {
    const { signIn, user } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const destination = location.state?.from?.pathname || '/analyze'

    if (user) {
        return (
            <div className="max-w-xl mx-auto bg-white border border-[#175bbd]/10 rounded-3xl p-8 text-center shadow-xl">
                <h1 className="text-3xl font-extrabold text-[#2d3951]">You are already signed in</h1>
                <p className="mt-3 text-[#2d3951]/70">Continue to the analysis dashboard.</p>
                <button
                    onClick={() => navigate(destination, { replace: true })}
                    className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-[#175bbd] to-[#175bbd]/90 text-white font-bold"
                >
                    Continue
                </button>
            </div>
        )
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')
        setLoading(true)

        try {
            const { data, error: signInError } = await signIn(email, password)
            if (signInError) throw signInError

            if (!data?.session) {
                throw new Error('Sign in succeeded but no active session was returned. Please try again.')
            }

            navigate(destination, { replace: true })
        } catch (err) {
            setError(err.message || 'Authentication failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-xl mx-auto">
            <div className="bg-white border border-[#175bbd]/10 rounded-3xl p-8 sm:p-10 shadow-2xl">
                <div className="text-center">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2d3951] flex items-center justify-center gap-2">
                        <HiSparkles className="w-8 h-8 text-[#175bbd]" />
                        Sign In
                    </h1>
                    <p className="mt-3 text-[#2d3951]/70">
                        Sign in to use CV analysis and templates.
                    </p>
                </div>

                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                    <label className="block">
                        <span className="text-sm font-semibold text-[#2d3951]">Email</span>
                        <div className="mt-1 relative">
                            <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2d3951]/40 w-5 h-5" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full pl-10 pr-3 py-3 rounded-xl border border-[#2d3951]/15 focus:outline-none focus:ring-4 focus:ring-[#175bbd]/15 focus:border-[#175bbd]"
                                placeholder="you@example.com"
                            />
                        </div>
                    </label>

                    <label className="block">
                        <span className="text-sm font-semibold text-[#2d3951]">Password</span>
                        <div className="mt-1 relative">
                            <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2d3951]/40 w-5 h-5" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full pl-10 pr-3 py-3 rounded-xl border border-[#2d3951]/15 focus:outline-none focus:ring-4 focus:ring-[#175bbd]/15 focus:border-[#175bbd]"
                                placeholder="Minimum 6 characters"
                            />
                        </div>
                    </label>

                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#175bbd] to-[#175bbd]/90 hover:from-[#175bbd]/90 hover:to-[#175bbd]/80 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? 'Please wait...' : 'Sign In'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-[#2d3951]/70">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-bold text-[#175bbd] hover:underline">
                        Create one
                    </Link>
                </p>

                <div className="mt-4 text-center">
                    <Link to="/" className="text-sm text-[#2d3951]/60 hover:text-[#175bbd]">
                        Back to home
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Auth
