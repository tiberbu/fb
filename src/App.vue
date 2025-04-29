<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <h1 class="text-2xl font-semibold text-gray-900">Form Builder</h1>
      </div>
    </header>
    <main>
      <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import './assets/css/form-builder-enhanced.css';
import './assets/css/form-inputs.css';
</script>
