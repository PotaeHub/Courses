<script setup>
import { useRoute, useRouter } from 'vue-router'
import {
    LayoutDashboard,
    BookOpen,
    Users,
    Wallet,
    User,
    LogOut
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const menus = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/teacher/dashboard' },
    { name: 'My Courses', icon: BookOpen, path: '/teacher/courses' },
    { name: 'Students', icon: Users, path: '/teacher/students' },
    { name: 'Earnings', icon: Wallet, path: '/teacher/earnings' },
    { name: 'Profile', icon: User, path: '/teacher/profile' },
]

const logout = () => {
    localStorage.clear()
    router.push('/login')
}
</script>

<template>
    <aside class="w-72 bg-[#0B1220] text-slate-300 min-h-screen p-6 flex flex-col">

        <!-- Brand -->
        <div class="flex items-center gap-3 mb-10">
            <div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                🎓
            </div>
            <h1 class="text-xl font-black text-white">
                Creator Panel
            </h1>
        </div>

        <!-- Menu -->
        <nav class="flex-1 space-y-1">
            <router-link v-for="m in menus" :key="m.path" :to="m.path"
                class="flex items-center gap-4 px-4 py-3 rounded-xl transition" :class="route.path === m.path
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'hover:bg-white/5'">

                <component :is="m.icon" class="w-5 h-5" />
                <span class="font-semibold text-sm">{{ m.name }}</span>
            </router-link>
        </nav>

        <!-- Logout -->
        <button @click="logout"
            class="flex items-center gap-4 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition">
            <LogOut class="w-5 h-5" />
            Logout
        </button>
    </aside>
</template>
