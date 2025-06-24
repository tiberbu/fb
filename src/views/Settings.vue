<template>
  <div class="settings-page">
    <div class="settings-container">
      <!-- General Settings -->
      <div class="settings-section">
        <div class="section-header">
          <h3 class="section-title">
            General Settings
          </h3>
          <p class="section-description">
            Configure basic application preferences
          </p>
        </div>
        
        <div class="settings-form">
          <div class="form-group">
            <label class="form-label">
              Application Name
            </label>
            <input 
              v-model="settings.appName"
              type="text"
              class="form-input"
              placeholder="Enter application name"
            >
          </div>
          
          <div class="form-group">
            <label class="form-label">
              Default Language
            </label>
            <select 
              v-model="settings.language"
              class="form-select"
            >
              <option value="en">
                English
              </option>
              <option value="es">
                Spanish
              </option>
              <option value="fr">
                French
              </option>
              <option value="de">
                German
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">
              Timezone
            </label>
            <select 
              v-model="settings.timezone"
              class="form-select"
            >
              <option value="UTC">
                UTC
              </option>
              <option value="America/New_York">
                Eastern Time
              </option>
              <option value="America/Chicago">
                Central Time
              </option>
              <option value="America/Denver">
                Mountain Time
              </option>
              <option value="America/Los_Angeles">
                Pacific Time
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Form Settings -->
      <div class="settings-section">
        <div class="section-header">
          <h3 class="section-title">
            Form Settings
          </h3>
          <p class="section-description">
            Default settings for new forms
          </p>
        </div>
        
        <div class="settings-form">
          <div class="form-group">
            <div class="checkbox-group">
              <input 
                id="auto-save"
                v-model="settings.autoSave"
                type="checkbox"
                class="form-checkbox"
              >
              <label 
                for="auto-save"
                class="checkbox-label"
              >
                Enable auto-save
              </label>
            </div>
            <p class="form-help">
              Automatically save form progress as users fill it out
            </p>
          </div>
          
          <div class="form-group">
            <div class="checkbox-group">
              <input 
                id="email-notifications"
                v-model="settings.emailNotifications"
                type="checkbox"
                class="form-checkbox"
              >
              <label 
                for="email-notifications"
                class="checkbox-label"
              >
                Email notifications
              </label>
            </div>
            <p class="form-help">
              Send email notifications when forms are submitted
            </p>
          </div>
          
          <div class="form-group">
            <label class="form-label">
              Default Submit Message
            </label>
            <textarea 
              v-model="settings.defaultSubmitMessage"
              class="form-textarea"
              rows="3"
              placeholder="Thank you for your submission!"
            />
          </div>
        </div>
      </div>

      <!-- Security Settings -->
      <div class="settings-section">
        <div class="section-header">
          <h3 class="section-title">
            Security Settings
          </h3>
          <p class="section-description">
            Configure security and privacy options
          </p>
        </div>
        
        <div class="settings-form">
          <div class="form-group">
            <div class="checkbox-group">
              <input 
                id="require-captcha"
                v-model="settings.requireCaptcha"
                type="checkbox"
                class="form-checkbox"
              >
              <label 
                for="require-captcha"
                class="checkbox-label"
              >
                Require CAPTCHA
              </label>
            </div>
            <p class="form-help">
              Add CAPTCHA verification to prevent spam submissions
            </p>
          </div>
          
          <div class="form-group">
            <div class="checkbox-group">
              <input 
                id="data-retention"
                v-model="settings.dataRetention"
                type="checkbox"
                class="form-checkbox"
              >
              <label 
                for="data-retention"
                class="checkbox-label"
              >
                Automatic data retention
              </label>
            </div>
            <p class="form-help">
              Automatically delete submissions after a specified period
            </p>
          </div>
          
          <div 
            v-if="settings.dataRetention"
            class="form-group"
          >
            <label class="form-label">
              Retention Period (days)
            </label>
            <input 
              v-model.number="settings.retentionDays"
              type="number"
              class="form-input"
              min="1"
              placeholder="365"
            >
          </div>
        </div>
      </div>

      <!-- API Settings -->
      <div class="settings-section">
        <div class="section-header">
          <h3 class="section-title">
            API Settings
          </h3>
          <p class="section-description">
            Configure API access and webhooks
          </p>
        </div>
        
        <div class="settings-form">
          <div class="form-group">
            <label class="form-label">
              API Base URL
            </label>
            <input 
              v-model="settings.apiBaseUrl"
              type="url"
              class="form-input"
              placeholder="https://api.example.com"
            >
          </div>
          
          <div class="form-group">
            <label class="form-label">
              Webhook URL
            </label>
            <input 
              v-model="settings.webhookUrl"
              type="url"
              class="form-input"
              placeholder="https://your-site.com/webhook"
            >
            <p class="form-help">
              Receive form submissions via webhook
            </p>
          </div>
          
          <div class="form-group">
            <div class="api-key-section">
              <label class="form-label">
                API Key
              </label>
              <div class="api-key-input">
                <input 
                  v-model="settings.apiKey"
                  :type="showApiKey ? 'text' : 'password'"
                  class="form-input"
                  placeholder="Your API key"
                  readonly
                >
                <button 
                  type="button"
                  class="toggle-visibility-btn"
                  @click="toggleApiKeyVisibility"
                >
                  <i :class="showApiKey ? 'fas fa-eye-slash' : 'fas fa-eye'" />
                </button>
              </div>
              <div class="api-key-actions">
                <button 
                  type="button"
                  class="btn btn-secondary btn-sm"
                  @click="generateApiKey"
                >
                  Generate New Key
                </button>
                <button 
                  type="button"
                  class="btn btn-secondary btn-sm"
                  @click="copyApiKey"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="settings-actions">
        <button 
          type="button"
          class="btn btn-secondary"
          @click="resetSettings"
        >
          Reset to Defaults
        </button>
        
        <div class="action-group">
          <button 
            type="button"
            class="btn btn-secondary"
            @click="exportSettings"
          >
            Export Settings
          </button>
          
          <button 
            type="button"
            :disabled="!hasChanges"
            class="btn btn-primary"
            @click="saveSettings"
          >
            <i 
              v-if="saving"
              class="fas fa-spinner fa-spin"
            />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface AppSettings {
  appName: string
  language: string
  timezone: string
  autoSave: boolean
  emailNotifications: boolean
  defaultSubmitMessage: string
  requireCaptcha: boolean
  dataRetention: boolean
  retentionDays: number
  apiBaseUrl: string
  webhookUrl: string
  apiKey: string
}

const settings = ref<AppSettings>({
  appName: 'Form Builder',
  language: 'en',
  timezone: 'UTC',
  autoSave: true,
  emailNotifications: true,
  defaultSubmitMessage: 'Thank you for your submission! We will get back to you soon.',
  requireCaptcha: false,
  dataRetention: false,
  retentionDays: 365,
  apiBaseUrl: 'http://localhost:3001/api',
  webhookUrl: '',
  apiKey: 'fb_key_' + Math.random().toString(36).substring(2, 15)
})

const originalSettings = ref<AppSettings>({ ...settings.value })
const saving = ref(false)
const showApiKey = ref(false)

const hasChanges = computed(() => {
  return JSON.stringify(settings.value) !== JSON.stringify(originalSettings.value)
})

const toggleApiKeyVisibility = () => {
  showApiKey.value = !showApiKey.value
}

const generateApiKey = () => {
  settings.value.apiKey = 'fb_key_' + Math.random().toString(36).substring(2, 15) + 
                          Math.random().toString(36).substring(2, 15)
}

const copyApiKey = async () => {
  try {
    await navigator.clipboard.writeText(settings.value.apiKey)
    // In a real app, show a toast notification
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = settings.value.apiKey
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }
}

const saveSettings = async () => {
  saving.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Update original settings to reflect saved state
    originalSettings.value = { ...settings.value }
    
    // In a real app, save to localStorage or API
    localStorage.setItem('formBuilderSettings', JSON.stringify(settings.value))
    
  } catch (error) {
    // Handle error
  } finally {
    saving.value = false
  }
}

const resetSettings = () => {
  const defaultSettings: AppSettings = {
    appName: 'Form Builder',
    language: 'en',
    timezone: 'UTC',
    autoSave: true,
    emailNotifications: true,
    defaultSubmitMessage: 'Thank you for your submission! We will get back to you soon.',
    requireCaptcha: false,
    dataRetention: false,
    retentionDays: 365,
    apiBaseUrl: 'http://localhost:3001/api',
    webhookUrl: '',
    apiKey: settings.value.apiKey // Keep existing API key
  }
  
  settings.value = { ...defaultSettings }
}

const exportSettings = () => {
  const { apiKey: _apiKey, ...exportData } = settings.value // Exclude sensitive data
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json'
  })
  
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'form-builder-settings.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

onMounted(() => {
  // Load settings from localStorage
  const savedSettings = localStorage.getItem('formBuilderSettings')
  if (savedSettings) {
    try {
      const parsed = JSON.parse(savedSettings)
      settings.value = { ...settings.value, ...parsed }
      originalSettings.value = { ...settings.value }
    } catch (error) {
      // Handle error
    }
  }
})
</script>

<style scoped>
.settings-page {
  max-width: 800px;
  margin: 0 auto;
}

.settings-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.settings-section {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.section-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  background: #f9fafb;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.section-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.settings-form {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-help {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.form-checkbox {
  width: 1rem;
  height: 1rem;
  accent-color: #667eea;
}

.checkbox-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
}

.api-key-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.api-key-input {
  position: relative;
}

.toggle-visibility-btn {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: color 0.2s ease;
}

.toggle-visibility-btn:hover {
  color: #374151;
}

.api-key-actions {
  display: flex;
  gap: 0.75rem;
}

.settings-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.action-group {
  display: flex;
  gap: 0.75rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

/* Responsive Design */
@media (max-width: 768px) {
  .settings-actions {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .action-group {
    justify-content: stretch;
  }
  
  .btn {
    flex: 1;
    justify-content: center;
  }
  
  .api-key-actions {
    flex-direction: column;
  }
  
  .section-header {
    padding: 1rem;
  }
  
  .settings-form {
    padding: 1rem;
  }
}
</style>
