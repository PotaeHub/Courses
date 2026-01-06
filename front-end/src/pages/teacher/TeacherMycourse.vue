<script setup>
import { ref, computed } from 'vue'
import { Search, Plus, SlidersHorizontal } from 'lucide-vue-next'
import CourseTableRow from '../../components/Teacher/CourseTableRow.vue'

const searchQuery = ref('')
const activeTab = ref('All')
const tabs = ['All', 'Published', 'Draft', 'Archived']

const courses = ref([
    { id: '1024', name: 'Mastering Vue 3 Composition API', students: 1240, rating: 4.9, status: 'Published', sales: 1599600, image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200' },
    { id: '1025', name: 'UI/UX Design Masterclass 2026', students: 850, rating: 4.8, status: 'Published', sales: 2125000, image: 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?w=200' },
    { id: '1026', name: 'Python for Data Science', students: 0, rating: 0, status: 'Draft', sales: 0, image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=200' },
])

const filteredCourses = computed(() => {
    return courses.value.filter(c => {
        const matchSearch = c.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchTab = activeTab.value === 'All' || c.status === activeTab.value
        return matchSearch && matchTab
    })
})
</script>

<template>
    <div class="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <h1 class="text-3xl font-black text-slate-900 tracking-tighter">My Courses</h1>
                <p class="text-slate-500 font-medium">จัดการเนื้อหาและดูภาพรวมคอร์สเรียนของคุณ</p>
            </div>
            <button
                class="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-[1.5rem] font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-1 transition-all">
                <Plus :size="20" stroke-width="3" />
                New Course
            </button>
        </div>

        <div
            class="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
            <div class="flex items-center gap-1 bg-slate-50 p-1 rounded-2xl overflow-x-auto w-full lg:w-auto">
                <button v-for="tab in tabs" :key="tab" @click="activeTab = tab"
                    class="px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest whitespace-nowrap"
                    :class="activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'">
                    {{ tab }}
                </button>
            </div>

            <div class="relative w-full lg:w-96">
                <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" :size="18" />
                <input v-model="searchQuery" type="text" placeholder="Search your courses..."
                    class="w-full pl-12 pr-6 py-3.5 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 font-bold text-sm transition-all" />
            </div>
        </div>

        <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead class="bg-slate-50/50 border-b border-slate-50">
                        <tr>
                            <th class="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                Course Information</th>
                            <th class="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                Student Stats</th>
                            <th class="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                Earnings</th>
                            <th
                                class="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">
                                Status</th>
                            <th
                                class="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">
                                Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">
                        <CourseTableRow v-for="course in filteredCourses" :key="course.id" :course="course" />
                    </tbody>
                </table>
            </div>

            <div v-if="filteredCourses.length === 0" class="py-24 text-center">
                <div
                    class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-50 text-slate-200 mb-4">
                    <SlidersHorizontal :size="40" />
                </div>
                <h3 class="text-lg font-black text-slate-400 uppercase tracking-widest">No Courses Found</h3>
                <p class="text-slate-400 text-sm font-medium">ลองเปลี่ยนคำค้นหาหรือตัวกรองดูนะครับ</p>
            </div>
        </div>
    </div>
</template>