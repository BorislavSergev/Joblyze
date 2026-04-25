import { supabase } from './supabaseClient'

// In-memory cache: avatarPath -> { signedUrl, expiresAt }
const cache = new Map()

// TTL slightly under 1 hour so we refresh before Supabase expiry
const TTL_MS = 55 * 60 * 1000

export async function getAvatarUrl(user, profile) {
  if (!user) return ''

  const path = profile?.avatar_path || user.user_metadata?.avatar_path
  const fallbackUrl = profile?.avatar_url || user.user_metadata?.avatar_url || ''

  // No storage path — return the public URL directly (no signing needed)
  if (!path) return fallbackUrl

  const cached = cache.get(path)
  if (cached && Date.now() < cached.expiresAt) {
    return cached.signedUrl
  }

  try {
    const { data, error } = await supabase.storage
      .from('Users')
      .createSignedUrl(path, 3600)

    if (error || !data?.signedUrl) return fallbackUrl

    cache.set(path, {
      signedUrl: data.signedUrl,
      expiresAt: Date.now() + TTL_MS,
    })

    return data.signedUrl
  } catch {
    return fallbackUrl
  }
}

export function invalidateAvatar(path) {
  if (path) cache.delete(path)
}

export function clearAvatarCache() {
  cache.clear()
}
