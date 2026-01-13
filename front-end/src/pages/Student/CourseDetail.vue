<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router' // เพิ่ม useRouter
import api from '../../service/api'
import { useAuthStore } from '../../../Store/auth'

const route = useRoute()
const router = useRouter() // สร้าง instance ของ router
const course = ref(null)
const loading = ref(true)
const user = useAuthStore()
const BASE_URL = import.meta.env.VITE_BACKEND_URL

const openLessonId = ref(null)

onMounted(async () => {
    try {
        const res = await api.get(`/public/courses/${route.params.id}`)
        course.value = res.data
    } catch (err) {
        console.error('Fetch course failed:', err)
    } finally {
        loading.value = false
    }
})

const toggleLesson = (lessonId) => {
    openLessonId.value = openLessonId.value === lessonId ? null : lessonId
}

// ฟังก์ชันกลับหน้าแรก
const goHome = () => {
    router.push('/')
}
</script>

<template>
    <div class="min-h-screen bg-slate-50 pb-20 font-sans text-slate-800">

        <div class="max-w-7xl mx-auto px-6 py-4 ">
            <button @click="goHome"
                class="group flex items-center gap-2 cursor-pointer text-slate-500 hover:text-blue-600 transition-colors font-medium">
                <div class="p-2 bg-white rounded-xl shadow-sm group-hover:bg-blue-50 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </div>
                กลับหน้าแรก
            </button>
        </div>

        <div class="max-w-7xl mx-auto px-6 grid lg:grid-cols-3 gap-8">

            <div class="lg:col-span-2 space-y-6">

                <div v-if="loading" class="bg-white p-12 rounded-3xl shadow-sm text-center">
                    <div class="animate-bounce inline-block p-4 bg-blue-50 rounded-full mb-4">
                        <svg class="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor font-bold">
                            <path
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <p class="text-slate-400">กำลังเตรียมบทเรียนให้คุณ...</p>
                </div>

                <div v-else-if="course" class="space-y-6">
                    <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        <img :src="`${BASE_URL}${course.image}`" class="w-full aspect-video object-cover" />
                        <div class="p-8 space-y-4">
                            <span
                                class="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg uppercase tracking-wider">
                                {{ course.category?.name || 'ทั่วไป' }}
                            </span>
                            <h1 class="text-3xl font-bold text-slate-900 leading-tight">{{ course.title }}</h1>
                            <p class="text-slate-500 leading-relaxed text-lg">{{ course.description }}</p>
                        </div>
                    </div>

                    <div class="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                        <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
                            <span class="w-2 h-6 bg-blue-500 rounded-full"></span>
                            เนื้อหาการเรียนการสอน
                        </h2>

                        <div class="space-y-3">
                            <div v-for="(lesson, i) in course.lessons" :key="lesson.id" class="group">
                                <div @click="toggleLesson(lesson.id)"
                                    class="flex items-center justify-between p-5 rounded-2xl cursor-pointer border transition-all"
                                    :class="openLessonId === lesson.id ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-transparent hover:border-slate-200'">

                                    <div class="flex items-center gap-4">
                                        <span class="text-slate-300 font-black text-xl">{{ (i +
                                            1).toString().padStart(2, '0') }}</span>
                                        <span
                                            class="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{{
                                                lesson.title }}</span>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                        class="h-5 w-5 text-slate-400 transition-transform"
                                        :class="{ 'rotate-180 text-blue-500': openLessonId === lesson.id }" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>

                                <transition name="expand">
                                    <div v-if="openLessonId === lesson.id"
                                        class="overflow-hidden bg-white border-x border-b border-blue-100 rounded-b-2xl -mt-2">
                                        <div class="p-6 space-y-6">
                                            <p class="text-slate-600 text-sm leading-relaxed">{{ lesson.content }}</p>
                                            <div v-for="video in lesson.videos" :key="video.id"
                                                class="rounded-2xl overflow-hidden bg-black shadow-lg">
                                                <video class="w-full aspect-video" controls
                                                    :src="`${BASE_URL}${video.url}`"></video>
                                            </div>
                                        </div>
                                    </div>
                                </transition>
                            </div>
                        </div>
                    </div>

                    <div class="bg-blue-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center gap-6">
                        <img :src="course.image ? `${BASE_URL}${course.image}` : `https://ui-avatars.com/api/?name=${course.name}&background=fff&color=2563eb`"
                            class="w-24 h-24 rounded-2xl object-cover border-4 border-blue-500 shadow-xl" />
                        <div class="text-center md:text-left space-y-2">
                            <p class="text-blue-100 text-sm font-bold uppercase tracking-widest">ผู้สอนคอร์สนี้</p>
                            <h3 class="text-2xl font-bold">{{ course.teacher.name }}</h3>
                            <p class="text-blue-100 opacity-80 text-sm italic">"เปลี่ยนเรื่องยากให้เป็นเรื่องง่าย
                                สนุกไปกับการเรียนรู้ด้วยกันครับ"</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="space-y-6">
                <div v-if="course" class="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 sticky top-8">
                    <div class="text-center space-y-1 mb-8">
                        <p class="text-slate-400 text-sm font-medium">ค่าลงทะเบียนเรียน</p>
                        <h2 class="text-5xl font-black text-blue-600">฿{{ course.price.toLocaleString() }}</h2>
                        <p class="text-slate-300 text-xs line-through">ปกติ ฿{{ (course.price * 1.5).toLocaleString() }}
                        </p>
                    </div>

                    <div class="space-y-3">
                        <button
                            class="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all hover:-translate-y-1 active:scale-95 text-lg">
                            จองที่นั่งเรียน
                        </button>
                        <button
                            class="w-full py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-2xl font-bold transition-all">
                            ใส่ตะกร้าสินค้า
                        </button>
                    </div>

                    <ul class="mt-8 space-y-4">
                        <li v-for="item in ['เรียนซ้ำได้ไม่จำกัด', 'ปรึกษาผู้สอนได้ตลอด', 'รับใบประกาศเมื่อเรียนจบ']"
                            :key="item" class="flex items-center gap-3 text-sm text-slate-500">
                            <div
                                class="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20"
                                    fill="currentColor">
                                    <path fill-rule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clip-rule="evenodd" />
                                </svg>
                            </div>
                            {{ item }}
                        </li>
                    </ul>
                </div>
            </div>

        </div>
    </div>
</template>

<style scoped>
@import "tailwindcss";

/* Animation สำหรับการขยายบทเรียน */
.expand-enter-active,
.expand-leave-active {
    transition: all 0.3s ease-in-out;
    max-height: 1000px;
}

.expand-enter-from,
.expand-leave-to {
    max-height: 0;
    opacity: 0;
}

/* ปรับฟอนต์ให้ดูเป็นมิตร */
body {
    font-family: 'Prompt', sans-serif;
}
</style>