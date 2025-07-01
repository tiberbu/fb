<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="$emit('close')"></div>

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
        <div>
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
            <svg class="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div class="mt-3 text-center sm:mt-5">
            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
              {{ user ? 'Edit User' : 'Create New User' }}
            </h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                {{ user ? 'Update user information and permissions' : 'Add a new user to the system' }}
              </p>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="mt-6 space-y-4">
          <!-- Username -->
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              :disabled="isLoading"
            />
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              :disabled="isLoading"
            />
          </div>

          <!-- Password (only for new users) -->
          <div v-if="!user">
            <label for="password" class="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              :disabled="isLoading"
            />
          </div>

          <!-- Role -->
          <div>
            <label for="role" class="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              id="role"
              v-model="form.role"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              :disabled="isLoading"
            >
              <option value="">Select a role</option>
              <option value="Administrator">Administrator</option>
              <option value="Manager">Manager</option>
              <option value="User">User</option>
            </select>
          </div>

          <!-- Companies -->
          <div>
            <label for="companies" class="block text-sm font-medium text-gray-700">
              Companies
            </label>
            <div class="mt-1">
              <div class="flex flex-wrap gap-2 mb-2">
                <span
                  v-for="(company, index) in form.companies"
                  :key="index"
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                >
                  {{ company }}
                  <button
                    type="button"
                    @click="removeCompany(index)"
                    class="ml-1 text-indigo-600 hover:text-indigo-800"
                    :disabled="isLoading"
                  >
                    <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              </div>
              <div class="flex">
                <input
                  v-model="newCompany"
                  type="text"
                  placeholder="Enter company name"
                  class="flex-1 border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  :disabled="isLoading"
                  @keyup.enter="addCompany"
                />
                <button
                  type="button"
                  @click="addCompany"
                  class="px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  :disabled="isLoading || !newCompany.trim()"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <!-- Active Status (only for editing) -->
          <div v-if="user" class="flex items-center">
            <input
              id="isActive"
              v-model="form.isActive"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              :disabled="isLoading"
            />
            <label for="isActive" class="ml-2 block text-sm text-gray-900">
              Active
            </label>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-md">
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>

          <!-- Actions -->
          <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-black text-base font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black sm:col-start-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isLoading ? 'Saving...' : (user ? 'Update User' : 'Create User') }}
            </button>
            <button
              type="button"
              @click="$emit('close')"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black sm:mt-0 sm:col-start-1 sm:text-sm"
              :disabled="isLoading"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { User, CreateUserData, UpdateUserData } from '../../types/auth'

interface Props {
  isOpen: boolean
  user?: User | null
}

interface Emits {
  (e: 'close'): void
  (e: 'save', data: CreateUserData | UpdateUserData): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Component state
const isLoading = ref(false)
const error = ref('')
const newCompany = ref('')

// Form data
const form = reactive({
  username: '',
  email: '',
  password: '',
  role: '' as 'Administrator' | 'Manager' | 'User' | '',
  companies: [] as string[],
  isActive: true
})

// Watch for user prop changes to populate form
watch(() => props.user, (user) => {
  if (user) {
    form.username = user.username
    form.email = user.email
    form.password = ''
    form.role = user.role
    form.companies = [...user.companies]
    form.isActive = user.isActive
  } else {
    // Reset form for new user
    form.username = ''
    form.email = ''
    form.password = ''
    form.role = ''
    form.companies = []
    form.isActive = true
  }
  error.value = ''
}, { immediate: true })

// Methods
const addCompany = () => {
  const company = newCompany.value.trim()
  if (company && !form.companies.includes(company)) {
    form.companies.push(company)
    newCompany.value = ''
  }
}

const removeCompany = (index: number) => {
  form.companies.splice(index, 1)
}

const handleSubmit = async () => {
  error.value = ''
  
  if (!form.username.trim()) {
    error.value = 'Username is required'
    return
  }
  
  if (!form.email.trim()) {
    error.value = 'Email is required'
    return
  }
  
  if (!props.user && !form.password.trim()) {
    error.value = 'Password is required'
    return
  }
  
  if (!form.role) {
    error.value = 'Role is required'
    return
  }

  const userData = {
    username: form.username.trim(),
    email: form.email.trim(),
    role: form.role,
    companies: form.companies,
    ...(props.user ? { isActive: form.isActive } : { password: form.password })
  }

  emit('save', userData)
}
</script>
