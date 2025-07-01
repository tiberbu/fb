<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          User Management
        </h1>
        <p class="mt-1 text-sm text-gray-600">
          Manage users and their access to the system
        </p>
      </div>
      <button
        class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
        @click="showCreateModal = true"
      >
        <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add User
      </button>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search users..."
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-black"
            @input="debouncedSearch"
          >
        </div>
        <div class="sm:w-48">
          <select
            v-model="roleFilter"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-black"
            @change="fetchUsers"
          >
            <option value="">All Roles</option>
            <option value="Administrator">Administrator</option>
            <option value="Manager">Manager</option>
            <option value="User">User</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white shadow overflow-hidden sm:rounded-lg">
      <div v-if="isLoading" class="p-8 text-center">
        <div class="inline-flex items-center">
          <svg class="animate-spin h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading users...
        </div>
      </div>

      <div v-else-if="users.length === 0" class="p-8 text-center text-gray-500">
        No users found.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Companies
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Login
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in users" :key="user._id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span class="text-sm font-medium text-indigo-600">
                        {{ user.username.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ user.username }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ user.email }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getRoleBadgeClass(user.role)"
                >
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div v-if="user.companies.length > 0" class="flex flex-wrap gap-1">
                  <span
                    v-for="company in user.companies.slice(0, 2)"
                    :key="company"
                    class="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded"
                  >
                    {{ company }}
                  </span>
                  <span
                    v-if="user.companies.length > 2"
                    class="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded"
                  >
                    +{{ user.companies.length - 2 }} more
                  </span>
                </div>
                <span v-else class="text-gray-400">No companies</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                >
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ user.lastLogin ? formatDate(user.lastLogin) : 'Never' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <button
                    @click="editUser(user)"
                    class="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </button>
                  <button
                    @click="resetPassword(user)"
                    class="text-yellow-600 hover:text-yellow-900"
                  >
                    Reset Password
                  </button>
                  <button
                    v-if="user._id !== authStore.user?._id"
                    @click="toggleUserStatus(user)"
                    :class="user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'"
                  >
                    {{ user.isActive ? 'Deactivate' : 'Activate' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.pages > 1" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            @click="changePage(pagination.current - 1)"
            :disabled="pagination.current <= 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            @click="changePage(pagination.current + 1)"
            :disabled="pagination.current >= pagination.pages"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Showing <span class="font-medium">{{ (pagination.current - 1) * 10 + 1 }}</span>
              to <span class="font-medium">{{ Math.min(pagination.current * 10, pagination.total) }}</span>
              of <span class="font-medium">{{ pagination.total }}</span> results
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                @click="changePage(pagination.current - 1)"
                :disabled="pagination.current <= 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="changePage(page)"
                :class="[
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                  page === pagination.current
                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                ]"
              >
                {{ page }}
              </button>
              <button
                @click="changePage(pagination.current + 1)"
                :disabled="pagination.current >= pagination.pages"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit User Modal -->
    <UserModal
      v-if="showCreateModal || showEditModal"
      :is-open="showCreateModal || showEditModal"
      :user="selectedUser"
      @close="closeModal"
      @save="handleUserSave"
    />

    <!-- Reset Password Modal -->
    <ResetPasswordModal
      v-if="showResetPasswordModal"
      :is-open="showResetPasswordModal"
      :user="selectedUser"
      @close="showResetPasswordModal = false"
      @save="handlePasswordReset"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useUserManagementStore } from '../stores/userManagement'
import { useToast } from '../composables/useToast'
import type { User, CreateUserData, UpdateUserData } from '../types/auth'
import UserModal from '../components/ui/UserModal.vue'
import ResetPasswordModal from '../components/ui/ResetPasswordModal.vue'

const authStore = useAuthStore()
const userStore = useUserManagementStore()
const { success, error } = useToast()

// Component state
const searchQuery = ref('')
const roleFilter = ref('')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showResetPasswordModal = ref(false)
const selectedUser = ref<User | null>(null)

// Computed properties
const users = computed(() => userStore.users)
const pagination = computed(() => userStore.pagination)
const isLoading = computed(() => userStore.isLoading)

const visiblePages = computed(() => {
  const current = pagination.value.current
  const total = pagination.value.pages
  const pages = []
  
  for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
    pages.push(i)
  }
  
  return pages
})

// Methods
const fetchUsers = async () => {
  await userStore.fetchUsers({
    page: pagination.value.current,
    search: searchQuery.value,
    role: roleFilter.value
  })
}

const debouncedSearch = (() => {
  let timeout: NodeJS.Timeout
  return () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      fetchUsers()
    }, 300)
  }
})()

const changePage = async (page: number) => {
  if (page >= 1 && page <= pagination.value.pages) {
    await userStore.fetchUsers({
      page,
      search: searchQuery.value,
      role: roleFilter.value
    })
  }
}

const editUser = (user: User) => {
  selectedUser.value = user
  showEditModal.value = true
}

const resetPassword = (user: User) => {
  selectedUser.value = user
  showResetPasswordModal.value = true
}

const toggleUserStatus = async (user: User) => {
  const result = await userStore.updateUser(user._id, {
    isActive: !user.isActive
  })
  
  if (result.success) {
    success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`)
  } else {
    error(result.message || 'Failed to update user status')
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  selectedUser.value = null
}

const handleUserSave = async (userData: CreateUserData | UpdateUserData) => {
  let result
  
  if (showCreateModal.value) {
    result = await userStore.createUser(userData as CreateUserData)
  } else if (selectedUser.value) {
    result = await userStore.updateUser(selectedUser.value._id, userData as UpdateUserData)
  }
  
  if (result?.success) {
    success(showCreateModal.value ? 'User created successfully' : 'User updated successfully')
    closeModal()
    fetchUsers()
  } else {
    error(result?.message || 'Failed to save user')
  }
}

const handlePasswordReset = async (newPassword: string) => {
  if (!selectedUser.value) return
  
  const result = await userStore.resetUserPassword(selectedUser.value._id, newPassword)
  
  if (result.success) {
    success('Password reset successfully')
    showResetPasswordModal.value = false
    selectedUser.value = null
  } else {
    error(result.message || 'Failed to reset password')
  }
}

const getRoleBadgeClass = (role: string) => {
  switch (role) {
    case 'Administrator':
      return 'bg-red-100 text-red-800'
    case 'Manager':
      return 'bg-blue-100 text-blue-800'
    case 'User':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  fetchUsers()
})
</script>
