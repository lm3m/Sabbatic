<template>
  <div class="data-widget">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <span>Loading data...</span>
    </div>
    <div v-else-if="error" class="error">
      <span>{{ error }}</span>
      <button class="retry-btn" @click="fetchData">Retry</button>
    </div>
    <div v-else class="data-content">
      <div v-if="isObject(data)" class="data-grid">
        <div v-for="(value, key) in flattenedData" :key="key" class="data-item">
          <span class="data-key">{{ formatKey(key) }}</span>
          <span class="data-value" :class="getValueClass(value)">
            {{ formatValue(value) }}
          </span>
        </div>
      </div>
      <pre v-else class="data-raw">{{ JSON.stringify(data, null, 2) }}</pre>
    </div>
    <div v-if="lastUpdated" class="last-updated">Updated: {{ formatTime(lastUpdated) }}</div>
  </div>
</template>

<script setup>
  import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
  import axios from 'axios'

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

  const loading = ref(false)
  const error = ref(null)
  const data = ref(null)
  const lastUpdated = ref(null)
  let refreshInterval = null

  const isObject = (val) => val !== null && typeof val === 'object' && !Array.isArray(val)

  const flattenedData = computed(() => {
    if (!data.value || !isObject(data.value)) return {}

    const result = {}
    const flatten = (obj, prefix = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}.${key}` : key
        if (isObject(value) && !Array.isArray(value)) {
          flatten(value, newKey)
        } else {
          result[newKey] = value
        }
      }
    }
    flatten(data.value)
    return result
  })

  const formatKey = (key) => {
    return key
      .split('.')
      .pop()
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .toLowerCase()
      .replace(/^\w/, (c) => c.toUpperCase())
  }

  const formatValue = (value) => {
    if (typeof value === 'number') {
      if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(2)}M`
      } else if (value >= 1000) {
        return `$${(value / 1000).toFixed(2)}K`
      } else if (Number.isInteger(value)) {
        return value.toLocaleString()
      } else {
        return value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 6
        })
      }
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No'
    }
    return String(value)
  }

  const getValueClass = (value) => {
    if (typeof value === 'number') {
      return 'numeric'
    }
    if (typeof value === 'boolean') {
      return value ? 'positive' : 'negative'
    }
    return ''
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString()
  }

  const fetchData = async () => {
    if (!props.config.url) return

    loading.value = true
    error.value = null

    try {
      const response = await axios.get(props.config.url)
      data.value = response.data
      lastUpdated.value = Date.now()
    } catch (err) {
      error.value = `Failed to load: ${err.message}`
    } finally {
      loading.value = false
    }
  }

  watch(
    () => props.refreshKey,
    () => {
      fetchData()
    }
  )

  onMounted(() => {
    fetchData()

    if (props.config.refreshInterval && props.config.refreshInterval > 0) {
      refreshInterval = setInterval(fetchData, props.config.refreshInterval)
    }
  })

  onUnmounted(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval)
    }
  })
</script>

<style scoped>
  .data-widget {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .loading {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
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
    to {
      transform: rotate(360deg);
    }
  }

  .error {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: #dc3545;
    text-align: center;
    padding: 16px;
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

  .data-content {
    flex: 1;
    overflow: auto;
  }

  .data-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .data-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background-color: #222;
    border-radius: 6px;
    border: 1px solid #333;
  }

  .data-key {
    font-size: 0.75rem;
    color: #888;
    text-transform: capitalize;
  }

  .data-value {
    font-size: 0.875rem;
    font-weight: 600;
    color: #e0e0e0;
  }

  .data-value.numeric {
    color: #4caf50;
    font-family: 'SF Mono', 'Consolas', monospace;
  }

  .data-value.positive {
    color: #4caf50;
  }

  .data-value.negative {
    color: #f44336;
  }

  .data-raw {
    font-size: 0.75rem;
    color: #aaa;
    background-color: #111;
    padding: 12px;
    border-radius: 4px;
    overflow: auto;
    margin: 0;
    font-family: 'SF Mono', 'Consolas', monospace;
  }

  .last-updated {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #333;
    font-size: 0.625rem;
    color: #666;
    text-align: right;
  }
</style>
