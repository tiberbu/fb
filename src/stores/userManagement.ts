import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import type { User, CreateUserData, UpdateUserData } from '../types/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002'

export interface UserPagination {
  current: number
  pages: number
  total: number
}

export interface UsersResponse {
  users: User[]
  pagination: UserPagination
}

export const useUserManagementStore = defineStore('userManagement', () => {
  // State
  const users = ref<User[]>([])
  const pagination = ref<UserPagination>({ current: 1, pages: 1, total: 0 })
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  const fetchUsers = async (params?: {
    page?: number
    limit?: number
    search?: string
    role?: string
  }): Promise<{ success: boolean; message?: string }> => {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated || !authStore.isAdmin) {
      return { success: false, message: 'Not authorized' }
    }

    isLoading.value = true
    error.value = null

    try {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.search) queryParams.append('search', params.search)
      if (params?.role) queryParams.append('role', params.role)

      const response = await fetch(`${API_BASE_URL}/api/users?${queryParams}`, {
        headers: {
          ...authStore.getAuthHeaders(),
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users')
      }

      if (data.success) {
        users.value = data.data.users
        pagination.value = data.data.pagination
        return { success: true }
      } else {
        throw new Error(data.message || 'Failed to fetch users')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred while fetching users'
      error.value = message
      return { success: false, message }
    } finally {
      isLoading.value = false
    }
  }

  const createUser = async (userData: CreateUserData): Promise<{ success: boolean; message?: string; user?: User }> => {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated || !authStore.isAdmin) {
      return { success: false, message: 'Not authorized' }
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authStore.getAuthHeaders(),
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create user')
      }

      if (data.success) {
        // Add the new user to the local state
        users.value.unshift(data.data.user)
        return { success: true, message: data.message, user: data.data.user }
      } else {
        throw new Error(data.message || 'Failed to create user')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred while creating user'
      error.value = message
      return { success: false, message }
    } finally {
      isLoading.value = false
    }
  }

  const updateUser = async (userId: string, userData: UpdateUserData): Promise<{ success: boolean; message?: string; user?: User }> => {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated || !authStore.isAdmin) {
      return { success: false, message: 'Not authorized' }
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authStore.getAuthHeaders(),
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update user')
      }

      if (data.success) {
        // Update the user in the local state
        const index = users.value.findIndex(u => u._id === userId)
        if (index !== -1) {
          users.value[index] = data.data.user
        }
        return { success: true, message: data.message, user: data.data.user }
      } else {
        throw new Error(data.message || 'Failed to update user')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred while updating user'
      error.value = message
      return { success: false, message }
    } finally {
      isLoading.value = false
    }
  }

  const deleteUser = async (userId: string): Promise<{ success: boolean; message?: string }> => {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated || !authStore.isAdmin) {
      return { success: false, message: 'Not authorized' }
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          ...authStore.getAuthHeaders(),
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete user')
      }

      if (data.success) {
        // Remove the user from the local state
        users.value = users.value.filter(u => u._id !== userId)
        return { success: true, message: data.message }
      } else {
        throw new Error(data.message || 'Failed to delete user')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred while deleting user'
      error.value = message
      return { success: false, message }
    } finally {
      isLoading.value = false
    }
  }

  const resetUserPassword = async (userId: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated || !authStore.isAdmin) {
      return { success: false, message: 'Not authorized' }
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/reset-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authStore.getAuthHeaders(),
        },
        body: JSON.stringify({ newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password')
      }

      if (data.success) {
        return { success: true, message: data.message }
      } else {
        throw new Error(data.message || 'Failed to reset password')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred while resetting password'
      error.value = message
      return { success: false, message }
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    users,
    pagination,
    isLoading,
    error,
    // Actions
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    resetUserPassword,
  }
})
