import { useEffect, useMemo, useState } from 'react'
import { HiPhotograph, HiUser, HiMail, HiSave } from 'react-icons/hi'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'

function Profile() {
    const { user, profile, updateUser, upsertProfile, refreshProfile, setProfileOptimistic } = useAuth()
    const [username, setUsername] = useState(profile?.username || user?.user_metadata?.username || '')
    const [avatarFile, setAvatarFile] = useState(null)
    const [avatarPreview, setAvatarPreview] = useState('')
    const [resolvedAvatarSrc, setResolvedAvatarSrc] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    const currentAvatar = useMemo(() => {
        return avatarPreview || resolvedAvatarSrc || profile?.avatar_url || user?.user_metadata?.avatar_url || ''
    }, [avatarPreview, resolvedAvatarSrc, profile?.avatar_url, user?.user_metadata?.avatar_url])

    useEffect(() => {
        let active = true

        const resolveAvatar = async () => {
            if (!user) {
                setResolvedAvatarSrc('')
                return
            }

            const avatarPath = profile?.avatar_path || user.user_metadata?.avatar_path
            const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || ''

            if (avatarUrl) {
                setResolvedAvatarSrc((prev) => prev || avatarUrl)
            }

            if (!avatarPath) return

            const { data, error } = await supabase.storage.from('Users').createSignedUrl(avatarPath, 60 * 60)
            if (!active) return

            if (!error && data?.signedUrl) {
                setResolvedAvatarSrc(data.signedUrl)
            }
        }

        resolveAvatar()

        return () => {
            active = false
        }
    }, [user, profile?.avatar_path, profile?.avatar_url])

    const handleAvatarChange = (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            setError('Please upload a valid image file.')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Profile image must be under 5MB.')
            return
        }

        setError('')
        setAvatarFile(file)

        const reader = new FileReader()
        reader.onload = () => setAvatarPreview(typeof reader.result === 'string' ? reader.result : '')
        reader.onerror = () => setAvatarPreview('')
        reader.readAsDataURL(file)
    }

    const uploadAvatar = async (userId) => {
        if (!avatarFile || !userId) {
            return {
                avatarPath: profile?.avatar_path || user?.user_metadata?.avatar_path || '',
                avatarUrl: profile?.avatar_url || user?.user_metadata?.avatar_url || ''
            }
        }

        const extension = avatarFile.name.split('.').pop() || 'jpg'
        const avatarPath = `${userId}/avatar-${Date.now()}.${extension}`

        const { error: uploadError } = await supabase.storage
            .from('Users')
            .upload(avatarPath, avatarFile, { upsert: true, contentType: avatarFile.type })

        if (uploadError) {
            throw new Error(`Avatar upload failed: ${uploadError.message}`)
        }

        const { data: publicData } = supabase.storage.from('Users').getPublicUrl(avatarPath)
        return {
            avatarPath,
            avatarUrl: publicData.publicUrl || ''
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')
        setMessage('')

        const trimmedUsername = username.trim()
        if (!trimmedUsername) {
            setError('Username is required.')
            return
        }

        if (!user?.id) {
            setError('No authenticated user found. Please sign in again.')
            return
        }

        setLoading(true)

        try {
            // Optimistic UI update.
            setProfileOptimistic({
                username: trimmedUsername,
                avatar_url: avatarPreview || profile?.avatar_url || user?.user_metadata?.avatar_url || ''
            })

            const { avatarPath, avatarUrl } = await uploadAvatar(user.id)

            const { error: updateError } = await updateUser({
                data: {
                    username: trimmedUsername,
                    avatar_path: avatarPath,
                    avatar_url: avatarUrl
                }
            })

            if (updateError) throw updateError

            await upsertProfile({
                userId: user.id,
                email: user.email || profile?.email || '',
                username: trimmedUsername,
                avatar_path: avatarPath,
                avatar_url: avatarUrl
            })

            await refreshProfile()
            setAvatarFile(null)
            setAvatarPreview('')
            setMessage('Profile updated successfully.')
        } catch (err) {
            setError(err.message || 'Failed to update profile.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white border border-[#175bbd]/10 rounded-3xl p-8 sm:p-10 shadow-2xl">
                <div className="text-center">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2d3951]">Profile</h1>
                    <p className="mt-3 text-[#2d3951]/70">
                        Update your username and profile photo.
                    </p>
                </div>

                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                    <div className="flex items-center gap-4">
                        {currentAvatar ? (
                            <img
                                src={currentAvatar}
                                alt="Current profile"
                                className="w-20 h-20 rounded-full object-cover border border-[#175bbd]/20"
                                onError={() => setResolvedAvatarSrc(profile?.avatar_url || user?.user_metadata?.avatar_url || '')}
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-[#175bbd]/10 text-[#175bbd] text-2xl font-bold flex items-center justify-center">
                                {(profile?.username || user?.email || 'U').charAt(0).toUpperCase()}
                            </div>
                        )}

                        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#2d3951]/15 cursor-pointer hover:border-[#175bbd]/35 hover:bg-[#f8f9fb] transition-colors text-sm font-semibold text-[#2d3951]">
                            <HiPhotograph className="w-5 h-5 text-[#175bbd]" />
                            Change Photo
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                        </label>
                    </div>

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
                                value={user?.email || profile?.email || ''}
                                disabled
                                className="w-full pl-10 pr-3 py-3 rounded-xl border border-[#2d3951]/10 bg-[#f8f9fb] text-[#2d3951]/70"
                            />
                        </div>
                    </label>

                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>
                    )}
                    {message && (
                        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3">{message}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#175bbd] to-[#175bbd]/90 hover:from-[#175bbd]/90 hover:to-[#175bbd]/80 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                    >
                        <HiSave className="w-5 h-5" />
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Profile
