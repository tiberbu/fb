<template>
  <div class="form-sections">
    <div
      v-for="section in visibleSections"
      :key="section.id"
      class="form-section"
    >
      <!-- Section Header -->
      <div
        v-if="(!section.hideTitle) || (!section.hideSubtitle && section.subtitle)"
        class="section-header"
      >
        <h3 
          v-if="!section.hideTitle"
          class="section-title"
        >
          {{ section.title || 'Untitled Section' }}
        </h3>
        <p
          v-if="!section.hideSubtitle && section.subtitle"
          class="section-subtitle"
        >
          {{ section.subtitle }}
        </p>
      </div>
      
      <!-- Section Content -->
      <div class="section-content">
        <div
          v-for="row in section.rows"
          :key="row.id"
          class="section-row"
        >
          <div class="row-columns">
            <div
              v-for="(column, colIndex) in row.columns"
              :key="colIndex"
              :class="getColumnClasses(column)"
            >
              <div
                v-for="field in column.fields"
                v-show="!isFieldHidden(field.id)"
                :key="field.id"
                :class="getFieldClasses(field)"
                :style="getFieldStyles(field)"
              >
                <FormControl
                  :control="field"
                  :model-value="getFieldValue(field)"
                  :is-required="isFieldRequired(field)"
                  :is-read-only="isFieldReadOnly(field)"
                  :is-preview="true"
                  @update:model-value="$emit('update-field', field, $event)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import FormControl from './FormControl.vue';

interface Props {
  sections: any[];
  formValues: Record<string, any>;
  fieldVisibility: Record<string, boolean>;
  fieldReadOnly: Record<string, boolean>;
  fieldRequired: Record<string, boolean>;
  sectionVisibility: Record<string, boolean>;
}

const props = defineProps<Props>();

defineEmits(['update-field']);

// Computed properties
const visibleSections = computed(() => {
  return props.sections?.filter(section => !isSectionHidden(section.id)) || [];
});

// Helper functions
function isSectionHidden(sectionId: string): boolean {
  return props.sectionVisibility[sectionId] === false;
}

function isFieldHidden(fieldId: string): boolean {
  return props.fieldVisibility[fieldId] === false;
}

function isFieldReadOnly(field: any): boolean {
  return props.fieldReadOnly[field.id] === true || field.isReadonly === true;
}

function isFieldRequired(field: any): boolean {
  return props.fieldRequired[field.id] === true || field.required === true;
}

function getFieldValue(field: any) {
  return props.formValues[field.name] !== undefined 
    ? props.formValues[field.name] 
    : field.defaultValue || '';
}

function getColumnClasses(column: any) {
  const classes = ['form-column'];
  
  // Add responsive classes based on column width
  if (column.width) {
    classes.push(`col-${column.width}`);
  } else {
    classes.push('col-auto');
  }
  
  // Hide empty columns
  if (!column.fields || column.fields.length === 0) {
    classes.push('hidden');
  }
  
  return classes;
}

function getFieldClasses(field: any) {
  const classes = ['form-field'];
  
  // Add custom CSS classes if specified
  if (field.cssClasses) {
    classes.push(...field.cssClasses.split(' ').filter((cls: string) => cls.trim()));
  }
  
  // Add field type class
  if (field.type) {
    classes.push(`field-${field.type.toLowerCase()}`);
  }
  
  return classes;
}

function getFieldStyles(field: any) {
  const styles: any = {};
  
  // Apply padding styles
  if (field.padding) {
    if (field.padding.top) styles.paddingTop = field.padding.top;
    if (field.padding.right) styles.paddingRight = field.padding.right;
    if (field.padding.bottom) styles.paddingBottom = field.padding.bottom;
    if (field.padding.left) styles.paddingLeft = field.padding.left;
  }
  
  // Apply margin styles
  if (field.margin) {
    if (field.margin.top) styles.marginTop = field.margin.top;
    if (field.margin.right) styles.marginRight = field.margin.right;
    if (field.margin.bottom) styles.marginBottom = field.margin.bottom;
    if (field.margin.left) styles.marginLeft = field.margin.left;
  }
  
  return styles;
}
</script>

<style scoped>
.form-sections {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.form-section {
  margin-bottom: 0;
}

.section-header {
  margin-bottom: 1.25rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.75rem 0;
  padding: 0;
  line-height: 1.4;
}

.section-subtitle {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.section-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-row {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.row-columns {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.form-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-column.hidden {
  display: none;
}

/* Column width classes for better control */
.col-1 { grid-column: span 1; max-width: 8.333333%; }
.col-2 { grid-column: span 1; max-width: 16.666667%; }
.col-3 { grid-column: span 1; max-width: 25%; }
.col-4 { grid-column: span 1; max-width: 33.333333%; }
.col-5 { grid-column: span 1; max-width: 41.666667%; }
.col-6 { grid-column: span 1; max-width: 50%; }
.col-7 { grid-column: span 1; max-width: 58.333333%; }
.col-8 { grid-column: span 1; max-width: 66.666667%; }
.col-9 { grid-column: span 1; max-width: 75%; }
.col-10 { grid-column: span 1; max-width: 83.333333%; }
.col-11 { grid-column: span 1; max-width: 91.666667%; }
.col-12 { grid-column: span 1; max-width: 100%; }
.col-auto { grid-column: span 1; }

.form-field {
  margin-bottom: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .row-columns {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .form-column {
    max-width: 100% !important;
  }
}

/* Paper form specific styling */
@media print {
  .form-sections {
    gap: 1rem;
  }
  
  .section-row {
    page-break-inside: avoid;
  }
  
  .form-section {
    page-break-inside: avoid;
  }
}
</style>
