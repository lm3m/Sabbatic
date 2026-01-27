<template>
  <div class="chart-widget">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <span>Loading data...</span>
    </div>
    <div v-else-if="error" class="error">
      <span>{{ error }}</span>
      <button class="retry-btn" @click="fetchData">Retry</button>
    </div>
    <div v-else class="chart-container">
      <Line v-if="config.chartType === 'line'" :data="chartData" :options="chartOptions" />
      <Bar v-else-if="config.chartType === 'bar'" :data="chartData" :options="chartOptions" />
      <Doughnut
        v-else-if="config.chartType === 'doughnut'"
        :data="chartData"
        :options="doughnutOptions"
      />
      <Pie v-else-if="config.chartType === 'pie'" :data="chartData" :options="doughnutOptions" />
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, watch, onMounted } from 'vue'
  import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
  } from 'chart.js'
  import { Line, Bar, Doughnut, Pie } from 'vue-chartjs'
  import axios from 'axios'

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
  )

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
  const fetchedData = ref(null)

  const chartColors = [
    'rgba(26, 115, 232, 0.8)',
    'rgba(52, 168, 83, 0.8)',
    'rgba(251, 188, 4, 0.8)',
    'rgba(234, 67, 53, 0.8)',
    'rgba(154, 160, 166, 0.8)',
    'rgba(103, 58, 183, 0.8)',
    'rgba(0, 188, 212, 0.8)',
    'rgba(255, 87, 34, 0.8)'
  ]

  const chartData = computed(() => {
    if (props.config.staticData) {
      return {
        labels: props.config.staticData.labels,
        datasets: [
          {
            label: props.config.label || 'Data',
            data: props.config.staticData.values,
            backgroundColor:
              props.config.chartType === 'doughnut' || props.config.chartType === 'pie'
                ? chartColors
                : 'rgba(26, 115, 232, 0.6)',
            borderColor:
              props.config.chartType === 'doughnut' || props.config.chartType === 'pie'
                ? chartColors.map((c) => c.replace('0.8', '1'))
                : 'rgba(26, 115, 232, 1)',
            borderWidth: 2,
            fill: props.config.chartType === 'line',
            tension: 0.4
          }
        ]
      }
    }

    if (fetchedData.value) {
      const labels = Object.keys(fetchedData.value)
      const values = Object.values(fetchedData.value)
      return {
        labels,
        datasets: [
          {
            label: props.config.label || 'Data',
            data: values,
            backgroundColor: 'rgba(26, 115, 232, 0.2)',
            borderColor: 'rgba(26, 115, 232, 1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }
        ]
      }
    }

    return {
      labels: [],
      datasets: []
    }
  })

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#888',
          font: { size: 11 }
        }
      },
      tooltip: {
        backgroundColor: '#222',
        titleColor: '#fff',
        bodyColor: '#ccc',
        borderColor: '#333',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: { color: '#2a2a2a' },
        ticks: { color: '#888', font: { size: 10 } }
      },
      y: {
        grid: { color: '#2a2a2a' },
        ticks: { color: '#888', font: { size: 10 } }
      }
    }
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
          color: '#888',
          font: { size: 11 },
          padding: 10
        }
      },
      tooltip: {
        backgroundColor: '#222',
        titleColor: '#fff',
        bodyColor: '#ccc',
        borderColor: '#333',
        borderWidth: 1
      }
    }
  }

  const fetchData = async () => {
    if (!props.config.dataUrl) return

    loading.value = true
    error.value = null

    try {
      const response = await axios.get(props.config.dataUrl)
      let data = response.data

      if (props.config.dataPath) {
        const paths = props.config.dataPath.split('.')
        for (const path of paths) {
          data = data[path]
        }
      }

      fetchedData.value = data
    } catch (err) {
      error.value = `Failed to load data: ${err.message}`
    } finally {
      loading.value = false
    }
  }

  watch(
    () => props.refreshKey,
    () => {
      if (props.config.dataUrl) {
        fetchData()
      }
    }
  )

  onMounted(() => {
    if (props.config.dataUrl) {
      fetchData()
    }
  })
</script>

<style scoped>
  .chart-widget {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .chart-container {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .loading {
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
    to {
      transform: rotate(360deg);
    }
  }

  .error {
    display: flex;
    flex-direction: column;
    align-items: center;
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
</style>
