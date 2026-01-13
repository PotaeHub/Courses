<script setup>
import { onMounted, ref, computed } from 'vue'
import api from '../service/api'

import PopularCourses from '@/components/course/PopularCourses.vue'
import LatestCourses from '@/components/course/LatestCourses.vue'
import CategoryList from '@/components/course/CategoryList.vue'
import Footer from '../components/course/Footer.vue'

const popularCourses = ref([])
const latestCourses = ref([])
const categories = ref([])
const loading = ref(true)
const selectedCategory = ref(null)

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
        <section class="relative overflow-hidden bg-slate-900 py-24 sm:py-32">
            </section>

        <div class="max-w-7xl mx-auto px-6 -mt-12 relative z-20">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
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
                    <button 
                        @click="selectedCategory = null"
                        :class="!selectedCategory ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'"
                        class="px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap"
                    >
                        ทั้งหมด
                    </button>

                    <button 
                        v-for="cat in categories" 
                        :key="cat.id"
                        @click="selectedCategory = cat.id"
                        :class="selectedCategory === cat.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'"
                        class="px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap"
                    >
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
                        <button class="text-blue-600 font-bold hover:gap-2 flex items-center transition-all">
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

        <section class="bg-slate-900 py-20 text-center text-white relative overflow-hidden">
            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-blue-600/10 blur-3xl rounded-full"></div>
            <div class="relative z-10">
                <h2 class="text-4xl font-black mb-4">พร้อมที่จะก้าวต่อไปหรือยัง?</h2>
                <p class="mb-10 text-gray-400 max-w-xl mx-auto">สมัครสมาชิกวันนี้เพื่อรับสิทธิพิเศษและเริ่มสร้างทักษะใหม่ที่ตลาดต้องการ</p>
                <button class="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl shadow-blue-500/20 hover:scale-105 transition-all">
                    เริ่มต้นเรียนฟรีวันนี้
                </button>
            </div>
        </section>
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
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
}

/* Animation อื่นๆ เหมือนเดิม */
@import "tailwindcss";

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