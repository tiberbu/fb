import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { User, LoginCredentials, AuthState } from '../types/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'Administrator')
  const isManager = computed(() => user.value?.role === 'Manager' || isAdmin.value)

  // Actions
  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; message?: string }> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      if (data.success) {
        token.value = data.data.token
        user.value = data.data.user
        localStorage.setItem('auth_token', data.data.token)
        return { success: true }
      } else {
        throw new Error(data.message || 'Login failed')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred during login'
      error.value = message
      return { success: false, message }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async (): Promise<void> => {
    isLoading.value = true

    try {
      if (token.value) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token.value}`,
            'Content-Type': 'application/json',
          },
        })
      }
    } catch (err) {
      console.error('Logout request failed:', err)
    } finally {
      // Clear local state regardless of API call success
      user.value = null
      token.value = null
      localStorage.removeItem('auth_token')
      isLoading.value = false
    }
  }

  const fetchProfile = async (): Promise<boolean> => {
    if (!token.value) return false

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token.value}`,
        },
      })

      const data = await response.json()

      if (response.ok && data.success) {
        user.value = data.data.user
        return true
      } else {
        // Token might be invalid
        await logout()
        return false
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err)
      await logout()
      return false
    }
  }

  const updateProfile = async (profileData: Partial<User>): Promise<{ success: boolean; message?: string }> => {
    if (!token.value) return { success: false, message: 'Not authenticated' }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token.value}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Profile update failed')
      }

      if (data.success) {
        user.value = data.data.user
        return { success: true }
      } else {
        throw new Error(data.message || 'Profile update failed')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred during profile update'
      error.value = message
      return { success: false, message }
    } finally {
      isLoading.value = false
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
    if (!token.value) return { success: false, message: 'Not authenticated' }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token.value}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Password change failed')
      }

      if (data.success) {
        return { success: true, message: data.message }
      } else {
        throw new Error(data.message || 'Password change failed')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred during password change'
      error.value = message
      return { success: false, message }
    } finally {
      isLoading.value = false
    }
  }

  const getAuthHeaders = () => {
    return token.value ? { 'Authorization': `Bearer ${token.value}` } : {}
  }

  // Initialize auth state on store creation
  const initializeAuth = async () => {
    if (token.value) {
      await fetchProfile()
    }
  }

  return {
    // State
    user,
    token,
    isLoading,
    error,
    // Getters
    isAuthenticated,
    isAdmin,
    isManager,
    // Actions
    login,
    logout,
    fetchProfile,
    updateProfile,
    changePassword,
    getAuthHeaders,
    initializeAuth,
  }
})
