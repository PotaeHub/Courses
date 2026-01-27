<script setup>

import { ref, onMounted, watch } from 'vue'
import api from '@/service/api'
import CourseCards from '../../components/student/CourseCards.vue'
import { useRouter } from 'vue-router'

const categories = ref([])
const courses = ref([])
const loading = ref(false)
const route = useRouter()
const page = ref(1)
const totalPages = ref(1)

const keyword = ref('')
const categoryId = ref('')
const type = ref('')
const minPrice = ref('')
const maxPrice = ref('')
const sortPrice = ref('') // asc | desc | ''

let debounceTimer = null

const fetchCourses = async (targetPage = 1) => {
    if (loading.value) return

    loading.value = true
    page.value = targetPage

    try {
        const res = await api.get('/student/courses', {
            params: {
                page: page.value,
                keyword: keyword.value,
                categoryId: categoryId.value,
                type: type.value,
                minPrice: minPrice.value,
                maxPrice: maxPrice.value,
                sortPrice: sortPrice.value
            }
        })

        courses.value = res.data.courses
        totalPages.value = res.data.totalPages
    } catch (err) {
        console.error(err)
    } finally {
        loading.value = false
    }
}

const fetchCategories = async () => {
    const res = await api.get('/student/categories')
    categories.value = res.data
}

/* 🔁 realtime filter */
watch(
    [keyword, categoryId, type, minPrice, maxPrice, sortPrice],
    () => {
        page.value = 1
        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => fetchCourses(), 0)
    }
)

const toggleSort = (mode) => {
    sortPrice.value = sortPrice.value === mode ? '' : mode
}

onMounted(() => {
    fetchCourses()
    fetchCategories()
})
const goHome = () => route.push('/')
</script>
<template>
    <div class="min-h-screen bg-[#FBFBFC] pb-20 font-sans antialiased">

        <div class="bg-white border-b border-gray-50">
            <div class="max-w-7xl mx-auto px-6 py-10">
                <button @click="goHome"
                    class="group flex items-center text-[13px] font-bold text-gray-400 hover:text-indigo-600 transition-all mb-8 uppercase tracking-wider">
                    <svg xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
                    </svg>
                    กลับไปหน้าโฮม
                </button>

                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 class="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight">
                            สำรวจคอร์สเรียน
                        </h1>
                        <p class="text-gray-400 mt-2 text-base font-medium">
                            ยกระดับทักษะของคุณด้วยคอร์สเรียนที่คัดสรรมาอย่างดีจากผู้เชี่ยวชาญ
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div class="max-w-7xl mx-auto px-6 -mt-8">
            <div class="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 p-6 mb-12">
                <div class="grid grid-cols-1 md:grid-cols-12 gap-5">

                    <div class="md:col-span-4 relative group">
                        <span class="absolute inset-y-0 left-4 flex items-center text-gray-300 group-focus-within:text-indigo-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input v-model="keyword" placeholder="ค้นหาชื่อคอร์ส..."
                            class="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50/50 border border-transparent focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/50 transition-all outline-none text-gray-600 text-sm" />
                    </div>

                    <div class="md:col-span-3">
                        <select v-model="categoryId"
                            class="w-full px-4 py-3.5 rounded-2xl bg-gray-50/50 border border-transparent focus:bg-white focus:border-indigo-100 outline-none text-sm text-gray-600 appearance-none cursor-pointer transition-all">
                            <option value="">ทุกหมวดหมู่</option>
                            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                        </select>
                    </div>

                    <div class="md:col-span-2">
                        <select v-model="type" class="w-full px-4 py-3.5 rounded-2xl bg-gray-50/50 border border-transparent focus:bg-white focus:border-indigo-100 outline-none text-sm text-gray-600 appearance-none cursor-pointer transition-all">
                            <option value="">ทุกประเภท</option>
                            <option value="GENERAL">คอร์สทั่วไป</option>
                            <option value="POPULAR">ยอดนิยม</option>
                            <option value="PACKAGE">แพ็กเกจ</option>
                        </select>
                    </div>

                    <div class="md:col-span-3 flex items-center gap-2">
                        <input v-model="minPrice" type="number" placeholder="ต่ำสุด" 
                            class="w-full px-4 py-3.5 rounded-2xl bg-gray-50/50 border border-transparent focus:bg-white focus:border-indigo-100 outline-none text-sm transition-all" />
                        <span class="text-gray-300">—</span>
                        <input v-model="maxPrice" type="number" placeholder="สูงสุด" 
                            class="w-full px-4 py-3.5 rounded-2xl bg-gray-50/50 border border-transparent focus:bg-white focus:border-indigo-100 outline-none text-sm transition-all" />
                    </div>
                </div>

                <div class="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-gray-50">
                    <span class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Sort by price:</span>
                    <button @click="toggleSort('asc')" 
                        :class="sortPrice === 'asc' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'"
                        class="px-5 py-2 rounded-xl text-xs font-semibold transition-all duration-300">
                        ราคาต่ำไปสูง
                    </button>
                    <button @click="toggleSort('desc')" 
                        :class="sortPrice === 'desc' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'"
                        class="px-5 py-2 rounded-xl text-xs font-semibold transition-all duration-300">
                        ราคาสูงไปต่ำ
                    </button>
                </div>
            </div>

            <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <div v-for="i in 6" :key="i"
                    class="bg-white p-5 rounded-[2.5rem] border border-gray-100 shadow-sm animate-pulse">
                    <div class="h-52 bg-gray-50 rounded-3xl mb-5"></div>
                    <div class="h-6 bg-gray-50 rounded-lg w-3/4 mb-4"></div>
                    <div class="space-y-2">
                        <div class="h-3 bg-gray-50 rounded-lg w-full"></div>
                        <div class="h-3 bg-gray-50 rounded-lg w-5/6"></div>
                    </div>
                </div>
            </div>

            <div v-else-if="courses.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                <CourseCards v-for="course in courses" :key="course.id" :course="course"
                    class="hover:translate-y-[-10px] transition-all duration-500 ease-out" />
            </div>

            <div v-else
                class="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border border-gray-50 shadow-sm">
                <div class="inline-flex items-center justify-center w-24 h-24 bg-gray-50 rounded-full mb-6">
                    <svg class="h-10 w-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <h3 class="text-xl font-semibold text-gray-900">ไม่พบคอร์สที่ค้นหา</h3>
                <p class="text-gray-400 mt-2 font-medium">ลองปรับเปลี่ยนตัวกรอง หรือค้นหาด้วยชื่ออื่นดูนะคะ</p>
                <button @click="keyword = ''; categoryId = ''; type = ''; minPrice = ''; maxPrice = ''; sortPrice = ''"
                    class="mt-8 px-8 py-3 bg-gray-900 text-white rounded-2xl text-sm font-semibold hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-200">
                    รีเซ็ตการค้นหาทั้งหมด
                </button>
            </div>

            <div v-if="totalPages > 1" class="flex justify-center items-center gap-4 mt-20">
                <button @click="fetchCourses(page - 1)" :disabled="page === 1" 
                    class="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-30 transition-all shadow-sm">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <div class="flex items-center px-6 py-2 bg-white rounded-2xl border border-gray-100 shadow-sm font-semibold text-sm">
                    <span class="text-indigo-600 italic">Page {{ page }}</span>
                    <span class="mx-3 text-gray-200">|</span>
                    <span class="text-gray-400">{{ totalPages }}</span>
                </div>

                <button @click="fetchCourses(page + 1)" :disabled="page === totalPages" 
                    class="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-30 transition-all shadow-sm">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
@import "tailwindcss";

.filter-select {
    @apply w-full px-4 py-3.5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none text-gray-600 cursor-pointer transition-all;
}

.price-input {
    @apply w-full px-4 py-3.5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all;
}

.tag {
    @apply px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all;
}

.tag-active {
    @apply px-4 py-2 rounded-full bg-indigo-600 border-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all scale-105;
}

.page-btn {
    @apply w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-gray-200 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-20 transition-all shadow-sm;
}
</style>