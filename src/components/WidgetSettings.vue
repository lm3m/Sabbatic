<template>
  <div class="settings-overlay" @click.self="$emit('close')">
    <div class="settings-modal">
      <div class="settings-header">
        <h3>Widget Settings</h3>
        <button @click="$emit('close')" class="close-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="settings-content">
        <!-- Common Settings -->
        <div class="settings-section">
          <h4>General</h4>
          <div class="form-group">
            <label>Widget Name</label>
            <input
              v-model="localSettings.title"
              type="text"
              class="form-input"
              placeholder="Enter widget name"
            />
          </div>
        </div>

        <!-- Chart Widget Settings -->
        <div v-if="widget.type === 'chart'" class="settings-section">
          <h4>Chart Settings</h4>
          <div class="form-group">
            <label>Chart Type</label>
            <select v-model="localSettings.config.chartType" class="form-input">
              <option value="line">Line</option>
              <option value="bar">Bar</option>
              <option value="doughnut">Doughnut</option>
              <option value="pie">Pie</option>
            </select>
          </div>
          <div class="form-group">
            <label>Data Label</label>
            <input
              v-model="localSettings.config.label"
              type="text"
              class="form-input"
              placeholder="Dataset label"
            />
          </div>
          <div class="form-group">
            <label>Data URL (optional)</label>
            <input
              v-model="localSettings.config.dataUrl"
              type="text"
              class="form-input"
              placeholder="https://api.example.com/data"
            />
          </div>
          <div class="form-group">
            <label>Data Path (for nested JSON)</label>
            <input
              v-model="localSettings.config.dataPath"
              type="text"
              class="form-input"
              placeholder="e.g., data.values"
            />
          </div>
        </div>

        <!-- Image Widget Settings -->
        <div v-if="widget.type === 'image'" class="settings-section">
          <h4>Image Settings</h4>
          <div class="form-group">
            <label>Image URL</label>
            <input
              v-model="localSettings.config.url"
              type="text"
              class="form-input"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div class="form-group">
            <label>Auto-refresh Interval (ms)</label>
            <input
              v-model.number="localSettings.config.refreshInterval"
              type="number"
              class="form-input"
              placeholder="0 = disabled"
              min="0"
              step="1000"
            />
            <span class="hint">Set to 0 to disable auto-refresh</span>
          </div>
        </div>

        <!-- Data Widget Settings -->
        <div v-if="widget.type === 'data'" class="settings-section">
          <h4>Data Settings</h4>
          <div class="form-group">
            <label>API URL</label>
            <input
              v-model="localSettings.config.url"
              type="text"
              class="form-input"
              placeholder="https://api.example.com/data"
            />
          </div>
          <div class="form-group">
            <label>Refresh Interval (ms)</label>
            <input
              v-model.number="localSettings.config.refreshInterval"
              type="number"
              class="form-input"
              placeholder="60000"
              min="0"
              step="1000"
            />
            <span class="hint">Set to 0 to disable auto-refresh</span>
          </div>
        </div>

        <!-- Iframe Widget Settings -->
        <div v-if="widget.type === 'iframe'" class="settings-section">
          <h4>Embed Settings</h4>
          <div class="form-group">
            <label>Embed URL</label>
            <input
              v-model="localSettings.config.url"
              type="text"
              class="form-input"
              placeholder="https://example.com/embed"
            />
          </div>
        </div>

        <!-- DateTime Widget Settings -->
        <div v-if="widget.type === 'datetime'" class="settings-section">
          <h4>Clock Settings</h4>
          <div class="form-group">
            <label>Time Format</label>
            <select v-model="localSettings.config.use24Hour" class="form-input">
              <option :value="false">12-hour (AM/PM)</option>
              <option :value="true">24-hour</option>
            </select>
          </div>
          <div class="form-group">
            <label>Show Blinking Colon</label>
            <select v-model="localSettings.config.blinkColon" class="form-input">
              <option :value="true">Yes</option>
              <option :value="false">No</option>
            </select>
          </div>
          <div class="form-group">
            <label>Display Color</label>
            <div class="color-input-wrapper">
              <input
                v-model="localSettings.config.displayColor"
                type="color"
                class="form-input color-input"
              />
              <input
                v-model="localSettings.config.displayColor"
                type="text"
                class="form-input color-text"
                placeholder="#33ff77"
              />
            </div>
          </div>
        </div>

        <!-- Spotify Widget Settings -->
        <div v-if="widget.type === 'spotify'" class="settings-section">
          <h4>Spotify Settings</h4>
          <p class="info-text">
            Spotify credentials are managed within the widget itself.
            Use the gear icon in the widget to change credentials.
          </p>
        </div>

        <!-- Oblique Strategies Widget Settings -->
        <div v-if="widget.type === 'oblique'" class="settings-section">
          <h4>Display Settings</h4>
          <div class="form-group">
            <label>Font Family</label>
            <select v-model="localSettings.config.fontFamily" class="form-input">
              <option value="Georgia, serif">Georgia (Serif)</option>
              <option value="'Times New Roman', serif">Times New Roman</option>
              <option value="'Palatino Linotype', serif">Palatino</option>
              <option value="Arial, sans-serif">Arial</option>
              <option value="'Helvetica Neue', sans-serif">Helvetica</option>
              <option value="Verdana, sans-serif">Verdana</option>
              <option value="'Jost', sans-serif">Jost (Futura-like)</option>
              <option value="'Courier New', monospace">Courier New</option>
              <option value="'Orbitron', monospace">Orbitron</option>
              <option value="'Comic Sans MS', cursive">Comic Sans</option>
            </select>
          </div>
          <div class="form-group">
            <label>Font Color</label>
            <div class="color-input-wrapper">
              <input
                v-model="localSettings.config.fontColor"
                type="color"
                class="form-input color-input"
              />
              <input
                v-model="localSettings.config.fontColor"
                type="text"
                class="form-input color-text"
                placeholder="#e0e0e0"
              />
            </div>
          </div>
          <div class="form-group">
            <label>Font Size</label>
            <select v-model="localSettings.config.fontSize" class="form-input">
              <option value="0.875rem">Small</option>
              <option value="1.125rem">Medium</option>
              <option value="1.5rem">Large</option>
              <option value="2rem">Extra Large</option>
            </select>
          </div>
          <div class="form-group">
            <label>Font Style</label>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input
                  v-model="localSettings.config.fontBold"
                  type="checkbox"
                  class="checkbox-input"
                />
                <span>Bold</span>
              </label>
              <label class="checkbox-label">
                <input
                  v-model="localSettings.config.fontItalic"
                  type="checkbox"
                  class="checkbox-input"
                />
                <span>Italic</span>
              </label>
              <label class="checkbox-label">
                <input
                  v-model="localSettings.config.fontUppercase"
                  type="checkbox"
                  class="checkbox-input"
                />
                <span>Uppercase</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="settings-footer">
        <button @click="$emit('close')" class="btn btn-cancel">Cancel</button>
        <button @click="saveSettings" class="btn btn-save">Save</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  widget: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'save'])

const localSettings = ref({
  title: '',
  config: {}
})

// Initialize local settings from widget prop
// Only sync once on creation - don't use deep watch which causes cross-widget contamination
const initSettings = () => {
  const config = JSON.parse(JSON.stringify(props.widget.config || {}))

  // Ensure datetime widget has default values
  if (props.widget.type === 'datetime') {
    if (!config.displayColor) config.displayColor = '#33ff77'
  }

  // Ensure oblique widget has default values for font settings
  if (props.widget.type === 'oblique') {
    if (!config.fontFamily) config.fontFamily = 'Georgia, serif'
    if (!config.fontColor) config.fontColor = '#e0e0e0'
    if (!config.fontSize) config.fontSize = '1.125rem'
    if (config.fontBold === undefined) config.fontBold = false
    if (config.fontItalic === undefined) config.fontItalic = true
    if (config.fontUppercase === undefined) config.fontUppercase = false
  }

  localSettings.value = {
    title: props.widget.title,
    config
  }
}

// Initialize immediately on component creation
initSettings()

// Re-sync only if a different widget is passed (by ID)
watch(() => props.widget.i, () => {
  initSettings()
})

const saveSettings = () => {
  emit('save', {
    title: localSettings.value.title,
    config: localSettings.value.config
  })
}
</script>

<style scoped>
.settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.settings-modal {
  background-color: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  width: 90%;
  max-width: 480px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #333;
}

.settings-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #e0e0e0;
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #888;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background-color: #333;
  color: #fff;
}

.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.settings-section {
  margin-bottom: 24px;
}

.settings-section:last-child {
  margin-bottom: 0;
}

.settings-section h4 {
  margin: 0 0 12px 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a73e8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: #aaa;
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  background-color: #222;
  border: 1px solid #333;
  border-radius: 6px;
  color: #e0e0e0;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #1a73e8;
}

.form-input::placeholder {
  color: #555;
}

select.form-input {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}

.color-input-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
}

.color-input {
  width: 48px;
  height: 40px;
  padding: 4px;
  cursor: pointer;
  flex-shrink: 0;
}

.color-text {
  flex: 1;
}

.checkbox-group {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #ccc;
}

.checkbox-input {
  width: 16px;
  height: 16px;
  accent-color: #1a73e8;
  cursor: pointer;
}

.hint {
  display: block;
  font-size: 0.625rem;
  color: #666;
  margin-top: 4px;
}

.info-text {
  font-size: 0.75rem;
  color: #888;
  margin: 0;
  line-height: 1.5;
}

.settings-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #333;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background-color: #333;
  color: #ccc;
}

.btn-cancel:hover {
  background-color: #444;
}

.btn-save {
  background-color: #1a73e8;
  color: #fff;
}

.btn-save:hover {
  background-color: #1557b0;
}
</style>
