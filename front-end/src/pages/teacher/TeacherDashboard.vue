<script setup>
import { ref } from 'vue'
import { Plus, Users, BookOpen, Star, GraduationCap } from 'lucide-vue-next'
import TeacherCourseCard from '../../components/Teacher/TeacherCourseCard.vue'
import TeacherStudentActivity from '../../components/Teacher/TeacherStudentActivity.vue'

const courses = ref([
    { id: 1, name: 'Advanced Vue.js Design Patterns', students: '1.2k', rating: 4.9, status: 'Published', lastUpdated: '2 days ago', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600' },
    { id: 2, name: 'Fullstack Laravel & Nuxt 3', students: '840', rating: 4.8, status: 'Published', lastUpdated: '5 days ago', image: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=600' },
])

const recentStudents = ref([
    { name: 'Alex Johnson', course: 'Vue.js Patterns', time: '2m ago', online: true },
    { name: 'Sarah Connor', course: 'Fullstack Laravel', time: '15m ago', online: false },
    { name: 'Mike Ross', course: 'Vue.js Patterns', time: '1h ago', online: true },
])
</script>

<template>
    <div class="p-10 space-y-10">
        <header class="flex justify-between items-end">
            <div>
                <h1 class="text-4xl font-black text-slate-900 tracking-tighter">Teacher Dashboard</h1>
                <p class="text-slate-500 font-medium mt-1">ยินดีต้อนรับกลับมาครับอาจารย์
                    พร้อมจัดการคอร์สเรียนวันนี้หรือยัง?</p>
            </div>
            <button
                class="bg-blue-600 text-white px-8 py-4 rounded-[1.5rem] font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center gap-2">
                <Plus :size="20" stroke-width="3" />
                New Course
            </button>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard title="Total Students" :value="2405" :icon="Users" color="blue" />
            <StatCard title="Total Courses" :value="12" :icon="BookOpen" color="purple" />
            <StatCard title="Average Rating" :value="4.9" :icon="Star" color="orange" />
            <StatCard title="Completion Rate" :value="88" suffix="%" :icon="GraduationCap" color="emerald" />
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 space-y-6">
                <h2 class="text-xl font-black text-slate-800 tracking-tight px-2">Your Courses</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TeacherCourseCard v-for="c in courses" :key="c.id" v-bind="c" />
                </div>
            </div>

            <div class="space-y-8">
                <RevenueChart />
                <TeacherStudentActivity :activities="recentStudents" />
            </div>
        </div>
    </div>
</template>