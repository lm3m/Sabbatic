<template>
  <div class="spotify-widget">
    <!-- Setup Screen -->
    <div v-if="!hasCredentials" class="setup-screen">
      <div class="spotify-logo">
        <svg viewBox="0 0 24 24" width="48" height="48">
          <path fill="#1DB954" d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
        </svg>
      </div>
      <h3>Connect to Spotify</h3>
      <p class="setup-info">Enter your Spotify API credentials to view your currently playing track.</p>

      <div class="form-group">
        <label>Client ID</label>
        <input
          v-model="clientId"
          type="text"
          placeholder="Your Spotify Client ID"
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label>Client Secret</label>
        <input
          v-model="clientSecret"
          type="password"
          placeholder="Your Spotify Client Secret"
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label>Redirect URI</label>
        <input
          v-model="redirectUri"
          type="text"
          placeholder="http://localhost:5173"
          class="form-input"
        />
        <span class="hint">Add this URI to your Spotify app settings</span>
      </div>

      <button @click="saveAndConnect" class="connect-btn" :disabled="!clientId || !clientSecret">
        Save & Connect
      </button>

      <a href="https://developer.spotify.com/dashboard" target="_blank" class="help-link">
        Create a Spotify App
      </a>
    </div>

    <!-- Auth Pending -->
    <div v-else-if="!isAuthenticated && !authError" class="auth-screen">
      <div class="spotify-logo">
        <svg viewBox="0 0 24 24" width="48" height="48">
          <path fill="#1DB954" d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
        </svg>
      </div>
      <p>Click to authorize with Spotify</p>
      <button @click="startAuth" class="connect-btn">
        Authorize
      </button>
      <button @click="resetCredentials" class="reset-btn">
        Change Credentials
      </button>
    </div>

    <!-- Auth Error -->
    <div v-else-if="authError" class="error-screen">
      <span class="error-icon">!</span>
      <p>{{ authError }}</p>
      <button @click="startAuth" class="connect-btn">
        Try Again
      </button>
      <button @click="resetCredentials" class="reset-btn">
        Reset Credentials
      </button>
    </div>

    <!-- Now Playing -->
    <div v-else-if="isAuthenticated" class="now-playing">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
      </div>

      <div v-else-if="currentTrack" class="track-info">
        <div class="album-art">
          <img :src="currentTrack.albumArt" :alt="currentTrack.album" />
          <div v-if="currentTrack.isPlaying" class="playing-indicator">
            <span></span><span></span><span></span>
          </div>
          <div v-else class="paused-indicator">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1"/>
              <rect x="14" y="4" width="4" height="16" rx="1"/>
            </svg>
          </div>
        </div>

        <div class="track-details">
          <span class="track-name" :title="currentTrack.name">{{ currentTrack.name }}</span>
          <span class="track-artist" :title="currentTrack.artist">{{ currentTrack.artist }}</span>
          <span class="track-album" :title="currentTrack.album">{{ currentTrack.album }}</span>
        </div>

        <!-- Playback Controls -->
        <div class="playback-controls">
          <button @click="handlePrevious" class="control-btn" :disabled="controlsLoading" title="Previous">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
            </svg>
          </button>
          <button
            v-if="currentTrack.isPlaying"
            @click="handlePause"
            class="control-btn play-pause"
            :disabled="controlsLoading"
            title="Pause"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1"/>
              <rect x="14" y="4" width="4" height="16" rx="1"/>
            </svg>
          </button>
          <button
            v-else
            @click="handlePlay"
            class="control-btn play-pause"
            :disabled="controlsLoading"
            title="Play"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
          <button @click="handleNext" class="control-btn" :disabled="controlsLoading" title="Next">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </button>
        </div>

        <div v-if="controlsError" class="controls-error">{{ controlsError }}</div>

        <div class="progress-bar">
          <div class="progress" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <div class="time-info">
          <span>{{ formatTime(currentTrack.progress) }}</span>
          <span>{{ formatTime(currentTrack.duration) }}</span>
        </div>
      </div>

      <div v-else class="not-playing">
        <div class="spotify-logo muted">
          <svg viewBox="0 0 24 24" width="48" height="48">
            <path fill="#666" d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
        </div>
        <p>Nothing playing</p>
        <span class="hint">Play something on Spotify</span>
      </div>

      <button @click="resetCredentials" class="settings-btn" title="Settings">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import {
  getStoredCredentials,
  saveCredentials,
  clearCredentials,
  getStoredToken,
  saveToken,
  generateAuthUrl,
  exchangeCodeForToken,
  refreshAccessToken,
  getCurrentlyPlaying,
  playTrack,
  pauseTrack,
  nextTrack,
  previousTrack
} from '../services/spotify.js'

const props = defineProps({
  config: {
    type: Object,
    required: true
  },
  refreshKey: {
    type: Number,
    default: 0
  }
})

const clientId = ref('')
const clientSecret = ref('')
const redirectUri = ref(window.location.origin)
const hasCredentials = ref(false)
const isAuthenticated = ref(false)
const authError = ref(null)
const loading = ref(false)
const currentTrack = ref(null)
const controlsLoading = ref(false)
const controlsError = ref(null)

let pollInterval = null
let authCheckInterval = null

const progressPercent = computed(() => {
  if (!currentTrack.value) return 0
  return (currentTrack.value.progress / currentTrack.value.duration) * 100
})

const formatTime = (ms) => {
  const seconds = Math.floor((ms / 1000) % 60)
  const minutes = Math.floor((ms / 1000 / 60) % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const checkForAuthCallback = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  const error = urlParams.get('error')

  if (error) {
    authError.value = 'Authorization denied'
    window.history.replaceState({}, document.title, window.location.pathname)
    return
  }

  if (code) {
    handleAuthCallback(code)
    window.history.replaceState({}, document.title, window.location.pathname)
  }
}

const handleAuthCallback = async (code) => {
  const credentials = getStoredCredentials()
  if (!credentials) {
    authError.value = 'Credentials not found'
    return
  }

  loading.value = true
  try {
    const tokenData = await exchangeCodeForToken(
      code,
      credentials.clientId,
      credentials.clientSecret,
      redirectUri.value
    )
    saveToken(tokenData)
    isAuthenticated.value = true
    authError.value = null
    startPolling()
  } catch (err) {
    authError.value = 'Failed to authenticate: ' + err.message
  } finally {
    loading.value = false
  }
}

const saveAndConnect = () => {
  saveCredentials(clientId.value, clientSecret.value)
  hasCredentials.value = true
}

const startAuth = () => {
  const credentials = getStoredCredentials()
  if (!credentials) return

  const authUrl = generateAuthUrl(credentials.clientId, redirectUri.value)
  window.location.href = authUrl
}

const resetCredentials = () => {
  clearCredentials()
  hasCredentials.value = false
  isAuthenticated.value = false
  currentTrack.value = null
  clientId.value = ''
  clientSecret.value = ''
  stopPolling()
}

const fetchCurrentlyPlaying = async () => {
  let token = getStoredToken()
  const credentials = getStoredCredentials()

  if (!token || !credentials) {
    isAuthenticated.value = false
    return
  }

  // Check if token needs refresh
  if (Date.now() >= token.expiresAt && token.refreshToken) {
    try {
      const newTokenData = await refreshAccessToken(
        token.refreshToken,
        credentials.clientId,
        credentials.clientSecret
      )
      token = saveToken(newTokenData)
    } catch {
      isAuthenticated.value = false
      authError.value = 'Session expired. Please re-authorize.'
      return
    }
  }

  try {
    const data = await getCurrentlyPlaying(token.accessToken)

    if (data && data.item) {
      // Get highest resolution image (images are sorted by size descending)
      // First image is largest (typically 640x640), last is smallest (typically 64x64)
      const images = data.item.album.images || []
      const highestResImage = images.length > 0 ? images[0].url : ''

      currentTrack.value = {
        name: data.item.name,
        artist: data.item.artists.map(a => a.name).join(', '),
        album: data.item.album.name,
        albumArt: highestResImage,
        duration: data.item.duration_ms,
        progress: data.progress_ms,
        isPlaying: data.is_playing
      }
    } else {
      currentTrack.value = null
    }
  } catch (err) {
    if (err.message === 'TOKEN_EXPIRED') {
      isAuthenticated.value = false
      authError.value = 'Session expired. Please re-authorize.'
    }
  }
}

const startPolling = () => {
  fetchCurrentlyPlaying()
  pollInterval = setInterval(fetchCurrentlyPlaying, 3000)
}

const getValidToken = async () => {
  let token = getStoredToken()
  const credentials = getStoredCredentials()

  if (!token || !credentials) {
    isAuthenticated.value = false
    return null
  }

  if (Date.now() >= token.expiresAt && token.refreshToken) {
    try {
      const newTokenData = await refreshAccessToken(
        token.refreshToken,
        credentials.clientId,
        credentials.clientSecret
      )
      token = saveToken(newTokenData)
    } catch {
      isAuthenticated.value = false
      authError.value = 'Session expired. Please re-authorize.'
      return null
    }
  }

  return token
}

const handlePlay = async () => {
  controlsError.value = null
  controlsLoading.value = true
  try {
    const token = await getValidToken()
    if (!token) return
    await playTrack(token.accessToken)
    setTimeout(fetchCurrentlyPlaying, 300)
  } catch (err) {
    if (err.message === 'NO_ACTIVE_DEVICE') {
      controlsError.value = 'No active device'
    } else {
      controlsError.value = 'Failed to play'
    }
    setTimeout(() => { controlsError.value = null }, 3000)
  } finally {
    controlsLoading.value = false
  }
}

const handlePause = async () => {
  controlsError.value = null
  controlsLoading.value = true
  try {
    const token = await getValidToken()
    if (!token) return
    await pauseTrack(token.accessToken)
    setTimeout(fetchCurrentlyPlaying, 300)
  } catch (err) {
    if (err.message === 'NO_ACTIVE_DEVICE') {
      controlsError.value = 'No active device'
    } else {
      controlsError.value = 'Failed to pause'
    }
    setTimeout(() => { controlsError.value = null }, 3000)
  } finally {
    controlsLoading.value = false
  }
}

const handleNext = async () => {
  controlsError.value = null
  controlsLoading.value = true
  try {
    const token = await getValidToken()
    if (!token) return
    await nextTrack(token.accessToken)
    setTimeout(fetchCurrentlyPlaying, 300)
  } catch (err) {
    if (err.message === 'NO_ACTIVE_DEVICE') {
      controlsError.value = 'No active device'
    } else {
      controlsError.value = 'Failed to skip'
    }
    setTimeout(() => { controlsError.value = null }, 3000)
  } finally {
    controlsLoading.value = false
  }
}

const handlePrevious = async () => {
  controlsError.value = null
  controlsLoading.value = true
  try {
    const token = await getValidToken()
    if (!token) return
    await previousTrack(token.accessToken)
    setTimeout(fetchCurrentlyPlaying, 300)
  } catch (err) {
    if (err.message === 'NO_ACTIVE_DEVICE') {
      controlsError.value = 'No active device'
    } else {
      controlsError.value = 'Failed to go back'
    }
    setTimeout(() => { controlsError.value = null }, 3000)
  } finally {
    controlsLoading.value = false
  }
}

const stopPolling = () => {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
}

watch(() => props.refreshKey, () => {
  if (isAuthenticated.value) {
    fetchCurrentlyPlaying()
  }
})

onMounted(() => {
  const credentials = getStoredCredentials()
  hasCredentials.value = !!credentials

  const token = getStoredToken()
  if (token) {
    isAuthenticated.value = true
    startPolling()
  }

  // Check for OAuth callback
  checkForAuthCallback()

  // Keep checking for auth callback (in case user authorizes in same window)
  authCheckInterval = setInterval(() => {
    if (!isAuthenticated.value && hasCredentials.value) {
      checkForAuthCallback()
    }
  }, 1000)
})

onUnmounted(() => {
  stopPolling()
  if (authCheckInterval) {
    clearInterval(authCheckInterval)
  }
})
</script>

<style scoped>
.spotify-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.setup-screen,
.auth-screen,
.error-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px;
  text-align: center;
  width: 100%;
}

.spotify-logo {
  margin-bottom: 8px;
}

.spotify-logo.muted svg path {
  fill: #666;
}

h3 {
  margin: 0;
  font-size: 1rem;
  color: #e0e0e0;
}

.setup-info {
  font-size: 0.75rem;
  color: #888;
  margin: 0;
  max-width: 240px;
}

.form-group {
  width: 100%;
  max-width: 280px;
  text-align: left;
}

.form-group label {
  display: block;
  font-size: 0.75rem;
  color: #888;
  margin-bottom: 4px;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  background-color: #222;
  border: 1px solid #333;
  border-radius: 4px;
  color: #e0e0e0;
  font-size: 0.875rem;
}

.form-input:focus {
  outline: none;
  border-color: #1DB954;
}

.form-input::placeholder {
  color: #555;
}

.hint {
  font-size: 0.625rem;
  color: #666;
  margin-top: 4px;
  display: block;
}

.connect-btn {
  padding: 10px 24px;
  background-color: #1DB954;
  color: #000;
  border: none;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
}

.connect-btn:hover:not(:disabled) {
  background-color: #1ed760;
  transform: scale(1.02);
}

.connect-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reset-btn {
  padding: 6px 12px;
  background: transparent;
  color: #888;
  border: 1px solid #333;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-btn:hover {
  border-color: #555;
  color: #ccc;
}

.help-link {
  font-size: 0.75rem;
  color: #1DB954;
  text-decoration: none;
  margin-top: 8px;
}

.help-link:hover {
  text-decoration: underline;
}

.error-screen .error-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #dc3545;
  color: #fff;
  border-radius: 50%;
  font-size: 1.5rem;
  font-weight: bold;
}

.error-screen p {
  color: #dc3545;
  font-size: 0.875rem;
  margin: 0;
}

.now-playing {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 12px;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #333;
  border-top-color: #1DB954;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.track-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.album-art {
  position: relative;
  width: min(50%, 200px);
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  flex-shrink: 0;
}

.album-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playing-indicator,
.paused-indicator {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 4px;
  padding: 4px 6px;
  display: flex;
  align-items: flex-end;
  gap: 2px;
}

.playing-indicator span {
  width: 3px;
  background-color: #1DB954;
  animation: equalizer 0.8s ease-in-out infinite;
}

.playing-indicator span:nth-child(1) {
  height: 8px;
  animation-delay: 0s;
}

.playing-indicator span:nth-child(2) {
  height: 12px;
  animation-delay: 0.2s;
}

.playing-indicator span:nth-child(3) {
  height: 6px;
  animation-delay: 0.4s;
}

@keyframes equalizer {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(0.5); }
}

.paused-indicator {
  color: #888;
}

.track-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
  width: 100%;
  padding: 0 8px;
}

.track-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #e0e0e0;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.3;
}

.track-artist {
  font-size: 0.75rem;
  color: #aaa;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.3;
}

.track-album {
  font-size: 0.625rem;
  color: #666;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.playback-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
}

.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #b3b3b3;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.15s ease;
}

.control-btn:hover:not(:disabled) {
  color: #fff;
  transform: scale(1.1);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-btn.play-pause {
  width: 40px;
  height: 40px;
  background-color: #fff;
  color: #000;
}

.control-btn.play-pause:hover:not(:disabled) {
  background-color: #1DB954;
  transform: scale(1.05);
}

.controls-error {
  font-size: 0.625rem;
  color: #ff6b6b;
  margin-top: 4px;
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background-color: #333;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 8px;
}

.progress {
  height: 100%;
  background-color: #1DB954;
  border-radius: 2px;
  transition: width 0.5s linear;
}

.time-info {
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 0.625rem;
  color: #666;
}

.not-playing {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #666;
}

.not-playing p {
  margin: 0;
  font-size: 0.875rem;
}

.settings-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
}

.settings-btn:hover {
  background-color: #333;
  color: #ccc;
}
</style>
