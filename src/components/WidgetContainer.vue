<template>
  <div class="widget-container">
    <div class="widget-header">
      <span class="widget-title">{{ widget.title }}</span>
      <div class="widget-actions">
        <button class="action-btn" title="Settings" @click="showSettings = true">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="3" />
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
            />
          </svg>
        </button>
        <button class="action-btn" title="Refresh" @click="$emit('refresh')">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"
            />
          </svg>
        </button>
        <button class="action-btn remove-btn" title="Remove" @click="$emit('remove')">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
    <div class="widget-content">
      <ChartWidget
        v-if="widget.type === 'chart'"
        :config="widget.config"
        :refresh-key="widget.refreshKey"
      />
      <ImageWidget
        v-else-if="widget.type === 'image'"
        :config="widget.config"
        :refresh-key="widget.refreshKey"
      />
      <DataWidget
        v-else-if="widget.type === 'data'"
        :config="widget.config"
        :refresh-key="widget.refreshKey"
      />
      <IframeWidget v-else-if="widget.type === 'iframe'" :config="widget.config" />
      <SpotifyWidget
        v-else-if="widget.type === 'spotify'"
        :config="widget.config"
        :refresh-key="widget.refreshKey"
      />
      <DateTimeWidget
        v-else-if="widget.type === 'datetime'"
        :config="widget.config"
        :refresh-key="widget.refreshKey"
      />
      <ObliqueStrategiesWidget
        v-else-if="widget.type === 'oblique'"
        :config="widget.config"
        :refresh-key="widget.refreshKey"
      />
      <div v-else class="widget-placeholder">Unknown widget type</div>
    </div>

    <!-- Settings Modal -->
    <Teleport to="body">
      <WidgetSettings
        v-if="showSettings"
        :widget="widget"
        @close="showSettings = false"
        @save="handleSaveSettings"
      />
    </Teleport>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import ChartWidget from '../widgets/ChartWidget.vue'
  import ImageWidget from '../widgets/ImageWidget.vue'
  import DataWidget from '../widgets/DataWidget.vue'
  import IframeWidget from '../widgets/IframeWidget.vue'
  import SpotifyWidget from '../widgets/SpotifyWidget.vue'
  import DateTimeWidget from '../widgets/DateTimeWidget.vue'
  import ObliqueStrategiesWidget from '../widgets/ObliqueStrategiesWidget.vue'
  import WidgetSettings from './WidgetSettings.vue'

  defineProps({
    widget: {
      type: Object,
      required: true
    }
  })

  const emit = defineEmits(['remove', 'refresh', 'update-settings'])

  const showSettings = ref(false)

  const handleSaveSettings = (settings) => {
    emit('update-settings', settings)
    showSettings.value = false
  }
</script>

<style scoped>
  .widget-container {
    width: 100%;
    height: 100%;
    background-color: #1a1a1a;
    border: 1px solid #333;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  }

  .widget-container:hover {
    border-color: #444;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
  }

  .widget-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    background-color: #222;
    border-bottom: 1px solid #333;
    cursor: move;
    flex-shrink: 0;
  }

  .widget-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: #e0e0e0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .widget-actions {
    display: flex;
    gap: 4px;
  }

  .action-btn {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 4px;
    color: #888;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-btn:hover {
    background-color: #333;
    color: #fff;
  }

  .remove-btn:hover {
    background-color: #dc3545;
    color: #fff;
  }

  .widget-content {
    flex: 1;
    padding: 12px;
    overflow: auto;
    min-height: 0;
  }

  .widget-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #666;
    font-size: 0.875rem;
  }

  /* Mobile styles */
  @media (max-width: 767px) {
    .widget-header {
      padding: 8px 10px;
      cursor: default;
    }

    .widget-title {
      font-size: 0.8rem;
    }

    .action-btn {
      width: 28px;
      height: 28px;
    }

    .widget-content {
      padding: 8px;
    }
  }

  /* Tablet styles */
  @media (min-width: 768px) and (max-width: 1023px) {
    .widget-header {
      padding: 8px 10px;
    }

    .widget-content {
      padding: 10px;
    }
  }
</style>
