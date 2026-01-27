<script setup>
import { onMounted, ref, computed } from 'vue'
import api from '../service/api'

import PopularCourses from '@/components/course/PopularCourses.vue'
import LatestCourses from '@/components/course/LatestCourses.vue'
import Footer from '../components/course/Footer.vue'
import { useAuthStore } from '../../Store/auth'
import { useRouter } from 'vue-router'
const route = useRouter()
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
   return popularCourses.value.filter(
  c => Number(c.category?.id) === Number(selectedCategory.value)
)
})

const filteredLatestCourses = computed(() => {
    if (!selectedCategory.value) return latestCourses.value
   return latestCourses.value.filter(
  c => Number(c.category?.id) === Number(selectedCategory.value)
)
})
const AllCourse = () =>{
        route.push("/student/courses")
}
</script>

<template>
    <div class="min-h-screen bg-[#F5F2F2]">
        <section v-if="!auth.user"
            class="relative overflow-hidden bg-[#0F172A] py-32 text-center text-white">
            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full"></div>
            
            <div class="relative z-10 max-w-3xl mx-auto px-6">
                <h2 class="text-5xl md:text-6xl font-black mb-6 tracking-tight">
                    พร้อมที่จะก้าวต่อไป<span class="text-blue-500">หรือยัง?</span>
                </h2>
                <p class="mb-12 text-gray-400 text-lg font-light leading-relaxed">
                    สมัครสมาชิกวันนี้เพื่อรับสิทธิพิเศษและเริ่มสร้างทักษะใหม่ที่ตลาดต้องการ <br class="hidden md:block" /> 
                    เข้าถึงคอร์สเรียนคุณภาพจากผู้เชี่ยวชาญทั่วโลก
                </p>
                <button
                    class="bg-blue-600 hover:bg-blue-500 text-white px-12 py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-blue-500/25 transition-all active:scale-95">
                    เริ่มต้นเรียนฟรีวันนี้
                </button>
            </div>
        </section>

        <section v-else class="relative overflow-hidden bg-[#BDE8F5] pt-24 pb-32">
            <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[100px] -mr-32 -mt-32"></div>

            <div class="max-w-7xl mx-auto px-6 relative z-10">
                <div class="flex flex-col md:flex-row md:items-end justify-between gap-10">
                    <div class="space-y-4">
                        <div class="inline-flex items-center gap-2.5 bg-blue-50 text-blue-400 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                            <span class="relative flex h-2 w-2">
                                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
                            </span>
                            Welcome Back
                        </div>
                        <h2 class="text-5xl md:text-6xl font-black text-gray-700 leading-[1.1]">
                            สวัสดี, {{ auth.user.name }} 👋<br />
                            <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-indigo-500">
                                วันนี้อยากเรียนอะไรดี?
                            </span>
                        </h2>
                    </div>

                    <button @click="$router.push('/student/mycourses')"
                        class="group bg-gray-700 text-white px-8 py-4 rounded-[2rem] font-bold shadow-xl hover:bg-blue-600 transition-all duration-500 flex items-center gap-3 w-fit">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        เข้าสู่คอร์สของฉัน
                    </button>
                </div>

                <div class="mt-16 max-w-2xl group">
                    <div class="p-[1.5px] rounded-[2rem] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 group-focus-within:from-blue-400 group-focus-within:to-indigo-400 transition-all duration-500">
                        <div class="flex items-center px-7 py-5 bg-white rounded-[1.95rem]">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-300 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input type="text" placeholder="ค้นหาบทเรียน หรือทักษะที่ต้องการพัฒนา..."
                                class="w-full bg-transparent outline-none text-lg text-gray-700 placeholder-gray-300 font-light" />
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <div class="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-white/50">
                <div v-for="(stat, index) in [
                    { val: '10,000+', label: 'นักเรียนทั้งหมด' },
                    { val: '500+', label: 'คอร์สคุณภาพ' },
                    { val: '150+', label: 'ผู้สอนมืออาชีพ' },
                    { val: '4.9/5', label: 'ความพึงพอใจ' }
                ]" :key="index" class="text-center md:border-r border-gray-100 last:border-0 py-2">
                    <div class="text-3xl font-black text-gray-900 tracking-tighter">{{ stat.val }}</div>
                    <div class="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em] mt-2">{{ stat.label }}</div>
                </div>
            </div>
        </div>

        <div class="sticky top-0 z-30 bg-white/70 backdrop-blur-lg border-b border-gray-100 mt-16">
            <div class="max-w-7xl mx-auto px-6 py-5">
                <div class="flex items-center gap-3 overflow-x-auto no-scrollbar">
                    <button @click="selectedCategory = null"
                        :class="!selectedCategory ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'"
                        class="px-8 py-3 rounded-full text-xs font-bold transition-all whitespace-nowrap uppercase tracking-widest">
                        ทั้งหมด
                    </button>

                    <button v-for="cat in categories" :key="cat.id" @click="selectedCategory = cat.id"
                        :class="selectedCategory === cat.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'"
                        class="px-8 py-3 rounded-full text-xs font-bold transition-all whitespace-nowrap uppercase tracking-widest">
                        {{ cat.name }}
                    </button>
                </div>
            </div>
        </div>

        <div class="max-w-7xl mx-auto px-6 py-20 space-y-32">
            <div v-if="loading" class="flex flex-col items-center py-32">
                <div class="w-12 h-12 border-[3px] border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <p class="mt-6 text-gray-400 font-light tracking-wide">กำลังเตรียมเนื้อหาที่ยอดเยี่ยมสำหรับคุณ...</p>
            </div>

            <template v-else>
                <section class="space-y-10">
                    <div class="flex items-end justify-between">
                        <div class="space-y-1">
                            <h2 class="text-4xl font-black text-gray-900 tracking-tight">คอร์สยอดนิยม</h2>
                            <p class="text-gray-400 font-light">คอร์สที่ได้รับความไว้วางใจสูงสุดจากนักเรียนของเรา</p>
                        </div>
                        <button  @click="AllCourse" class="group text-blue-600 font-bold text-sm flex items-center gap-2 hover:gap-4 transition-all">
                            ดูทั้งหมด <span class="text-xl">→</span>
                        </button>
                    </div>
                    <PopularCourses :courses="filteredPopularCourses" />
                    <div v-if="filteredPopularCourses.length === 0" class="text-center py-24 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
                        <p class="text-gray-400 font-medium">ไม่พบข้อมูลในหมวดหมู่นี้</p>
                    </div>
                </section>

                <section class="space-y-10 pb-32">
                    <div class="flex items-end justify-between">
                        <div class="space-y-1">
                            <h2 class="text-4xl font-black text-gray-900 tracking-tight">คอร์สมาใหม่</h2>
                            <p class="text-gray-400 font-light">เริ่มต้นเรียนรู้เทคโนโลยีล่าสุดได้แล้ววันนี้</p>
                        </div>
                        <button class="group text-blue-600 font-bold text-sm flex items-center gap-2 hover:gap-4 transition-all">
                            ดูทั้งหมด <span class="text-xl">→</span>
                        </button>
                    </div>
                    <LatestCourses :courses="filteredLatestCourses" />
                    <div v-if="filteredLatestCourses.length === 0" class="text-center py-24 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
                        <p class="text-gray-400 font-medium">ไม่พบข้อมูลในหมวดหมู่นี้</p>
                    </div>
                </section>
            </template>
        </div>
        <Footer />
    </div>
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