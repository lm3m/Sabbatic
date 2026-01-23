<template>
  <div class="oblique-widget">
    <div class="card-container">
      <div
        class="strategy-card"
        :class="{ 'flipped': isFlipped }"
        :style="isFlipped ? cardStyle : {}"
        @click="isFlipped ? null : drawCard()"
      >
        <p v-if="isFlipped" class="strategy-text">{{ currentStrategy }}</p>
        <p v-else class="card-title">Oblique Strategies</p>
      </div>
      <button v-if="isFlipped" @click="drawNewCard" class="draw-btn" title="Draw new card">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
        </svg>
        <span>Draw New Card</span>
      </button>
      <button v-else @click="drawCard" class="draw-btn" title="Draw a card">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
        </svg>
        <span>Draw A Card</span>
      </button>
    </div>
    <div class="attribution">
      Oblique Strategies by Brian Eno & Peter Schmidt
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

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

const strategies = ref([])
const currentStrategy = ref('')
const isFlipped = ref(false)

const fontFamily = computed(() => props.config.fontFamily || 'Georgia, serif')
const fontColor = computed(() => props.config.fontColor || '#e0e0e0')
const fontSize = computed(() => props.config.fontSize || '1.125rem')
const fontBold = computed(() => props.config.fontBold || false)
const fontItalic = computed(() => props.config.fontItalic !== false) // Default true
const fontUppercase = computed(() => props.config.fontUppercase || false)

const cardStyle = computed(() => ({
  fontFamily: fontFamily.value,
  color: fontColor.value,
  fontSize: fontSize.value,
  fontWeight: fontBold.value ? 'bold' : 'normal',
  fontStyle: fontItalic.value ? 'italic' : 'normal',
  textTransform: fontUppercase.value ? 'uppercase' : 'none'
}))

const getDateString = () => {
  const now = new Date()
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
}

const hashString = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

const getStorageKey = () => 'oblique-strategy-override'

const getOverrideForToday = () => {
  const stored = localStorage.getItem(getStorageKey())
  if (stored) {
    try {
      const data = JSON.parse(stored)
      if (data.date === getDateString()) {
        return data.index
      }
    } catch {
      // Invalid data, ignore
    }
  }
  return null
}

const setOverrideForToday = (index) => {
  localStorage.setItem(getStorageKey(), JSON.stringify({
    date: getDateString(),
    index: index
  }))
}

const selectStrategy = () => {
  if (strategies.value.length === 0) return

  // Check for override first
  const override = getOverrideForToday()
  if (override !== null && override < strategies.value.length) {
    currentStrategy.value = strategies.value[override]
    return
  }

  // Use date-based hash
  const dateStr = getDateString()
  const hash = hashString(dateStr)
  const index = hash % strategies.value.length
  currentStrategy.value = strategies.value[index]
}

const drawCard = () => {
  if (strategies.value.length === 0) return

  selectStrategy()
  isFlipped.value = true
}

const drawNewCard = () => {
  if (strategies.value.length === 0) return

  // Get a random index different from current
  let newIndex
  const currentIndex = strategies.value.indexOf(currentStrategy.value)
  do {
    newIndex = Math.floor(Math.random() * strategies.value.length)
  } while (newIndex === currentIndex && strategies.value.length > 1)

  setOverrideForToday(newIndex)
  currentStrategy.value = strategies.value[newIndex]
  isFlipped.value = true
}

const loadStrategies = async () => {
  try {
    const response = await fetch('/ObliqueStrategies-Edition-1975.txt')
    const text = await response.text()

    // Parse non-empty lines, excluding the blank card entry
    strategies.value = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && line !== '[blank white card]')

    // Check if there's an existing override for today - if so, show it flipped
    const override = getOverrideForToday()
    if (override !== null && override < strategies.value.length) {
      currentStrategy.value = strategies.value[override]
      isFlipped.value = true
    }
  } catch (err) {
    currentStrategy.value = 'Failed to load strategies'
    isFlipped.value = true
  }
}

watch(() => props.refreshKey, () => {
  selectStrategy()
})

onMounted(() => {
  loadStrategies()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,400;0,700;1,400;1,700&display=swap');

.oblique-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.card-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.strategy-card {
  background: linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 100%);
  border: 1px solid #3a3a3a;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.strategy-text {
  margin: 0;
  line-height: 1.5;
  text-align: center;
}

.card-title {
  margin: 0;
  font-family: 'Georgia', serif;
  font-size: 1.25rem;
  font-style: italic;
  color: #888;
  text-align: center;
}

.strategy-card:not(.flipped) {
  cursor: pointer;
  transition: all 0.2s ease;
}

.strategy-card:not(.flipped):hover {
  border-color: #4a4a4a;
  box-shadow:
    0 6px 16px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.draw-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 6px;
  color: #aaa;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.draw-btn:hover {
  background-color: #3a3a3a;
  color: #fff;
  border-color: #4a4a4a;
}

.draw-btn svg {
  flex-shrink: 0;
}

.attribution {
  margin-top: auto;
  padding-top: 12px;
  font-size: 0.625rem;
  color: #555;
  text-align: center;
}
</style>
