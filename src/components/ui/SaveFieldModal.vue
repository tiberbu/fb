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
          Save Field Configuration
        </h3>
        <button
          class="modal-close"
          @click="$emit('cancel')"
        >
          <i class="fas fa-times" />
        </button>
      </div>

      <div class="modal-body">
        <div class="field-preview mb-4">
          <h4 class="preview-title">
            Field Preview
          </h4>
          <div class="preview-card">
            <div class="field-type-badge">
              <i :class="getFieldIcon(field.type)" />
              {{ field.type.charAt(0).toUpperCase() + field.type.slice(1) }}
            </div>
            <div class="field-details">
              <div class="field-name">
                {{ field.label || field.name }}
              </div>
              <div 
                v-if="field.placeholder"
                class="field-placeholder"
              >
                Placeholder: {{ field.placeholder }}
              </div>
              <div class="field-properties">
                <span 
                  v-if="field.required"
                  class="property-tag required"
                >
                  Required
                </span>
                <span 
                  v-if="field.formulas && field.formulas.length > 0"
                  class="property-tag formula"
                >
                  Has Formulas
                </span>
                <span 
                  v-if="field.options && field.options.length > 0"
                  class="property-tag options"
                >
                  {{ field.options.length }} Options
                </span>
              </div>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleSave">
          <div class="form-group">
            <label class="form-label">
              Field Name *
            </label>
            <input
              v-model="formData.name"
              type="text"
              class="form-input"
              placeholder="Enter a unique name for this field"
              required
            >
            <div class="form-help">
              This name will be used to identify the field in the stored fields list
            </div>
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
            <div class="form-help">
              Optional description to help identify when to use this field
            </div>
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
            <div class="form-help">
              Add tags to categorize and easily find this field later. Press Enter or comma to add tags.
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
          :disabled="!formData.name"
          @click="handleSave"
        >
          <i class="fas fa-save mr-2" />
          Save Field
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import type { Control } from '../../types';

const props = defineProps<{
  field: Control;
}>();

const emit = defineEmits<{
  save: [data: { name: string; description: string; tags: string[] }];
  cancel: [];
}>();

const formData = reactive({
  name: '',
  description: '',
  tags: [] as string[]
});

const newTag = ref('');

// Initialize form data
onMounted(() => {
  formData.name = props.field.name || `${props.field.type}_field`;
  formData.description = props.field.helpText || '';
  formData.tags = [props.field.type];
});

function getFieldIcon(fieldType: string): string {
  const iconMap: Record<string, string> = {
    text: 'fas fa-font',
    textarea: 'fas fa-align-left',
    number: 'fas fa-hashtag',
    email: 'fas fa-envelope',
    phone: 'fas fa-phone',
    url: 'fas fa-link',
    password: 'fas fa-lock',
    select: 'fas fa-caret-down',
    radio: 'fas fa-dot-circle',
    checkbox: 'fas fa-check-square',
    date: 'fas fa-calendar-alt',
    datetime: 'fas fa-calendar-plus',
    time: 'fas fa-clock',
    file: 'fas fa-file-upload',
    image: 'fas fa-image',
    range: 'fas fa-sliders-h',
    color: 'fas fa-palette',
    table: 'fas fa-table',
    hidden: 'fas fa-eye-slash',
    readonly: 'fas fa-eye'
  };
  return iconMap[fieldType] || 'fas fa-question-circle';
}

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
  if (!formData.name.trim()) return;
  
  emit('save', {
    name: formData.name.trim(),
    description: formData.description.trim(),
    tags: formData.tags
  });
}

function handleOverlayClick() {
  emit('cancel');
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

/* Field Preview */
.preview-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.preview-card {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background-color: #f9fafb;
}

.field-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #3b82f6;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.field-name {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
}

.field-placeholder {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.field-properties {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.property-tag {
  padding: 0.125rem 0.5rem;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: 500;
}

.property-tag.required {
  background-color: #fef2f2;
  color: #dc2626;
}

.property-tag.formula {
  background-color: #f0f9ff;
  color: #0369a1;
}

.property-tag.options {
  background-color: #f0fdf4;
  color: #16a34a;
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

.form-help {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
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
