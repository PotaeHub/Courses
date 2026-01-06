import { defineStore } from "pinia"

export const useAuthStore = defineStore("auth", {
    state: () => ({
        token: localStorage.getItem("accessToken"),
        user: JSON.parse(localStorage.getItem("user")),
    }),

    actions: {
        login(token, user) {
            this.token = token
            this.user = user
            localStorage.setItem("accessToken", token)
            localStorage.setItem("user", JSON.stringify(user))
        },

        logout() {
            this.token = null
            this.user = null
            localStorage.removeItem("accessToken")
            localStorage.removeItem("user")
        }
    }
})
