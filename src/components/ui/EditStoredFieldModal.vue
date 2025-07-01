<template>
  <div 
    class="modal-overlay"
    @click="handleOverlayClick"
  >
    <div 
      class="modal-content"
      @click.stop
    >
      <div class="modal-header">
        <h3 class="modal-title">
          Edit Stored Field
        </h3>
        <button
          class="modal-close"
          @click="$emit('cancel')"
        >
          <i class="fas fa-times" />
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSave">
          <div class="form-group">
            <label class="form-label">
              Field Name *
            </label>
            <input
              v-model="formData.name"
              type="text"
              class="form-input"
              placeholder="Enter field name"
              required
            >
          </div>

          <div class="form-group">
            <label class="form-label">
              Field Label *
            </label>
            <input
              v-model="formData.label"
              type="text"
              class="form-input"
              placeholder="Enter field label"
              required
            >
          </div>

          <div class="form-group">
            <label class="form-label">
              Description
            </label>
            <textarea
              v-model="formData.description"
              class="form-textarea"
              placeholder="Describe what this field is used for..."
              rows="3"
            />
          </div>

          <div class="form-group">
            <label class="form-label">
              Tags
            </label>
            <div class="tags-input">
              <div
                v-for="(tag, index) in formData.tags"
                :key="index"
                class="tag-item"
              >
                {{ tag }}
                <button
                  type="button"
                  class="tag-remove"
                  @click="removeTag(index)"
                >
                  <i class="fas fa-times" />
                </button>
              </div>
              <input
                v-model="newTag"
                type="text"
                class="tag-input"
                placeholder="Add tags..."
                @keydown.enter.prevent="addTag"
              >
            </div>
          </div>

          <div class="form-group">
            <div class="field-stats">
              <div class="stat-item">
                <i class="fas fa-chart-bar" />
                <span>Used {{ field.usageCount }} times</span>
              </div>
              <div class="stat-item">
                <i class="fas fa-calendar" />
                <span>Created {{ formatDate(field.createdAt) }}</span>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <button
          type="button"
          class="btn btn-secondary"
          @click="$emit('cancel')"
        >
          Cancel
        </button>
        <button
          type="button"
          class="btn btn-primary"
          :disabled="!formData.name || !formData.label"
          @click="handleSave"
        >
          <i class="fas fa-save mr-2" />
          Update Field
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import type { StoredField } from '../../services/StoredFieldsAPI';

const props = defineProps<{
  field: StoredField;
}>();

const emit = defineEmits<{
  save: [field: StoredField];
  cancel: [];
}>();

const formData = reactive({
  name: '',
  label: '',
  description: '',
  tags: [] as string[]
});

const newTag = ref('');

// Initialize form data
onMounted(() => {
  formData.name = props.field.name;
  formData.label = props.field.label;
  formData.description = props.field.description || '';
  formData.tags = [...props.field.tags];
});

function addTag() {
  if (newTag.value.trim() && !formData.tags.includes(newTag.value.trim())) {
    formData.tags.push(newTag.value.trim());
    newTag.value = '';
  }
}

function removeTag(index: number) {
  formData.tags.splice(index, 1);
}

function handleSave() {
  if (!formData.name.trim() || !formData.label.trim()) return;
  
  const updatedField: StoredField = {
    ...props.field,
    name: formData.name.trim(),
    label: formData.label.trim(),
    description: formData.description.trim(),
    tags: formData.tags
  };
  
  emit('save', updatedField);
}

function handleOverlayClick() {
  emit('cancel');
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString();
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.modal-close {
  padding: 0.5rem;
  border: none;
  background: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 4px;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

/* Form Elements */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Tags Input */
.tags-input {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background-color: white;
  min-height: 2.5rem;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background-color: #3b82f6;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.tag-remove {
  border: none;
  background: none;
  color: white;
  cursor: pointer;
  padding: 0.125rem;
  border-radius: 2px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.tag-remove:hover {
  opacity: 1;
}

.tag-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.875rem;
  min-width: 100px;
}

/* Field Stats */
.field-stats {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.stat-item i {
  color: #9ca3af;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: white;
  color: #374151;
  border-color: #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #f9fafb;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}
</style>
