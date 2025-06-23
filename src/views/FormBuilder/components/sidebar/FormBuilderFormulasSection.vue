<template>
  <AccordionSection title="Form Formulas">
    <div class="mb-4">
      <div class="flex items-center mb-2">
        <div class="bg-green-100 p-1 rounded-full mr-2">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-4 w-4 text-green-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" 
            />
          </svg>
        </div>
        <h4 class="font-medium text-gray-700">
          Formula Testing
        </h4>
      </div>
      <p class="text-sm text-gray-500 mb-3 pl-7">
        Test your form formulas in a live preview environment to validate calculation and visibility rules.
      </p>
      <button
        class="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm flex items-center justify-center"
        @click="$emit('open-formula-preview')"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          class="h-4 w-4 mr-2" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 012-2h2a2 2 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
          />
        </svg>
        <span>Test Form Formulas</span>
      </button>
    </div>
    
    <div class="formula-info bg-blue-50 p-3 rounded mb-4">
      <div class="flex items-center mb-2">
        <div class="bg-blue-200 p-1 rounded-full mr-2">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-4 w-4 text-blue-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        <h4 class="font-medium text-blue-700">
          Formula Features
        </h4>
      </div>
      <ul class="text-xs text-blue-700 list-disc pl-7">
        <li class="mb-1">
          Create calculated fields based on other field values
        </li>
        <li class="mb-1">
          Implement conditional visibility for fields, sections, and tabs
        </li>
        <li class="mb-1">
          Use mathematical operations and logical conditions in formulas
        </li>
        <li class="mb-1">
          Reference other fields using field('fieldname') syntax
        </li>
      </ul>
    </div>
    
    <div class="formula-types grid grid-cols-2 gap-3 mb-4">
      <div class="bg-purple-50 p-3 rounded border border-purple-100">
        <h5 class="text-xs font-medium text-purple-700 mb-2">
          Calculation Formulas
        </h5>
        <p class="text-xs text-purple-600 mb-2">
          Automatically calculate values based on other fields.
        </p>
      </div>
      <div class="bg-amber-50 p-3 rounded border border-amber-100">
        <h5 class="text-xs font-medium text-amber-700 mb-2">
          Visibility Formulas
        </h5>
        <p class="text-xs text-amber-600 mb-2">
          Show or hide elements based on conditions.
        </p>
      </div>
    </div>
    
    <div class="formula-examples mb-4">
      <div class="flex items-center mb-2">
        <div class="bg-gray-200 p-1 rounded-full mr-2">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-4 w-4 text-gray-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        </div>
        <h4 class="font-medium text-gray-700">
          Example Formulas
        </h4>
      </div>
      <div class="bg-gray-50 p-3 rounded border border-gray-200 text-xs">
        <div class="mb-3">
          <div class="font-medium text-gray-700 mb-1">
            BMI Calculation:
          </div>
          <pre class="bg-white p-2 rounded border border-gray-200">field('weight') / (field('height') * field('height'))</pre>
        </div>
        <div class="mb-3">
          <div class="font-medium text-gray-700 mb-1">
            Total Price:
          </div>
          <pre class="bg-white p-2 rounded border border-gray-200">field('price') * field('quantity') * (1 - field('discount') / 100)</pre>
        </div>
        <div class="mb-3">
          <div class="font-medium text-gray-700 mb-1">
            Show if age > 18:
          </div>
          <pre class="bg-white p-2 rounded border border-gray-200">field('age') > 18</pre>
        </div>
        <div>
          <div class="font-medium text-gray-700 mb-1">
            Complex condition:
          </div>
          <pre class="bg-white p-2 rounded border border-gray-200">field('category') === 'premium' && field('subscription') === true</pre>
        </div>
      </div>
    </div>
  </AccordionSection>
</template>

<script setup lang="ts">
import AccordionSection from "../../../../components/ui/AccordionSection.vue";

defineEmits<{
  'open-formula-preview': [];
}>();
</script>
