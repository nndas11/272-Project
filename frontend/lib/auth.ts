import { apiGet, apiPost } from "./api"

export interface User {
  id: number
  email: string
  created_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  email: string
  password: string
}

export async function login(data: LoginRequest): Promise<User> {
  return apiPost<User>("/api/auth/login", data)
}

export async function signup(data: SignupRequest): Promise<User> {
  return apiPost<User>("/api/auth/signup", data)
}

export async function logout(): Promise<void> {
  await apiPost("/api/auth/logout")
}

export async function getCurrentUser(): Promise<User> {
  return apiGet<User>("/api/auth/me")
}


