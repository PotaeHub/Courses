<script setup>
import { RouterLink, useRouter, useRoute } from 'vue-router'
import {
    LayoutDashboard,
    BookOpen,
    Users,
    Layers,
    LogOut,
    ChevronRight
} from 'lucide-vue-next'
import { computed } from 'vue'

const router = useRouter()
const route = useRoute()

/* ================= MENU ================= */
const menuItems = [
    {
        name: 'Dashboard',
        path: '/admin/dashboard',
        icon: LayoutDashboard
    },
    {
        name: 'Courses',
        path: '/admin/courses',
        icon: BookOpen
    },
    {
        name: 'Users',
        path: '/admin/users',
        icon: Users
    },
    {
        name: 'Category',
        path: '/admin/category',
        icon: Layers
    }
]

/* ================= ACTIVE STATE ================= */
const isActive = (path) => {
    return route.path.startsWith(path)
}

/* ================= LOGOUT ================= */
const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    router.push('/login')
}
</script>

<template>
    <aside
        class="w-72 min-h-screen bg-[#0F172A] text-slate-300 p-6 flex flex-col border-r border-slate-800 relative overflow-hidden">
        <!-- Glow -->
        <div
            class="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />

        <!-- Logo -->
        <div class="flex items-center gap-3 mb-12 px-2 relative z-10">
            <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Layers class="text-white w-6 h-6" stroke-width="2.5" />
            </div>
            <h1 class="text-xl font-black text-white tracking-tight uppercase">
                Edu<span class="text-blue-500">Admin</span>
            </h1>
        </div>

        <!-- Menu -->
        <nav class="flex flex-col gap-1.5 flex-1 relative z-10">
            <p class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-2 px-3">
                Main Menu
            </p>

            <RouterLink v-for="item in menuItems" :key="item.path" :to="item.path"
                class="group relative flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300"
                :class="isActive(item.path)
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                        : 'hover:bg-slate-800/60 hover:text-white'
                    ">
                <div class="flex items-center gap-3">
                    <component :is="item.icon" :size="20" :stroke-width="isActive(item.path) ? 2.5 : 2"
                        class="transition-all duration-300 group-hover:scale-110" />
                    <span class="font-bold text-sm tracking-wide">
                        {{ item.name }}
                    </span>
                </div>

                <ChevronRight v-if="isActive(item.path)" :size="16"
                    class="opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />

                <!-- Active Indicator -->
                <span v-if="isActive(item.path)"
                    class="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-white rounded-full shadow-md" />
            </RouterLink>
        </nav>

        <!-- Footer -->
        <div class="pt-6 border-t border-slate-800 relative z-10">
            <div class="flex items-center gap-3 p-3 mb-4 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                <div
                    class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center font-black text-white">
                    AD
                </div>
                <div class="flex-1 overflow-hidden">
                    <p class="text-sm font-black text-white truncate leading-none">
                        Admin User
                    </p>
                    <p class="text-[10px] text-slate-400 truncate">
                        admin@edusys.com
                    </p>
                </div>
            </div>

            <button @click="logout"
                class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 font-bold text-sm hover:bg-rose-500/10 hover:text-rose-500 transition-all duration-300 group">
                <LogOut :size="20" class="transition-transform group-hover:-translate-x-1" />
                Logout
            </button>
        </div>
    </aside>
</template>

<style scoped>
aside {
    animation: slideIn 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateX(-30px);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}
</style>
