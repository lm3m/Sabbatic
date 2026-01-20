<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <h1>Widget Dashboard</h1>
      <div class="header-actions">
        <button @click="addWidget('chart')" class="add-btn">+ Chart</button>
        <button @click="addWidget('image')" class="add-btn">+ Image</button>
        <button @click="addWidget('data')" class="add-btn">+ Data</button>
        <button @click="addWidget('iframe')" class="add-btn">+ Embed</button>
        <button @click="addWidget('spotify')" class="add-btn spotify-btn">+ Spotify</button>
        <button @click="addWidget('datetime')" class="add-btn datetime-btn">+ Clock</button>
        <button @click="addWidget('oblique')" class="add-btn oblique-btn">+ Oblique</button>
        <button @click="resetLayout" class="reset-btn">Reset Layout</button>
      </div>
    </header>

    <main class="dashboard-content">
      <grid-layout
        v-model:layout="layout"
        :col-num="12"
        :row-height="30"
        :is-draggable="true"
        :is-resizable="true"
        :vertical-compact="true"
        :use-css-transforms="true"
        :margin="[16, 16]"
      >
        <grid-item
          v-for="item in layout"
          :key="item.i"
          :x="item.x"
          :y="item.y"
          :w="item.w"
          :h="item.h"
          :i="item.i"
          :min-w="2"
          :min-h="4"
          drag-allow-from=".widget-header"
          drag-ignore-from=".widget-content"
        >
          <WidgetContainer
            :widget="item"
            @remove="removeWidget(item.i)"
            @refresh="refreshWidget(item.i)"
            @update-settings="(settings) => updateWidgetSettings(item.i, settings)"
          />
        </grid-item>
      </grid-layout>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { GridLayout, GridItem } from 'grid-layout-plus'
import WidgetContainer from './components/WidgetContainer.vue'

const defaultLayout = [
  {
    x: 0, y: 0, w: 4, h: 8, i: '1',
    type: 'chart',
    title: 'Stock Price',
    config: {
      chartType: 'line',
      dataUrl: 'https://api.coindesk.com/v1/bpi/historical/close.json',
      dataPath: 'bpi',
      label: 'Bitcoin Price (USD)'
    }
  },
  {
    x: 4, y: 0, w: 4, h: 8, i: '2',
    type: 'chart',
    title: 'Server Metrics',
    config: {
      chartType: 'bar',
      staticData: {
        labels: ['CPU', 'Memory', 'Disk', 'Network'],
        values: [65, 78, 45, 82]
      },
      label: 'Usage %'
    }
  },
  {
    x: 8, y: 0, w: 4, h: 8, i: '3',
    type: 'image',
    title: 'Random Image',
    config: {
      url: 'https://picsum.photos/400/300',
      refreshInterval: 30000
    }
  },
  {
    x: 0, y: 8, w: 3, h: 6, i: '4',
    type: 'data',
    title: 'Crypto Prices',
    config: {
      url: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,dogecoin&vs_currencies=usd',
      refreshInterval: 60000
    }
  },
  {
    x: 3, y: 8, w: 5, h: 10, i: '5',
    type: 'iframe',
    title: 'Weather Map',
    config: {
      url: 'https://www.windy.com/widgets/embed/temperature?38.000,-97.000,4'
    }
  },
  {
    x: 8, y: 8, w: 4, h: 6, i: '6',
    type: 'chart',
    title: 'Doughnut Chart',
    config: {
      chartType: 'doughnut',
      staticData: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple'],
        values: [12, 19, 3, 5, 2]
      },
      label: 'Votes'
    }
  }
]

const layout = ref([])
let widgetCounter = 10

onMounted(() => {
  const savedLayout = localStorage.getItem('dashboard-layout')
  if (savedLayout) {
    try {
      layout.value = JSON.parse(savedLayout)
    } catch {
      layout.value = [...defaultLayout]
    }
  } else {
    layout.value = [...defaultLayout]
  }
})

const saveLayout = () => {
  localStorage.setItem('dashboard-layout', JSON.stringify(layout.value))
}

const addWidget = (type) => {
  const newWidget = {
    x: 0,
    y: 0,
    w: 4,
    h: 8,
    i: String(widgetCounter++),
    type,
    title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Widget`,
    config: getDefaultConfig(type)
  }
  layout.value.push(newWidget)
  saveLayout()
}

const getDefaultConfig = (type) => {
  switch (type) {
    case 'chart':
      return {
        chartType: 'line',
        staticData: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          values: [12, 19, 3, 5, 2, 3]
        },
        label: 'Sample Data'
      }
    case 'image':
      return {
        url: `https://picsum.photos/400/300?random=${Date.now()}`,
        refreshInterval: 0
      }
    case 'data':
      return {
        url: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
        refreshInterval: 60000
      }
    case 'iframe':
      return {
        url: 'https://www.openstreetmap.org/export/embed.html?bbox=-0.004017949104309083%2C51.47612752641776%2C0.00030577182769775396%2C51.478569861898606&layer=mapnik'
      }
    case 'spotify':
      return {}
    case 'datetime':
      return {
        use24Hour: false,
        blinkColon: true,
        displayColor: '#33ff77'
      }
    case 'oblique':
      return {
        fontFamily: 'Georgia, serif',
        fontColor: '#e0e0e0',
        fontSize: '1.125rem',
        fontBold: false,
        fontItalic: true,
        fontUppercase: false
      }
    default:
      return {}
  }
}

const removeWidget = (id) => {
  const index = layout.value.findIndex(item => item.i === id)
  if (index !== -1) {
    layout.value.splice(index, 1)
    saveLayout()
  }
}

const refreshWidget = (id) => {
  const widget = layout.value.find(item => item.i === id)
  if (widget) {
    widget.refreshKey = Date.now()
  }
}

const updateWidgetSettings = (id, settings) => {
  const widget = layout.value.find(item => item.i === id)
  if (widget) {
    widget.title = settings.title
    widget.config = { ...widget.config, ...settings.config }
    widget.refreshKey = Date.now()
    saveLayout()
  }
}

const resetLayout = () => {
  layout.value = [...defaultLayout]
  localStorage.removeItem('dashboard-layout')
}
</script>

<style scoped>
.dashboard {
  width: 100%;
  min-height: 100vh;
  background-color: #0a0a0a;
  display: flex;
  flex-direction: column;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: #111111;
  border-bottom: 1px solid #2a2a2a;
}

.dashboard-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.add-btn, .reset-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-btn {
  background-color: #1a73e8;
  color: white;
}

.add-btn:hover {
  background-color: #1557b0;
}

.spotify-btn {
  background-color: #1DB954;
  color: #000;
}

.spotify-btn:hover {
  background-color: #1ed760;
}

.datetime-btn {
  background-color: #1a3a1a;
  color: #33ff77;
  border: 1px solid #33ff77;
}

.datetime-btn:hover {
  background-color: #2a4a2a;
}

.oblique-btn {
  background-color: #2a2a3a;
  color: #aabbff;
  border: 1px solid #4455aa;
}

.oblique-btn:hover {
  background-color: #3a3a4a;
}

.reset-btn {
  background-color: #333;
  color: #ccc;
}

.reset-btn:hover {
  background-color: #444;
}

.dashboard-content {
  flex: 1;
  padding: 16px;
  overflow: auto;
}
</style>
