<script setup>
import { ref, onMounted } from 'vue'
import { Bell } from 'lucide-vue-next'
import TeacherProfileModal from './TeacherProfileModal.vue'
import api from '../../service/api'

/* ================= STATE ================= */
const user = ref({ name: '', image: null })
const showProfileModal = ref(false)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

/* ================= ACTIONS ================= */
const openProfile = () => (showProfileModal.value = true)
const closeProfile = () => (showProfileModal.value = false)

// ฟังก์ชันดึงข้อมูล (Single Responsibility)
const fetchUser = async () => {
    try {
        const res = await api.get('/teacher/profile')
        // ตรวจสอบโครงสร้าง Response ให้ดี (res.data หรือ res.data.data)
        const teacher = res.data.data || res.data

        user.value.name = teacher.name

        if (teacher.image) {
            // ป้องกันการต่อ URL ซ้ำซ้อน
            user.value.image = teacher.image.startsWith('http')
                ? teacher.image
                : `${BACKEND_URL}${teacher.image}`
        } else {
            user.value.image = null
        }

        // --- ห้ามเรียก refreshProfile() ตรงนี้เด็ดขาด เพื่อตัดวงจร Loop ---
    } catch (err) {
        console.error('Fetch profile error:', err)
    }
}

// ฟังก์ชันที่จะถูกเรียก "เฉพาะ" ตอน Modal อัปเดตเสร็จเท่านั้น
const onProfileUpdated = async () => {
    console.log('Profile updated, fetching new data...')
    await fetchUser()
}

onMounted(fetchUser)
</script>

<template>
    <header
        class="sticky top-0 z-40 h-[72px] bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 flex items-center justify-between">
        <div class="flex flex-col">
            <h1 class="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                {{ user.name || 'Loading...' }}
            </h1>
            <p class="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Teacher Dashboard</p>
        </div>

        <div class="flex items-center gap-5">
            <button class="relative p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors group">
                <Bell class="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span class="absolute top-2 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
            </button>

            <div class="w-[1px] h-8 bg-slate-100"></div>

            <button @click="openProfile"
                class="group flex items-center gap-3 p-1 pr-3 rounded-2xl hover:bg-slate-50 transition-all duration-300">
                <div class="relative">
                    <div
                        class="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-offset-2 ring-slate-100 group-hover:ring-blue-500 transition-all shadow-sm">
                        <img v-if="user.image" :src="user.image" class="w-full h-full object-cover shadow-inner" />
                        <div v-else
                            class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xl">
                            {{ user.name ? user.name.charAt(0).toUpperCase() : '?' }}
                        </div>
                    </div>
                    <span
                        class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                </div>

                <div class="hidden md:flex flex-col text-left">
                    <span
                        class="text-sm font-bold text-slate-700 leading-tight group-hover:text-blue-600 transition-colors">
                        {{ user.name }}
                    </span>
                    <span class="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                        <span class="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
                        Active Now
                    </span>
                </div>
            </button>
        </div>
    </header>

    <TeacherProfileModal v-if="showProfileModal" :show="showProfileModal" @close="closeProfile"
        @updated="onProfileUpdated" />
</template>