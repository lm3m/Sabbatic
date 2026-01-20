<template>
  <div class="datetime-widget" :style="cssVars">
    <div class="lcd-display">
      <div class="time-display">
        <span class="lcd-digit">{{ hours }}</span>
        <span class="lcd-colon" :class="{ blink: shouldBlink }">:</span>
        <span class="lcd-digit">{{ minutes }}</span>
        <span v-if="!use24Hour" class="lcd-period">{{ period }}</span>
      </div>
      <div class="date-display">
        <div class="date-line">{{ formattedDate }}</div>
        <div class="date-details">
          <span class="day-of-week">{{ dayOfWeek }}</span>
          <span class="week-number">Week {{ weekNumber }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

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

const currentTime = ref(new Date())
const blinkState = ref(true)
let timeInterval = null
let blinkInterval = null

const use24Hour = computed(() => props.config.use24Hour === true)
const blinkEnabled = computed(() => props.config.blinkColon !== false)
const shouldBlink = computed(() => blinkEnabled.value && blinkState.value)
const displayColor = computed(() => props.config.displayColor || '#33ff77')

// Convert hex color to rgba for glow effects
const hexToRgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// Compute a dimmer version of the color for secondary elements
const dimColor = computed(() => {
  const hex = displayColor.value
  const r = Math.round(parseInt(hex.slice(1, 3), 16) * 0.65)
  const g = Math.round(parseInt(hex.slice(3, 5), 16) * 0.65)
  const b = Math.round(parseInt(hex.slice(5, 7), 16) * 0.65)
  return `rgb(${r}, ${g}, ${b})`
})

const cssVars = computed(() => ({
  '--display-color': displayColor.value,
  '--display-glow-strong': hexToRgba(displayColor.value, 0.8),
  '--display-glow-medium': hexToRgba(displayColor.value, 0.5),
  '--display-glow-weak': hexToRgba(displayColor.value, 0.3),
  '--display-color-dim': dimColor.value
}))

const hours = computed(() => {
  let h = currentTime.value.getHours()
  if (!use24Hour.value) {
    if (h === 0) h = 12
    else if (h > 12) h -= 12
  }
  return h.toString().padStart(2, '0')
})

const minutes = computed(() => {
  return currentTime.value.getMinutes().toString().padStart(2, '0')
})

const period = computed(() => {
  return currentTime.value.getHours() >= 12 ? 'PM' : 'AM'
})

const dayOfWeek = computed(() => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[currentTime.value.getDay()]
})

const formattedDate = computed(() => {
  const year = currentTime.value.getFullYear()
  const month = (currentTime.value.getMonth() + 1).toString().padStart(2, '0')
  const day = currentTime.value.getDate().toString().padStart(2, '0')
  return `${year}/${month}/${day}`
})

const weekNumber = computed(() => {
  const date = new Date(currentTime.value)
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7)
  const week1 = new Date(date.getFullYear(), 0, 4)
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)
})

onMounted(() => {
  timeInterval = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)

  blinkInterval = setInterval(() => {
    blinkState.value = !blinkState.value
  }, 500)
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
  if (blinkInterval) clearInterval(blinkInterval)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');

.datetime-widget {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
}

.lcd-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: linear-gradient(180deg, #1a1f1a 0%, #0d120d 100%);
  border-radius: 8px;
  border: 2px solid #2a2a2a;
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.5),
    0 0 20px var(--display-glow-weak);
}

.time-display {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.lcd-digit {
  font-family: 'Orbitron', 'Courier New', monospace;
  font-size: 3rem;
  font-weight: 700;
  color: var(--display-color);
  text-shadow:
    0 0 10px var(--display-glow-strong),
    0 0 20px var(--display-glow-medium),
    0 0 30px var(--display-glow-weak);
  letter-spacing: 2px;
  line-height: 1;
}

.lcd-colon {
  font-family: 'Orbitron', 'Courier New', monospace;
  font-size: 3rem;
  font-weight: 700;
  color: var(--display-color);
  text-shadow:
    0 0 10px var(--display-glow-strong),
    0 0 20px var(--display-glow-medium);
  margin: 0 4px;
  opacity: 1;
  transition: opacity 0.1s;
}

.lcd-colon.blink {
  opacity: 0.3;
}

.lcd-period {
  font-family: 'Orbitron', 'Courier New', monospace;
  font-size: 1rem;
  font-weight: 400;
  color: var(--display-color);
  text-shadow: 0 0 10px var(--display-glow-medium);
  margin-left: 8px;
  align-self: flex-end;
  margin-bottom: 8px;
}

.date-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  border-top: 1px solid #2a3a2a;
  padding-top: 12px;
  width: 100%;
}

.date-line {
  font-family: 'Orbitron', 'Courier New', monospace;
  font-size: 1.25rem;
  font-weight: 400;
  color: var(--display-color);
  text-shadow: 0 0 8px var(--display-glow-medium);
  letter-spacing: 3px;
}

.date-details {
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 16px;
}

.day-of-week,
.week-number {
  font-family: 'Orbitron', 'Courier New', monospace;
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--display-color-dim);
  text-shadow: 0 0 5px var(--display-glow-weak);
  text-transform: uppercase;
  letter-spacing: 1px;
}
</style>
