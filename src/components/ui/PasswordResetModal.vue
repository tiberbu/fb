<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">
          Reset Password for {{ user?.username }}
        </h3>
        <button class="modal-close" @click="$emit('close')">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-group">
          <label for="newPassword" class="form-label">New Password</label>
          <input
            id="newPassword"
            v-model="form.newPassword"
            type="password"
            required
            class="form-input"
            :class="{ 'form-input-error': errors.newPassword }"
            placeholder="Enter new password"
          />
          <span v-if="errors.newPassword" class="form-error">{{ errors.newPassword }}</span>
        </div>

        <div class="form-group">
          <label for="confirmPassword" class="form-label">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            required
            class="form-input"
            :class="{ 'form-input-error': errors.confirmPassword }"
            placeholder="Confirm new password"
          />
          <span v-if="errors.confirmPassword" class="form-error">{{ errors.confirmPassword }}</span>
        </div>

        <div class="password-requirements">
          <h4>Password Requirements:</h4>
          <ul>
            <li :class="{ 'requirement-met': form.newPassword.length >= 6 }">
              At least 6 characters
            </li>
            <li :class="{ 'requirement-met': /[A-Z]/.test(form.newPassword) }">
              At least one uppercase letter
            </li>
            <li :class="{ 'requirement-met': /[a-z]/.test(form.newPassword) }">
              At least one lowercase letter
            </li>
            <li :class="{ 'requirement-met': /\d/.test(form.newPassword) }">
              At least one number
            </li>
          </ul>
        </div>

        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="isSubmitting || !isFormValid"
          >
            {{ isSubmitting ? 'Resetting...' : 'Reset Password' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { User } from '@/types/auth'

interface Props {
  user?: User | null
}

interface Emits {
  (e: 'close'): void
  (e: 'save', password: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Form state
const form = ref({
  newPassword: '',
  confirmPassword: ''
})

const isSubmitting = ref(false)
const errors = ref({
  newPassword: '',
  confirmPassword: ''
})

// Computed
const isFormValid = computed(() => {
  return form.value.newPassword.length >= 6 &&
         form.value.newPassword === form.value.confirmPassword
})

// Methods
const validateForm = (): boolean => {
  errors.value = {
    newPassword: '',
    confirmPassword: ''
  }

  let isValid = true

  if (!form.value.newPassword) {
    errors.value.newPassword = 'Password is required'
    isValid = false
  } else if (form.value.newPassword.length < 6) {
    errors.value.newPassword = 'Password must be at least 6 characters'
    isValid = false
  }

  if (!form.value.confirmPassword) {
    errors.value.confirmPassword = 'Please confirm the password'
    isValid = false
  } else if (form.value.newPassword !== form.value.confirmPassword) {
    errors.value.confirmPassword = 'Passwords do not match'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true

  try {
    emit('save', form.value.newPassword)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-width: 400px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 16px;
  margin-bottom: 24px;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  color: #6b7280;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 0 24px;
  flex: 1;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input-error {
  border-color: #ef4444;
}

.form-error {
  display: block;
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
}

.password-requirements {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.password-requirements h4 {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px 0;
}

.password-requirements ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.password-requirements li {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.password-requirements li:before {
  content: '✗';
  color: #ef4444;
  margin-right: 8px;
  font-weight: bold;
}

.password-requirements li.requirement-met {
  color: #059669;
}

.password-requirements li.requirement-met:before {
  content: '✓';
  color: #059669;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #e5e7eb;
  margin-top: 24px;
}

.btn {
  padding: 12px 24px;
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border-color: #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}
</style>
