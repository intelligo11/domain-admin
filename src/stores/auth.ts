import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)
    const isAuthenticated = ref(false)

    async function login(username: string, password: string) {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })

            if (res.ok) {
                const data = await res.json() as any
                user.value = data.user
                isAuthenticated.value = true
                return true
            }
        } catch (e) {
            console.error(e)
        }
        return false
    }

    async function logout() {
        await fetch('/api/auth/logout', { method: 'POST' })
        user.value = null
        isAuthenticated.value = false
    }

    async function checkAuth() {
        try {
            const res = await fetch('/api/auth/me')
            if (res.ok) {
                const data = await res.json() as any
                if (data.authenticated) {
                    user.value = data.user
                    isAuthenticated.value = true
                    return true
                }
            }
        } catch (e) {
            console.error(e)
        }
        isAuthenticated.value = false
        return false
    }

    return { user, isAuthenticated, login, logout, checkAuth }
})
