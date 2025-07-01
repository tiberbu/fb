export interface User {
  _id: string
  username: string
  email: string
  role: 'Administrator' | 'Manager' | 'User'
  companies: string[]
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
}

export interface CreateUserData {
  username: string
  email: string
  password: string
  role: 'Administrator' | 'Manager' | 'User'
  companies?: string[]
}

export interface UpdateUserData {
  username?: string
  email?: string
  role?: 'Administrator' | 'Manager' | 'User'
  companies?: string[]
  isActive?: boolean
}
