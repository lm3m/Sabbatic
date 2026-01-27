<template>
  <div class="image-widget">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>
    <div v-else-if="error" class="error">
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
      <span>Failed to load image</span>
      <button class="retry-btn" @click="loadImage">Retry</button>
    </div>
    <img
      v-else
      :src="imageUrl"
      :alt="config.alt || 'Widget image'"
      class="widget-image"
      @load="onLoad"
      @error="onError"
    />
  </div>
</template>

<script setup>
  import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

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

  const loading = ref(true)
  const error = ref(false)
  const cacheBuster = ref(Date.now())
  let refreshInterval = null

  const imageUrl = computed(() => {
    const url = props.config.url
    if (!url) return ''

    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}_cb=${cacheBuster.value}`
  })

  const loadImage = () => {
    loading.value = true
    error.value = false
    cacheBuster.value = Date.now()
  }

  const onLoad = () => {
    loading.value = false
    error.value = false
  }

  const onError = () => {
    loading.value = false
    error.value = true
  }

  watch(
    () => props.refreshKey,
    () => {
      loadImage()
    }
  )

  onMounted(() => {
    if (props.config.refreshInterval && props.config.refreshInterval > 0) {
      refreshInterval = setInterval(() => {
        cacheBuster.value = Date.now()
      }, props.config.refreshInterval)
    }
  })

  onUnmounted(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval)
    }
  })
</script>

<style scoped>
  .image-widget {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #111;
    border-radius: 4px;
    overflow: hidden;
  }

  .widget-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
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
    border-top-color: #1a73e8;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .error {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: #666;
    text-align: center;
    padding: 16px;
  }

  .error svg {
    opacity: 0.5;
  }

  .error span {
    font-size: 0.875rem;
  }

  .retry-btn {
    padding: 6px 12px;
    background-color: #333;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.75rem;
  }

  .retry-btn:hover {
    background-color: #444;
  }
</style>
