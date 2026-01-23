<script setup>
import { onMounted, ref, computed } from 'vue'
import api from '../service/api'

import PopularCourses from '@/components/course/PopularCourses.vue'
import LatestCourses from '@/components/course/LatestCourses.vue'
import Footer from '../components/course/Footer.vue'
import { useAuthStore } from '../../Store/auth'

const popularCourses = ref([])
const latestCourses = ref([])
const categories = ref([])
const loading = ref(true)
const selectedCategory = ref(null)
const auth = useAuthStore()
onMounted(async () => {
    try {
        const [popular, latest, category] = await Promise.all([
            api.get('/public/courses/popular'),
            api.get('/public/courses/latest'),
            api.get('/public/categories'),
        ])

        popularCourses.value = popular.data
        latestCourses.value = latest.data
        categories.value = category.data
    } catch (err) {
        console.error('Load home failed', err)
    } finally {
        loading.value = false
    }
})
const filteredPopularCourses = computed(() => {
    if (!selectedCategory.value) return popularCourses.value
    return popularCourses.value.filter(c => c.categoryId === selectedCategory.value)
})

const filteredLatestCourses = computed(() => {
    if (!selectedCategory.value) return latestCourses.value
    return latestCourses.value.filter(c => c.categoryId === selectedCategory.value)
})
console.log(filteredLatestCourses)
console.log(filteredPopularCourses)
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <section v-if="!auth.user"
            class="relative overflow-hidden bg-slate-900 py-24 sm:py-32 py-20 text-center text-white ">

            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-blue-600/10 blur-3xl rounded-full">
            </div>
            <div class="relative z-10">
                <h2 class="text-4xl font-black mb-4">พร้อมที่จะก้าวต่อไปหรือยัง?</h2>
                <p class="mb-10 text-gray-400 max-w-xl mx-auto">
                    สมัครสมาชิกวันนี้เพื่อรับสิทธิพิเศษและเริ่มสร้างทักษะใหม่ที่ตลาดต้องการ</p>
                <button
                    class="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl shadow-blue-500/20 hover:scale-105 transition-all">
                    เริ่มต้นเรียนฟรีวันนี้
                </button>
            </div>
        </section>
        <section v-else class="relative overflow-hidden bg-white pt-20 pb-28 border-b border-gray-100">
            <div class="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50">
            </div>

            <div class="max-w-7xl mx-auto px-6 relative z-10">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <div
                            class="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
                            <span class="relative flex h-2 w-2">
                                <span
                                    class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                            </span>
                            ยินดีต้อนรับกลับมา
                        </div>
                        <h2 class="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                            สวัสดี, {{ auth.user.name }} 👋<br />
                            <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
                                วันนี้อยากเรียนรู้อะไรเพิ่มดี?
                            </span>
                        </h2>
                    </div>

                    <div class="flex flex-wrap gap-4">
                        <button @click="$router.push('/student/mycourses')"
                            class="bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-gray-800 transition-all flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            คอร์สของฉัน
                        </button>
                    </div>
                </div>

                <div class="mt-12 max-w-3xl">
                    <div class="ai-border">
                        <div class="ai-input flex items-center px-6 py-4 bg-white">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400 mr-4" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input type="text" placeholder="ค้นหาบทเรียน หรือทักษะที่ต้องการพัฒนา..."
                                class="w-full bg-transparent outline-none text-lg text-gray-700 placeholder-gray-400" />
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <div class="max-w-7xl mx-auto px-6 -mt-12 relative z-20">
            <div
                class="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                <div class="text-center border-r border-gray-100 last:border-0">
                    <div class="text-3xl font-bold text-gray-900">10,000+</div>
                    <div class="text-sm text-gray-500 uppercase font-semibold tracking-wider">นักเรียนทั้งหมด</div>
                </div>
                <div class="text-center border-r border-gray-100 last:border-0">
                    <div class="text-3xl font-bold text-gray-900">500+</div>
                    <div class="text-sm text-gray-500 uppercase font-semibold tracking-wider">คอร์สคุณภาพ</div>
                </div>
                <div class="text-center border-r border-gray-100 last:border-0">
                    <div class="text-3xl font-bold text-gray-900">150+</div>
                    <div class="text-sm text-gray-500 uppercase font-semibold tracking-wider">ผู้สอนมืออาชีพ</div>
                </div>
                <div class="text-center">
                    <div class="text-3xl font-bold text-gray-900">4.9/5</div>
                    <div class="text-sm text-gray-500 uppercase font-semibold tracking-wider">ความพึงพอใจ</div>
                </div>
            </div>
        </div>

        <div class="sticky top-0 z-30 bg-gray-50/80 backdrop-blur-md border-b border-gray-200 mt-8">
            <div class="max-w-7xl mx-auto px-6 py-4">
                <div class="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
                    <button @click="selectedCategory = null"
                        :class="!selectedCategory ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'"
                        class="px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap">
                        ทั้งหมด
                    </button>

                    <button v-for="cat in categories" :key="cat.id" @click="selectedCategory = cat.id"
                        :class="selectedCategory === cat.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'"
                        class="px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap">
                        {{ cat.name }}
                    </button>
                </div>
            </div>
        </div>

        <div class="max-w-7xl mx-auto px-6 py-12 space-y-24">

            <div v-if="loading" class="flex flex-col items-center py-20">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p class="mt-4 text-gray-500">กำลังเตรียมเนื้อหาที่น่าสนใจให้คุณ...</p>
            </div>

            <template v-else>
                <section class="fade-in">
                    <div class="flex items-end justify-between mb-8">
                        <div>
                            <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">คอร์สยอดนิยม</h2>
                            <p class="text-gray-500 mt-1">คอร์สที่ได้รับความนิยมสูงสุดในขณะนี้</p>
                        </div>
                        <button class="text-blue-600 font-bold hover:gap-2 flex items-center transition-all">
                            ดูทั้งหมด <span class="ml-1">→</span>
                        </button>
                    </div>
                    <PopularCourses :courses="filteredPopularCourses" />

                    <div v-if="filteredPopularCourses.length === 0" class="text-center py-20 bg-gray-100 rounded-3xl">
                        <p class="text-gray-400 font-medium">ไม่พบคอร์สยอดนิยมในหมวดหมู่นี้</p>
                    </div>
                </section>

                <section class="fade-in pb-20">
                    <div class="flex items-end justify-between mb-8">
                        <div>
                            <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">คอร์สมาใหม่</h2>
                            <p class="text-gray-500 mt-1">อัปเดตความรู้ใหม่ล่าสุดก่อนใคร</p>
                        </div>
                        <button @click="$router.push('/student/mycourses')"
                            class="text-blue-600 font-bold hover:gap-2 flex items-center transition-all">
                            ดูทั้งหมด <span class="ml-1">→</span>
                        </button>
                    </div>
                    <LatestCourses :courses="filteredLatestCourses" />

                    <div v-if="filteredLatestCourses.length === 0" class="text-center py-20 bg-gray-100 rounded-3xl">
                        <p class="text-gray-400 font-medium">ไม่พบคอร์สมาใหม่ในหมวดหมู่นี้</p>
                    </div>
                </section>
            </template>
        </div>


    </div>
    <Footer />
</template>

<style scoped>
/* ซ่อน Scrollbar สำหรับ Chrome, Safari และ Opera */
.no-scrollbar::-webkit-scrollbar {
    display: none;
}

/* ซ่อน Scrollbar สำหรับ IE, Edge และ Firefox */
.no-scrollbar {
    -ms-overflow-style: none;
    /* IE and Edge */
    scrollbar-width: none;
    /* Firefox */
}

@import "tailwindcss";

/* Animation อื่นๆ เหมือนเดิม */

.ai-border {
    position: relative;
    border-radius: 16px;
    padding: 2px;
    background: linear-gradient(90deg,
            #4285f4,
            #34a853,
            #fbbc05,
            #ea4335,
            #4285f4);
    background-size: 300% 300%;
    animation: ai-gradient 4s linear infinite;
}

.ai-input {
    border-radius: 14px;
    background: rgba(15, 23, 42, 0.9);
    /* slate-900 */
    backdrop-filter: blur(12px);
}

@keyframes ai-gradient {
    0% {
        background-position: 0% 50%;
    }

    100% {
        background-position: 300% 50%;
    }
}


@keyframes pulse-glow {

    0%,
    100% {
        box-shadow: 0 0 10px rgba(37, 99, 235, 0.4);
    }

    50% {
        box-shadow: 0 0 20px rgba(37, 99, 235, 0.7);
    }
}

.fade-in {
    animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>