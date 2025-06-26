<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast" tag="div">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'toast',
            `toast-${toast.type}`,
            { 'toast-persistent': toast.persistent }
          ]"
          @click="removeToast(toast.id)"
        >
          <div class="toast-content">
            <div class="toast-icon">
              <i :class="getIconClass(toast.type)" />
            </div>
            <div class="toast-text">
              <div class="toast-title">{{ toast.title }}</div>
              <div v-if="toast.message" class="toast-message">{{ toast.message }}</div>
            </div>
            <button
              class="toast-close"
              @click.stop="removeToast(toast.id)"
              aria-label="Close notification"
            >
              <i class="fas fa-times" />
            </button>
          </div>
          
          <!-- Progress bar for non-persistent toasts -->
          <div 
            v-if="!toast.persistent && toast.duration"
            class="toast-progress"
            :style="{ animationDuration: `${toast.duration}ms` }"
          />
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '../../composables/useToast';

const { toasts, removeToast } = useToast();

const getIconClass = (type: string) => {
  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle',
  };
  return icons[type as keyof typeof icons] || icons.info;
};
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  pointer-events: none;
  max-width: 400px;
  width: 100%;
}

.toast {
  pointer-events: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 0.5rem;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid;
}

.toast:hover {
  transform: translateX(-4px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15), 0 6px 10px rgba(0, 0, 0, 0.08);
}

.toast-success {
  border-left-color: #10b981;
}

.toast-error {
  border-left-color: #ef4444;
}

.toast-warning {
  border-left-color: #f59e0b;
}

.toast-info {
  border-left-color: #3b82f6;
}

.toast-content {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  gap: 0.75rem;
}

.toast-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-success .toast-icon {
  color: #10b981;
}

.toast-error .toast-icon {
  color: #ef4444;
}

.toast-warning .toast-icon {
  color: #f59e0b;
}

.toast-info .toast-icon {
  color: #3b82f6;
}

.toast-text {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 600;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: #1f2937;
  margin-bottom: 0.125rem;
}

.toast-message {
  font-size: 0.8125rem;
  line-height: 1.25rem;
  color: #6b7280;
}

.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.toast-close:hover {
  color: #6b7280;
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, currentColor, currentColor);
  animation: toast-progress linear forwards;
  opacity: 0.3;
}

.toast-success .toast-progress {
  color: #10b981;
}

.toast-error .toast-progress {
  color: #ef4444;
}

.toast-warning .toast-progress {
  color: #f59e0b;
}

.toast-info .toast-progress {
  color: #3b82f6;
}

@keyframes toast-progress {
  0% {
    width: 100%;
  }
  100% {
    width: 0%;
  }
}

/* Transitions */
.toast-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 1, 0.5);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Mobile responsiveness */
@media (max-width: 640px) {
  .toast-container {
    left: 1rem;
    right: 1rem;
    max-width: none;
  }
  
  .toast {
    margin-bottom: 0.75rem;
  }
  
  .toast-content {
    padding: 0.875rem;
  }
}
</style>
