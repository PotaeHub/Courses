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
    <aside
        class="w-64 h-screen sticky top-0 bg-[#0B1220] text-slate-300 p-5 flex flex-col border border-slate-800 rounded-[28px] shadow-2xl overflow-hidden relative">

        <!-- Glow -->
        <div class="absolute -top-10 -left-10 w-32 h-32 bg-indigo-600/10 blur-[50px] pointer-events-none" />

        <!-- Header -->
        <div class="flex items-center gap-3 mb-6 px-2 relative z-10">
            <div
                class="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 text-xl">
                🎓
            </div>
            <div class="flex flex-col">
                <h1 class="text-sm font-black text-white leading-none tracking-tight uppercase">
                    Creator
                </h1>
                <span class="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase">Panel v.2</span>
            </div>
        </div>

        <!-- Menu -->
        <nav class="flex-1 overflow-y-auto no-scrollbar space-y-1 relative z-10">
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-4 mb-4">
                Overview
            </p>

            <router-link v-for="m in menus" :key="m.path" :to="m.path"
                class="group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 overflow-hidden"
                :class="route.path === m.path
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20'
                    : 'hover:bg-white/5 text-slate-400 hover:text-white'">

                <div v-if="route.path === m.path" class="absolute left-0 w-1 h-6 bg-white rounded-full transition-all">
                </div>

                <component :is="m.icon" class="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
                    :stroke-width="route.path === m.path ? 2.5 : 2" />

                <span class="font-bold text-sm tracking-wide">{{ m.name }}</span>
            </router-link>
        </nav>

        <!-- Help -->
        <div class="mt-4 p-4 bg-white/5 rounded-2xl border border-white/5 mb-6">
            <p class="text-[10px] font-bold text-indigo-400 uppercase">Need Help?</p>
            <p class="text-[11px] text-slate-500 mt-1">Check our teacher guide for more tips.</p>
        </div>

        <!-- Logout -->
        <div class="pt-4 border-t border-slate-800">
            <button @click="logout"
                class="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-rose-400 font-bold text-sm hover:bg-rose-500/10 transition-all group">
                <LogOut class="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                Logout
            </button>
        </div>
    </aside>
</template>

<style scoped>
@import "tailwindcss";

/* ซ่อน Scrollbar */
.no-scrollbar::-webkit-scrollbar {
    display: none;
}

.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

/* Animation ขาเข้า */
aside {
    animation: sidebar-in 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes sidebar-in {
    from {
        opacity: 0;
        transform: translateX(-20px) scale(0.98);
    }

    to {
        opacity: 1;
        transform: translateX(0) scale(1);
    }
}

/* ฟอนต์นุ่มนวล */
* {
    -webkit-font-smoothing: antialiased;
}
</style>
