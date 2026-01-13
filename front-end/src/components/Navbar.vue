<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../Store/auth.js'
import { computed, onMounted } from 'vue'
import api from '../service/api.js'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const BASE_URL = import.meta.env.VITE_BACKEND_URL

const avatar = computed(() => {
    if (!auth.user?.image) return null
    return `${BASE_URL}${auth.user.image}`
})
console.log(avatar)
const fetchUser = async () => {
    try {
        const res = await api.get('/profile/me')
        auth.setUser(res.data.user)
    } catch (error) {
        console.error(error)
    }
}

const logout = () => {
    auth.logout()
    router.push('/login')
}

const isActive = (path) => route.path === path

onMounted(fetchUser)
</script>


<template>
    <nav
        class="bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 h-18 flex items-center justify-between sticky top-0 z-50 transition-all">

        <div class="flex items-center gap-10">
            <router-link to="/" class="flex items-center gap-2 group">
                <div
                    class="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
                    <span class="text-white font-black text-xl">C</span>
                </div>
                <span class="text-xl font-extrabold tracking-tight text-slate-800">COURSE<span
                        class="text-blue-600">HUB</span></span>
            </router-link>

            <div class="hidden lg:flex items-center gap-1">
                <router-link to="/courses"
                    :class="[isActive('/courses') ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50']"
                    class="px-4 py-2 rounded-xl text-sm font-semibold transition-all">
                    คอร์สทั้งหมด
                </router-link>

                <template v-if="auth.user?.role === 'STUDENT'">
                    <router-link to="/student/dashboard"
                        :class="[isActive('/student/dashboard') ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50']"
                        class="px-4 py-2 rounded-xl text-sm font-semibold transition-all">
                        Dashboard
                    </router-link>
                    <router-link to="/student/courses"
                        :class="[isActive('/student/courses') ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50']"
                        class="px-4 py-2 rounded-xl text-sm font-semibold transition-all">
                        คอร์สของฉัน
                    </router-link>
                </template>

                <template v-if="auth.user?.role === 'TEACHER'">
                    <router-link to="/teacher/dashboard"
                        class="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:text-blue-600 transition-all">Dashboard</router-link>
                    <router-link to="/teacher/courses"
                        class="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:text-blue-600 transition-all">คอร์สที่สอน</router-link>
                </template>

                <router-link v-if="auth.user?.role === 'ADMIN'" to="/admin/dashboard"
                    class="px-4 py-2 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all">
                    ระบบหลังบ้าน
                </router-link>
            </div>
        </div>

        <div class="flex items-center gap-4">
            <template v-if="!auth.user">
                <router-link to="/login"
                    class="text-sm font-bold text-gray-600 hover:text-blue-600 px-4 transition-colors">
                    เข้าสู่ระบบ
                </router-link>
                <router-link to="/register"
                    class="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95">
                    สมัครเรียนฟรี
                </router-link>
            </template>

            <template v-else>
                <div class="flex items-center gap-4 pl-4 border-l border-gray-100">
                    <div class="hidden sm:flex flex-col items-end text-xs text-right">
                        <span class="font-bold text-gray-800">{{ auth.user.email.split('@')[0] }}</span>
                        <span class="text-gray-400 uppercase tracking-tighter font-medium">{{ auth.user.role }}</span>
                    </div>

                    <div
                        class="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">

                        <img v-if="avatar" :src="avatar" class="w-full h-full object-cover" />

                        <span v-else class="font-bold text-gray-500">
                            {{ auth.user.email[0].toUpperCase() }}
                        </span>
                    </div>

                    <button @click="logout"
                        class="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                        title="ออกจากระบบ">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </template>
        </div>

    </nav>
</template>

<style scoped>
@import "tailwindcss";

/* ความสูงของ Navbar */
.h-18 {
    height: 4.5rem;
}

/* เอฟเฟกต์ Fade เวลารูปโปรไฟล์มา */
.avatar-enter-active,
.avatar-leave-active {
    transition: opacity 0.3s ease;
}

.avatar-enter-from,
.avatar-leave-to {
    opacity: 0;
}
</style>