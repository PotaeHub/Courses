<script setup>
import { RouterLink, useRouter, useRoute } from 'vue-router'
import {
    LayoutDashboard,
    BookOpen,
    Users,
    Layers,
    LogOut,
    ChevronRight,
    CreditCard
} from 'lucide-vue-next'
import { computed } from 'vue'
import Swal from 'sweetalert2'

const router = useRouter()
const route = useRoute()

/* ================= MENU CONFIGURATION ================= */
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
    },
    {
        name: 'Payments',
        path: '/admin/payments',
        icon: CreditCard
    }
]

/* ================= HELPER FUNCTIONS ================= */
const isActive = (path) => {
    return route.path.startsWith(path)
}

/* ================= LOGOUT LOGIC WITH SWEETALERT2 ================= */
const logout = async () => {
    const result = await Swal.fire({
        title: 'ยืนยันการออกจากระบบ?',
        text: "เซสชันของคุณจะสิ้นสุดลงและต้องเข้าสู่ระบบใหม่อีกครั้ง",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e11d48', // rose-600
        cancelButtonColor: '#334155',  // slate-700
        confirmButtonText: 'ใช่, ออกจากระบบ',
        cancelButtonText: 'ยกเลิก',
        reverseButtons: true,
        background: '#0F172A',         // Dark theme background
        color: '#f1f5f9',              // Slate-100 text color
        iconColor: '#f43f5e',          // Rose-500 icon color
        customClass: {
            popup: 'rounded-[2rem] border border-slate-800 shadow-2xl px-4 py-6',
            confirmButton: 'rounded-xl px-6 py-2.5 text-sm font-bold ml-2',
            cancelButton: 'rounded-xl px-6 py-2.5 text-sm font-bold',
            title: 'text-2xl font-black pt-2',
            htmlContainer: 'text-slate-400'
        }
    })

    if (result.isConfirmed) {
        // 1. Clear Storage
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')

        // 2. Show Success Notification
        await Swal.fire({
            title: 'ออกจากระบบแล้ว',
            text: 'ระบบกำลังนำคุณกลับไปยังหน้าเข้าสู่ระบบ',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            background: '#0F172A',
            color: '#f1f5f9',
            customClass: {
                popup: 'rounded-[2rem] border border-slate-800'
            }
        })

        // 3. Redirect to Login
        router.push('/login')
    }
}
</script>

<template>
    <aside
        class="w-72 bg-[#0F172A] text-slate-300 p-6 flex flex-col border-r border-slate-800 relative overflow-y-auto max-h-screen scrollbar-hide shrink-0">

        <div
            class="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />

        <div class="flex items-center gap-3 mb-10 px-2 relative z-10">
            <div
                class="w-11 h-11 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 ring-4 ring-blue-600/10">
                <Layers class="text-white w-6 h-6" stroke-width="2.5" />
            </div>
            <div>
                <h1 class="text-xl font-black text-white tracking-tight leading-none uppercase">
                    Edu<span class="text-blue-500">Admin</span>
                </h1>
                <p class="text-[10px] text-slate-500 font-bold mt-1 tracking-widest uppercase">Management v2.0</p>
            </div>
        </div>

        <nav class="flex flex-col gap-2 flex-1 relative z-10">
            <p class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-2 px-4">
                Main Menu
            </p>

            <RouterLink v-for="item in menuItems" :key="item.path" :to="item.path"
                class="group relative flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 overflow-hidden"
                :class="isActive(item.path)
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30'
                    : 'hover:bg-slate-800/60 hover:text-white'
                    ">
                <div class="flex items-center gap-3 relative z-10">
                    <component :is="item.icon" :size="20" :stroke-width="isActive(item.path) ? 2.5 : 2"
                        class="transition-all duration-500 group-hover:rotate-[10deg] group-hover:scale-110" />
                    <span class="font-bold text-sm tracking-wide">
                        {{ item.name }}
                    </span>
                </div>

                <ChevronRight v-if="isActive(item.path)" :size="16"
                    class="relative z-10 transition-all duration-300 translate-x-0" />

                <div v-if="isActive(item.path)"
                    class="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none"></div>

                <span v-if="isActive(item.path)"
                    class="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1.5 bg-white rounded-r-full shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
            </RouterLink>
        </nav>

        <div class="mt-auto pt-6 border-t border-slate-800/60 relative z-10">
            <div
                class="flex items-center gap-3 p-3.5 mb-5 bg-slate-800/30 rounded-2xl border border-slate-700/30 hover:bg-slate-800/50 transition-colors">
                <div
                    class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center font-black text-white text-sm shadow-md ring-2 ring-slate-800">
                    AD
                </div>
                <div class="flex-1 overflow-hidden">
                    <p class="text-sm font-black text-white truncate leading-none">
                        Admin User
                    </p>
                    <p class="text-[10px] text-slate-500 truncate mt-1.5 font-medium">
                        admin@edusys.com
                    </p>
                </div>
            </div>

            <button @click="logout"
                class="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-slate-400 font-bold text-sm hover:bg-rose-500 hover:text-white transition-all duration-300 group shadow-lg shadow-transparent hover:shadow-rose-500/20 active:scale-95">
                <LogOut :size="20" class="transition-transform group-hover:-translate-x-1" />
                <span class="tracking-wide">Logout System</span>
            </button>
        </div>
    </aside>
</template>

<style scoped>
/* Hide Scrollbar */
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}

.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

/* Animations */
aside {
    animation: sidebarIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes sidebarIn {
    from {
        opacity: 0;
        transform: translateX(-40px);
        filter: blur(4px);
    }

    to {
        opacity: 1;
        transform: translateX(0);
        filter: blur(0);
    }
}

/* Nav Item Transition Enhancement */
.router-link-active {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>