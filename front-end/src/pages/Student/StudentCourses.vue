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
    <div class="min-h-screen bg-[#F9FBFC] pb-20 font-sans">

        <div class="bg-white border-b border-gray-100 shadow-sm">
            <div class="max-w-7xl mx-auto px-6 py-8">
                <button @click="goHome"
                    class="group flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    กลับสู่หน้าหลัก
                </button>

                <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 class="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                            สำรวจคอร์สเรียน
                        </h1>
                        <p class="text-gray-500 mt-2 text-lg">
                            ยกระดับทักษะของคุณด้วยคอร์สเรียนที่คัดสรรมาอย่างดี
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div class="max-w-7xl mx-auto px-6 -mt-10">
            <div
                class="bg-white rounded-3xl shadow-xl shadow-indigo-900/5 border border-gray-100 p-5 md:p-6 mb-10 transition-all">
                <div class="grid grid-cols-1 md:grid-cols-12 gap-4">

                    <div class="md:col-span-4 relative">
                        <span class="absolute inset-y-0 left-4 flex items-center text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input v-model="keyword" placeholder="ค้นหาชื่อคอร์ส..."
                            class="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-gray-700" />
                    </div>

                    <div class="md:col-span-3">
                        <select v-model="categoryId"
                            class="filter-select appearance-none bg-no-repeat bg-[right_1rem_center]"
                            style="background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E'); background-size: .65em auto;">
                            <option value="">ทุกหมวดหมู่</option>
                            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                        </select>
                    </div>

                    <div class="md:col-span-2">
                        <select v-model="type" class="filter-select">
                            <option value="">ทุกประเภท</option>
                            <option value="GENERAL">คอร์สทั่วไป</option>
                            <option value="POPULAR">ยอดนิยม</option>
                            <option value="PACKAGE">แพ็กเกจ</option>
                        </select>
                    </div>

                    <div class="md:col-span-3 flex items-center gap-2">
                        <input v-model="minPrice" type="number" placeholder="ต่ำสุด" class="price-input" />
                        <div class="h-[2px] w-4 bg-gray-200"></div>
                        <input v-model="maxPrice" type="number" placeholder="สูงสุด" class="price-input" />
                    </div>
                </div>

                <div class="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-gray-50">
                    <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">เรียงตามราคา:</span>
                    <button @click="toggleSort('asc')" :class="sortPrice === 'asc' ? 'tag-active' : 'tag'">
                        <span v-if="sortPrice === 'asc'" class="mr-1">✓</span> ราคาต่ำไปสูง
                    </button>
                    <button @click="toggleSort('desc')" :class="sortPrice === 'desc' ? 'tag-active' : 'tag'">
                        <span v-if="sortPrice === 'desc'" class="mr-1">✓</span> ราคาสูงไปต่ำ
                    </button>
                </div>
            </div>

            <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <div v-for="i in 6" :key="i"
                    class="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm animate-pulse">
                    <div class="h-48 bg-gray-100 rounded-2xl mb-4"></div>
                    <div class="h-6 bg-gray-100 rounded-lg w-3/4 mb-3"></div>
                    <div class="h-4 bg-gray-100 rounded-lg w-full mb-2"></div>
                    <div class="h-4 bg-gray-100 rounded-lg w-1/2"></div>
                </div>
            </div>

            <div v-else-if="courses.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <CourseCards v-for="course in courses" :key="course.id" :course="course"
                    class="hover:translate-y-[-8px] transition-all duration-300" />
            </div>

            <div v-else
                class="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-gray-200 shadow-inner">
                <div class="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-300" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </div>
                <h3 class="text-xl font-bold text-gray-900">ไม่พบคอร์สที่ค้นหา</h3>
                <p class="text-gray-500 mt-2">ลองล้างการค้นหา หรือเปลี่ยนคีย์เวิร์ดใหม่ดูนะคะ</p>
                <button @click="keyword = ''; categoryId = ''; type = ''; minPrice = ''; maxPrice = ''; sortPrice = ''"
                    class="mt-6 text-indigo-600 font-bold hover:text-indigo-700 underline underline-offset-4">
                    แสดงคอร์สทั้งหมด
                </button>
            </div>

            <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-16">
                <button @click="fetchCourses(page - 1)" :disabled="page === 1" class="page-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <div class="flex items-center gap-1 bg-white border border-gray-200 px-2 py-1.5 rounded-2xl shadow-sm">
                    <span
                        class="w-10 h-10 flex items-center justify-center bg-indigo-50 text-indigo-700 font-bold rounded-xl text-sm italic">
                        {{ page }}
                    </span>
                    <span class="px-2 text-gray-400 font-medium">/</span>
                    <span class="w-10 h-10 flex items-center justify-center text-gray-500 font-bold text-sm">
                        {{ totalPages }}
                    </span>
                </div>

                <button @click="fetchCourses(page + 1)" :disabled="page === totalPages" class="page-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
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