<script setup>
import { ref, onMounted, reactive } from 'vue'
import api from '../../service/api.js'
import { BookOpen, Users, Wallet, ArrowUpRight } from 'lucide-vue-next'

const loading = ref(false)
const courses = ref([])

// ใช้ reactive สำหรับตัวเลขที่จะให้วิ่ง
const displayStats = reactive({
    totalCourses: 0,
    totalStudents: 0,
    totalEarnings: 0
})

// ฟังก์ชันสำหรับทำให้ตัวเลขวิ่ง
const animateNumber = (key, target) => {
    let start = 0
    const duration = 1000; // วิ่งใน 1 วินาที
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = target / steps;

    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            displayStats[key] = target;
            clearInterval(timer);
        } else {
            displayStats[key] = Math.floor(start);
        }
    }, stepTime);
}

const fetchDashboard = async () => {
    try {
        loading.value = true
        const res = await api.get('/teacher/dashboard')
        const data = res.data

        // สั่งให้ตัวเลขเริ่มวิ่ง
        animateNumber('totalCourses', data.totalCourses || 0)
        animateNumber('totalStudents', data.totalStudents || 0)
        animateNumber('totalEarnings', data.totalEarnings || 0)

        courses.value = data.courses || []
    } catch (err) {
        console.error(err)
    } finally {
        loading.value = false
    }
}

onMounted(fetchDashboard)
</script>

<template>
    <div class="min-h-screen bg-[#F9FBFF] p-6 md:p-12 space-y-10">

        <div class="flex items-end justify-between">
            <div>
                <p class="text-blue-600 font-bold text-sm uppercase tracking-[0.2em] mb-1">ภาพรวม</p>
                <h1 class="text-4xl font-black text-slate-900 tracking-tight">Dashboard</h1>
            </div>
            <div class="hidden md:block text-right">
                <p class="text-sm font-medium text-slate-400 font-mono italic">อัปเดต: เมื่อสักครู่นี้</p>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">

            <div
                class="bg-white rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white relative overflow-hidden group">
                <div class="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                    <BookOpen class="w-20 h-20 text-blue-600" />
                </div>
                <div class="relative z-10">
                    <div class="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
                        <BookOpen class="w-6 h-6" />
                    </div>
                    <p class="text-sm font-bold text-slate-400 uppercase tracking-wider">จำนวน หลักสูตร</p>
                    <div class="flex items-baseline gap-2">
                        <span class="text-4xl font-black text-slate-800 tracking-tighter">
                            {{ displayStats.totalCourses.toLocaleString() }}
                        </span>
                        <span class="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md">Online</span>
                    </div>
                </div>
            </div>

            <div
                class="bg-white rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white relative overflow-hidden group">
                <div class="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                    <Users class="w-20 h-20 text-emerald-600" />
                </div>
                <div class="relative z-10">
                    <div
                        class="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4">
                        <Users class="w-6 h-6" />
                    </div>
                    <p class="text-sm font-bold text-slate-400 uppercase tracking-wider">นักเรียนทั้งหมด</p>
                    <div class="flex items-baseline gap-2">
                        <span class="text-4xl font-black text-slate-800 tracking-tighter">
                            {{ displayStats.totalStudents.toLocaleString() }}
                        </span>
                        <span class="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md">+{{
                            Math.floor(displayStats.totalStudents * 0.1) }} new</span>
                    </div>
                </div>
            </div>

            <div
                class="bg-white rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white relative overflow-hidden group">
                <div class="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                    <Wallet class="w-20 h-20 text-orange-600" />
                </div>
                <div class="relative z-10">
                    <div
                        class="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-4">
                        <Wallet class="w-6 h-6" />
                    </div>
                    <p class="text-sm font-bold text-slate-400 uppercase tracking-wider">รายได้ทั้งหมด</p>
                    <div class="flex items-baseline gap-2">
                        <span class="text-4xl font-black text-slate-800 tracking-tighter">
                            ฿{{ displayStats.totalEarnings.toLocaleString() }}
                        </span>
                        <ArrowUpRight class="w-5 h-5 text-orange-500" />
                    </div>
                </div>
            </div>
        </div>

        <div
            class="bg-white rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-slate-50 overflow-hidden">
            <div class="p-10 border-b border-slate-50 flex justify-between items-center">
                <h3 class="text-2xl font-black text-slate-800 tracking-tight">ประสิทธิภาพของหลักสูตร</h3>
                <div class="flex gap-2">
                    <div class="w-3 h-3 rounded-full bg-slate-100"></div>
                    <div class="w-3 h-3 rounded-full bg-slate-100"></div>
                </div>
            </div>

            <div class="overflow-x-auto px-6 pb-6">
                <table class="w-full">
                    <thead>
                        <tr class="text-left">
                            <th class="p-6 text-[20px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                รายละเอียดคอร์ส</th>
                            <th
                                class="p-6 text-[20px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">
                                การลงทะเบียน</th>
                            <th class="p-6 text-[20px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">
                                รายได้รวม</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">
                        <tr v-for="course in courses" :key="course.id" class="group transition-all">
                            <td class="p-6">
                                <div class="flex items-center gap-4">
                                    <div
                                        class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        {{ course.title.charAt(0) }}
                                    </div>
                                    <span
                                        class="font-bold text-slate-700 group-hover:translate-x-1 transition-transform inline-block">{{
                                            course.title }}</span>
                                </div>
                            </td>
                            <td class="p-6 text-center">
                                <span
                                    class="bg-slate-50 px-4 py-2 rounded-xl text-sm font-black text-slate-600 group-hover:bg-blue-50 transition-colors">
                                    {{ course.students.toLocaleString() }}
                                </span>
                            </td>
                            <td class="p-6 text-right">
                                <span class="text-lg font-black text-slate-800">฿{{ course.earnings.toLocaleString()
                                    }}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<style scoped>
@import "tailwindcss";

* {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

/* ลบ Scrollbar ของตารางสำหรับความสวยงาม */
.overflow-x-auto::-webkit-scrollbar {
    height: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
}
</style>