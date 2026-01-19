<template>
  <div class="iframe-widget">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <span>Loading content...</span>
    </div>
    <iframe
      v-show="!loading"
      :src="config.url"
      @load="onLoad"
      frameborder="0"
      allowfullscreen
      loading="lazy"
      referrerpolicy="no-referrer"
      sandbox="allow-scripts allow-same-origin allow-popups"
      class="widget-iframe"
    ></iframe>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  config: {
    type: Object,
    required: true
  }
})

const loading = ref(true)

const onLoad = () => {
  loading.value = false
}
</script>

<style scoped>
.iframe-widget {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #111;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.widget-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #888;
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
  to { transform: rotate(360deg); }
}
</style>
