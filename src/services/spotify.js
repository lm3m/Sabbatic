const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize'
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'
const SPOTIFY_API_URL = 'https://api.spotify.com/v1'
const STORAGE_KEY = 'spotify-credentials'
const TOKEN_KEY = 'spotify-token'

export const getStoredCredentials = () => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return null
    }
  }
  return null
}

export const saveCredentials = (clientId, clientSecret) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ clientId, clientSecret }))
}

export const clearCredentials = () => {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(TOKEN_KEY)
}

export const getStoredToken = () => {
  const stored = localStorage.getItem(TOKEN_KEY)
  if (stored) {
    try {
      const token = JSON.parse(stored)
      if (token.expiresAt && Date.now() < token.expiresAt) {
        return token
      }
    } catch {
      return null
    }
  }
  return null
}

export const saveToken = (tokenData) => {
  const token = {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresAt: Date.now() + (tokenData.expires_in * 1000) - 60000 // 1 min buffer
  }
  localStorage.setItem(TOKEN_KEY, JSON.stringify(token))
  return token
}

export const generateAuthUrl = (clientId, redirectUri) => {
  const scopes = [
    'user-read-currently-playing',
    'user-read-playback-state'
  ]

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: scopes.join(' '),
    show_dialog: 'true'
  })

  return `${SPOTIFY_AUTH_URL}?${params.toString()}`
}

export const exchangeCodeForToken = async (code, clientId, clientSecret, redirectUri) => {
  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`)
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri
    })
  })

  if (!response.ok) {
    throw new Error('Failed to exchange code for token')
  }

  return response.json()
}

export const refreshAccessToken = async (refreshToken, clientId, clientSecret) => {
  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`)
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  })

  if (!response.ok) {
    throw new Error('Failed to refresh token')
  }

  const data = await response.json()
  // Keep the old refresh token if a new one isn't provided
  if (!data.refresh_token) {
    data.refresh_token = refreshToken
  }
  return data
}

export const getCurrentlyPlaying = async (accessToken) => {
  const response = await fetch(`${SPOTIFY_API_URL}/me/player/currently-playing`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  if (response.status === 204) {
    return null // Nothing playing
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('TOKEN_EXPIRED')
    }
    throw new Error('Failed to fetch currently playing')
  }

  return response.json()
}

export const getPlaybackState = async (accessToken) => {
  const response = await fetch(`${SPOTIFY_API_URL}/me/player`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  if (response.status === 204) {
    return null
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('TOKEN_EXPIRED')
    }
    throw new Error('Failed to fetch playback state')
  }

  return response.json()
}
