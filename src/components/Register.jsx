import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HiLockClosed, HiMail, HiPhotograph, HiUser } from 'react-icons/hi'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'

function Register() {
    const { signUp, updateUser, upsertProfile, refreshProfile, setProfileOptimistic } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [avatarFile, setAvatarFile] = useState(null)
    const [avatarPreview, setAvatarPreview] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    const handleAvatarChange = (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file.')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Profile image must be under 5MB.')
            return
        }

        setError('')
        setAvatarFile(file)

        const reader = new FileReader()
        reader.onload = () => {
            setAvatarPreview(typeof reader.result === 'string' ? reader.result : '')
        }
        reader.onerror = () => {
            setAvatarPreview('')
        }
        reader.readAsDataURL(file)
    }

    const uploadAvatar = async (userId) => {
        if (!avatarFile || !userId) return ''

        const extension = avatarFile.name.split('.').pop() || 'jpg'
        const path = `${userId}/avatar-${Date.now()}.${extension}`

        const { error: uploadError } = await supabase.storage
            .from('Users')
            .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type })

        if (uploadError) {
            throw new Error(`Avatar upload failed: ${uploadError.message}`)
        }

        return path
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')
        setMessage('')

        if (!username.trim()) {
            setError('Username is required.')
            return
        }

        setLoading(true)

        try {
            const { data, error: signUpError } = await signUp(email, password, {
                username: username.trim()
            })

            if (signUpError) throw signUpError

            const currentUser = data?.user
            const currentSession = data?.session

            if (!currentSession) {
                setMessage('Account created. Please confirm your email, then sign in.')
            } else {
                navigate('/analyze', { replace: true })

                // Show username/avatar immediately while storage/profile sync completes.
                setProfileOptimistic({
                    id: currentSession.user.id,
                    email: currentSession.user.email || email,
                    username: username.trim(),
                    avatar_url: avatarPreview || ''
                })

                ;(async () => {
                    try {
                        if (avatarFile) {
                            const avatarPath = await uploadAvatar(currentSession.user.id)
                            if (avatarPath) {
                                const { data: publicData } = supabase.storage.from('Users').getPublicUrl(avatarPath)
                                const avatarUrl = publicData.publicUrl || ''

                                const { error: updateError } = await updateUser({
                                    data: {
                                        username: username.trim(),
                                        avatar_url: avatarUrl,
                                        avatar_path: avatarPath
                                    }
                                })

                                if (updateError) throw updateError

                                await upsertProfile({
                                    userId: currentSession.user.id,
                                    email: currentSession.user.email || email,
                                    username: username.trim(),
                                    avatar_path: avatarPath,
                                    avatar_url: avatarUrl
                                })
                            }
                        } else {
                            await upsertProfile({
                                userId: currentSession.user.id,
                                email: currentSession.user.email || email,
                                username: username.trim()
                            })
                        }

                        await refreshProfile()
                    } catch (syncError) {
                        console.error('Profile sync after signup failed:', syncError)
                        setMessage('Account created, but profile image could not be saved. Please re-upload it later.')
                    }
                })()
            }

            if (currentUser && !avatarFile) {
                setMessage((prev) => prev || 'Account created successfully.')
            }
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-xl mx-auto">
            <div className="bg-white border border-[#175bbd]/10 rounded-3xl p-8 sm:p-10 shadow-2xl">
                <div className="text-center">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2d3951]">Create Account</h1>
                    <p className="mt-3 text-[#2d3951]/70">
                        Register with username and profile photo.
                    </p>
                </div>

                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                    <label className="block">
                        <span className="text-sm font-semibold text-[#2d3951]">Username</span>
                        <div className="mt-1 relative">
                            <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2d3951]/40 w-5 h-5" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="w-full pl-10 pr-3 py-3 rounded-xl border border-[#2d3951]/15 focus:outline-none focus:ring-4 focus:ring-[#175bbd]/15 focus:border-[#175bbd]"
                                placeholder="your_username"
                            />
                        </div>
                    </label>

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

                    <div>
                        <span className="text-sm font-semibold text-[#2d3951]">Profile Photo</span>
                        <label className="mt-1 flex items-center justify-center w-full border-2 border-dashed border-[#2d3951]/15 rounded-xl p-4 cursor-pointer hover:border-[#175bbd]/35 transition-colors bg-[#f8f9fb]">
                            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                            <div className="text-center">
                                <HiPhotograph className="w-8 h-8 text-[#175bbd] mx-auto" />
                                <p className="mt-2 text-sm text-[#2d3951]/70">
                                    Click to upload image (max 5MB)
                                </p>
                            </div>
                        </label>
                        {avatarPreview && (
                            <img
                                src={avatarPreview}
                                alt="Avatar preview"
                                className="mt-3 w-20 h-20 rounded-full object-cover border border-[#175bbd]/20"
                            />
                        )}
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>
                    )}
                    {message && (
                        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3">{message}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#175bbd] to-[#175bbd]/90 hover:from-[#175bbd]/90 hover:to-[#175bbd]/80 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? 'Creating account...' : 'Register'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-[#2d3951]/70">
                    Already have an account?{' '}
                    <Link to="/auth" className="font-bold text-[#175bbd] hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default Register
