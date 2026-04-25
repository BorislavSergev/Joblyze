import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../services/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [session, setSession] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Supabase React quickstart pattern:
        // 1) read current session on app load
        // 2) subscribe to auth state changes
        const getInitialSession = async () => {
            const {
                data: { session: initialSession }
            } = await supabase.auth.getSession()

            setSession(initialSession)
            setLoading(false)
        }

        getInitialSession()

        const {
            data: { subscription }
        } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            setSession(nextSession)
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    useEffect(() => {
        const loadProfile = async () => {
            const userId = session?.user?.id

            if (!userId) {
                setProfile(null)
                return
            }

            const { data, error } = await supabase
                .from('users')
                .select('id, email, username, avatar_path, avatar_url')
                .eq('id', userId)
                .single()

            if (error) {
                // Keep optimistic profile data if DB row is not ready yet.
                return
            }

            setProfile(data)
        }

        loadProfile()
    }, [session?.user?.id])

    const value = useMemo(() => {
        return {
            session,
            user: session?.user ?? null,
            profile,
            loading,
            signUp: async (email, password, metadata = {}) => {
                return await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: metadata
                    }
                })
            },
            signIn: async (email, password) => {
                const result = await supabase.auth.signInWithPassword({ email, password })

                if (result.data?.session) {
                    setSession(result.data.session)

                    // Best-effort backfill to keep public.users synced with auth metadata.
                    const signedInUser = result.data.session.user
                    const metadata = signedInUser?.user_metadata || {}
                    const payload = {
                        id: signedInUser.id,
                        email: signedInUser.email || email,
                        username: metadata.username || '',
                        avatar_path: metadata.avatar_path || '',
                        avatar_url: metadata.avatar_url || ''
                    }

                    supabase
                        .from('users')
                        .upsert(payload, { onConflict: 'id' })
                        .then(({ error }) => {
                            if (!error) {
                                setProfile((prev) => ({ ...(prev || {}), ...payload }))
                            }
                        })
                }

                return result
            },
            signOut: async () => {
                const result = await supabase.auth.signOut()
                setSession(null)
                setProfile(null)
                return result
            },
            updateUser: async (attributes) => {
                return await supabase.auth.updateUser(attributes)
            },
            upsertProfile: async (values) => {
                const userId = values.userId || session?.user?.id
                const userEmail = values.email || session?.user?.email || ''

                if (!userId) {
                    throw new Error('No authenticated user session.')
                }

                const payload = {
                    id: userId,
                    email: userEmail,
                    ...values
                }

                delete payload.userId

                const { data, error } = await supabase
                    .from('users')
                    .upsert(payload, { onConflict: 'id' })
                    .select('id, email, username, avatar_path, avatar_url')
                    .single()

                if (error) throw error

                setProfile(data)
                return { data, error: null }
            },
            refreshProfile: async () => {
                const userId = session?.user?.id
                if (!userId) return { data: null, error: null }

                const { data, error } = await supabase
                    .from('users')
                    .select('id, email, username, avatar_path, avatar_url')
                    .eq('id', userId)
                    .single()

                if (!error) {
                    setProfile(data)
                }

                return { data, error }
            },
            setProfileOptimistic: (nextProfile) => {
                setProfile((prev) => ({
                    ...(prev || {}),
                    ...nextProfile
                }))
            }
        }
    }, [session, loading, profile])

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }

    return context
}
