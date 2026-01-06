<script setup>
import { useRoute } from 'vue-router'
import {
    Bell,
    Search,
    LogOut,
    User,
    Settings,
    ChevronRight
} from 'lucide-vue-next'
import { computed } from 'vue'

const route = useRoute()

const pageTitle = computed(() => {
    const path = route.path.split('/').pop()
    return path ? path.charAt(0).toUpperCase() + path.slice(1) : 'Dashboard'
})

</script>

<template>
    <nav
        class="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-4 flex justify-between items-center transition-all duration-300">

        <div class="flex items-center gap-3">
            <div class="hidden md:flex items-center gap-2 text-sm font-medium text-slate-400">
                <span>Admin</span>
                <ChevronRight :size="14" />
                <span class="text-slate-900 font-black tracking-tight">{{ pageTitle }}</span>
            </div>
            <h2 class="md:hidden font-black text-slate-800 tracking-tight">{{ pageTitle }}</h2>
        </div>

        <div class="flex items-center gap-6">

            <div class="hidden lg:flex items-center relative group">
                <Search
                    class="absolute left-3 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input type="text" placeholder="Search anything..."
                    class="bg-slate-50 border-none rounded-xl pl-10 pr-4 py-2 text-xs w-64 focus:ring-2 focus:ring-blue-100 transition-all outline-none font-medium" />
            </div>

            <div class="flex items-center gap-3 border-l border-slate-100 pl-6">
                <button
                    class="relative p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all group">
                    <Bell :size="20" />
                    <span
                        class="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
                </button>

                <div class="flex items-center gap-3 ml-2 group cursor-pointer">
                    <div class="flex flex-col items-end hidden sm:flex">
                        <span class="text-xs font-black text-slate-800 leading-none mb-1">Admin Account</span>
                        <span class="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Online</span>
                    </div>
                    <div
                        class="w-10 h-10 rounded-2xl bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden group-hover:border-blue-100 transition-all">
                        <User class="text-slate-400 w-6 h-6" />
                    </div>
                </div>
                
            </div>
        </div>
    </nav>
</template>

<style scoped>
/* ค่อยๆ แสดงผลเมื่อเข้ามา */
nav {
    animation: fadeInDown 0.5s ease-out;
}

@keyframes fadeInDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>