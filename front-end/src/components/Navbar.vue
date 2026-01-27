<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../Store/auth.js'
import { computed, onMounted } from 'vue'
import api from '../service/api.js'
import Swal from 'sweetalert2' // 1. นำเข้า SweetAlert2

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const BASE_URL = import.meta.env.VITE_BACKEND_URL

const avatar = computed(() => {
    if (!auth.user?.image) return null
    return `${BASE_URL}${auth.user.image}`
})

const fetchUser = async () => {
    try {
        const res = await api.get('/profile/me')
        auth.setUser(res.data.user)
    } catch (error) {
        console.error(error)
    }
}

// 2. ปรับปรุงฟังก์ชัน Logout
const logout = async () => {
    const result = await Swal.fire({
        title: 'ยืนยันการออกจากระบบ?',
        text: "คุณต้องการออกจากระบบการเรียนใช่หรือไม่",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#111827',
        cancelButtonColor: '#ACBAC4',
        confirmButtonText: 'ใช่, ออกจากระบบ',
        cancelButtonText: 'ยกเลิก',
        customClass: {
            popup: 'rounded-[2rem]',
            confirmButton: 'rounded-xl px-6 py-2',
            cancelButton: 'rounded-xl px-6 py-2 text-gray-200'
        }
    })

    if (result.isConfirmed) {
        // แสดงสถานะกำลังโหลด
        Swal.fire({
            title: 'กำลังออกจากระบบ...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading()
            }
        })

        // หน่วงเวลาเล็กน้อยเพื่อให้ดูสมูท (Optional)
        setTimeout(() => {
            auth.logout()
            Swal.close() // ปิด Alert
            router.push('/login')
        }, 800)
    }
}

const isActive = (path) => route.path === path

onMounted(fetchUser)
</script>

<template>
    <nav
        class="bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 h-18 flex items-center justify-between sticky top-0 z-50 transition-all">

        <div class="flex items-center gap-10">
            <router-link to="/" class="flex items-center gap-3 group">
                <div
                    class="w-11 h-11 rounded-xl overflow-hidden shadow-md shadow-blue-100 group-hover:scale-105 transition-transform duration-300 border border-gray-50">
                    <img src="/logo.jpg" alt="EduFlex Logo" class="w-full h-full object-cover" />
                </div>
                <span class="text-xl font-extrabold tracking-tight text-slate-800">
                    Edu<span class="text-blue-600">Flex</span>
                </span>
            </router-link>

            <div class="hidden md:flex items-center gap-2">
                <template v-if="auth.user?.role === 'STUDENT'">
                    <router-link to="/student/courses"
                        :class="[isActive('/student/courses') ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50']"
                        class="px-4 py-2 rounded-xl text-sm font-semibold transition-all">
                        คอร์สทั้งหมด
                    </router-link>

                    <router-link to="/student/mycourses"
                        :class="[isActive('/student/mycourses') ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50']"
                        class="px-4 py-2 rounded-xl text-sm font-semibold transition-all">
                        คอร์สของฉัน
                    </router-link>
                </template>

                <template v-if="auth.user?.role === 'TEACHER'">
                    <router-link to="/teacher/dashboard"
                        :class="[isActive('/teacher/dashboard') ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50']"
                        class="px-4 py-2 rounded-xl text-sm font-semibold transition-all">Dashboard</router-link>
                    <router-link to="/teacher/courses"
                        :class="[isActive('/teacher/courses') ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50']"
                        class="px-4 py-2 rounded-xl text-sm font-semibold transition-all">คอร์สที่สอน</router-link>
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
                    <div class="hidden sm:flex flex-col items-end text-xs text-right leading-tight">
                        <span class="font-bold text-gray-800">
                            {{ auth.user?.email?.split('@')[0] || '' }}
                        </span>
                        <span class="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{{ auth.user.role
                            }}</span>
                    </div>

                    <div
                        class="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center shadow-sm">
                        <img v-if="avatar" :src="avatar" class="w-full h-full object-cover" />
                        <span v-else class="font-bold text-gray-500 text-sm">
                            {{ auth.user?.email?.[0]?.toUpperCase() || '' }}
                        </span>
                    </div>

                    <button @click="logout"
                        class="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors group"
                        title="ออกจากระบบ">
                        <svg xmlns="http://www.w3.org/2000/svg"
                            class="h-5 w-5 group-hover:translate-x-0.5 transition-transform" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
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
.h-18 {
    height: 4.5rem;
}

.avatar-enter-active,
.avatar-leave-active {
    transition: opacity 0.3s ease;
}

.avatar-enter-from,
.avatar-leave-to {
    opacity: 0;
}
</style>