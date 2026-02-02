<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../service/api'
import { useAuthStore } from '../../../Store/auth'
import Swal from 'sweetalert2'
import { ChevronLeft, Play, Pause, CheckCircle2, Lock, PlayCircle } from 'lucide-vue-next'

/* =======================
  CORE & STATE
======================= */
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const courseId = Number(route.params.id)
const BASE_URL = import.meta.env.VITE_BACKEND_URL

const course = ref(null)
const lessons = ref([])
const lessonProgress = ref([])
const loading = ref(true)
const isEnrolled = ref(false)
const enrollmentStatus = ref(null)
const isPurchased = ref(false)

const activeIndex = ref(null)
const videoRef = ref(null)
const isPlaying = ref(false)
const lastTime = ref(0)
const canComplete = ref(false)

/* =======================
  COMPUTED
======================= */
const isLogin = computed(() => !!auth.token)

const activeLesson = computed(() => {
    if (activeIndex.value === null) return null
    return lessons.value[activeIndex.value]
})

const progressPercent = computed(() => {
    if (!lessons.value.length) return 0
    const completed = lessonProgress.value.filter(p => p.completed).length
    return Math.round((completed / lessons.value.length) * 100)
})

/* =======================
  VIDEO CONTROL (CUSTOM)
======================= */
const togglePlay = () => {
    if (!videoRef.value) return
    if (videoRef.value.paused) {
        videoRef.value.play()
        isPlaying.value = true
    } else {
        videoRef.value.pause()
        isPlaying.value = false
    }
}

const onTimeUpdate = () => {
    if (!videoRef.value) return
    const current = videoRef.value.currentTime

    // ป้องกันการโกง: อนุญาตให้เดินหน้าได้ทีละนิดเท่านั้น
    if (current > lastTime.value && current - lastTime.value < 1.2) {
        lastTime.value = current
    }

    const duration = videoRef.value.duration || 0
    if (duration > 0 && lastTime.value >= duration * 0.95) {
        canComplete.value = true
    }
}

const onSeeking = () => {
    if (!videoRef.value) return
    // ถ้าพยายามลากข้ามเวลาที่ยังเรียนไม่ถึง ให้ดีดกลับ
    if (videoRef.value.currentTime > lastTime.value + 0.5) {
        videoRef.value.currentTime = lastTime.value
    }
}

const lockRate = () => {
    if (videoRef.value && videoRef.value.playbackRate !== 1) {
        videoRef.value.playbackRate = 1
    }
}

/* =======================
  LOGIC & API
======================= */
const canOpenLesson = (index) => {
    if (!isEnrolled.value) return false
    if (index === 0) return true
    return lessons.value[index - 1]?.isCompleted === true
}

const fetchCourse = async () => {
    try {
        const res = await api.get(`/public/courses/${courseId}`)
        course.value = res.data
        enrollmentStatus.value = res.data.enrollmentStatus
        isPurchased.value = ['PENDING', 'APPROVED'].includes(enrollmentStatus.value)
        isEnrolled.value = enrollmentStatus.value === 'APPROVED'

        lessons.value = res.data.lessons.map(l => ({
            lessonId: l.id,
            title: l.title,
            videos: l.videos,
            isCompleted: false
        }))
    } catch (err) {
        console.error(err)
    }
}

const loadProgress = async () => {
    if (!isEnrolled.value) return
    try {
        const res = await api.get(`/student/courses/${courseId}/lessons`)
        lessonProgress.value = res.data
        const map = Object.fromEntries(res.data.map(p => [p.lessonId, p.completed]))
        lessons.value.forEach(l => {
            l.isCompleted = !!map[l.lessonId]
        })
    } catch (err) {
        console.error(err)
    }
}

const openLesson = (index) => {
    if (!isEnrolled.value) {
        Swal.fire('แจ้งเตือน', enrollmentStatus.value === 'PENDING' ? 'รอแอดมินอนุมัติการชำระเงิน' : 'กรุณาสมัครเรียนก่อน', 'info')
        return
    }
    if (!canOpenLesson(index)) return

    activeIndex.value = index
    canComplete.value = false
    lastTime.value = 0
    isPlaying.value = false
}

const markCompleted = async () => {
    try {
        const video = activeLesson.value.videos[0]
        await api.post('/watch', {
            videoId: video.id,
            watchTime: Math.floor(lastTime.value)
        })
        await loadProgress()
        Swal.fire({ icon: 'success', title: 'เยี่ยมมาก! เรียนจบแล้ว', timer: 1500, showConfirmButton: false })

        if (canOpenLesson(activeIndex.value + 1)) {
            activeIndex.value++
            lastTime.value = 0
            canComplete.value = false
        }
    } catch (err) {
        Swal.fire('ข้อผิดพลาด', 'ไม่สามารถบันทึกความคืบหน้าได้', 'warning')
    }
}

const buyCourse = async () => {
    if (!isLogin.value) return router.push('/login')
    try {
        const res = await api.post('/orders', { courseId })
        router.push(`/student/payment/${res.data.id}`)
    } catch (err) {
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถสร้างรายการสั่งซื้อได้', 'error')
    }
}

onMounted(async () => {
    await fetchCourse()
    await loadProgress()
    loading.value = false
})
</script>

<template>
    <div class="min-h-screen bg-[#FDFDFF] text-slate-900 font-sans">
        <nav class="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 px-6 py-4">
            <div class="max-w-[1600px] mx-auto flex justify-between items-center">
                <button @click="router.push('/')"
                    class="group flex items-center text-slate-500 hover:text-indigo-600 transition-all font-semibold">
                    <ChevronLeft class="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </button>

                <div class="flex items-center gap-6" v-if="course">
                    <div class="hidden md:block text-right">
                        <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Currently Learning</p>
                        <p class="text-sm font-black truncate max-w-[250px]">{{ course.title }}</p>
                    </div>
                    <div class="relative w-12 h-12 flex items-center justify-center">
                        <svg class="w-full h-full -rotate-90">
                            <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="4" fill="transparent"
                                class="text-slate-100" />
                            <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="4" fill="transparent"
                                class="text-indigo-600 transition-all duration-1000" :stroke-dasharray="125.6"
                                :stroke-dashoffset="125.6 - (125.6 * progressPercent) / 100" />
                        </svg>
                        <span class="absolute text-[10px] font-black">{{ progressPercent }}%</span>
                    </div>
                </div>
            </div>
        </nav>

        <main class="max-w-[1600px] mx-auto p-4 md:p-8">
            <div v-if="loading" class="flex flex-col items-center justify-center py-32">
                <div class="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>

            <div v-else class="grid grid-cols-12 gap-8">
                <div class="col-span-12 lg:col-span-8 space-y-8">
                    <template v-if="isEnrolled">
                        <div class="relative bg-black rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-100 aspect-video group cursor-pointer"
                            @click="togglePlay">
                            <div v-if="!activeLesson"
                                class="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-900 z-10">
                                <PlayCircle class="w-20 h-20 mb-4 text-indigo-500 opacity-80" />
                                <h2 class="text-2xl font-bold">บทเรียนพร้อมแล้ว</h2>
                                <button @click.stop="openLesson(0)"
                                    class="mt-6 bg-indigo-600 hover:bg-indigo-700 px-10 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/30">
                                    เริ่มเรียนเลย
                                </button>
                            </div>

                            <video v-else ref="videoRef" :key="activeLesson.lessonId"
                                :src="`${BASE_URL}${activeLesson.videos[0]?.url}`" class="w-full h-full object-contain"
                                disablePictureInPicture playsinline @timeupdate="onTimeUpdate" @seeking="onSeeking"
                                @ratechange="lockRate" @contextmenu.prevent />

                            <div v-if="activeLesson"
                                class="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
                                :class="isPlaying ? 'opacity-0' : 'opacity-100 bg-black/30'">
                                <div
                                    class="bg-white/20 backdrop-blur-md p-8 rounded-full shadow-2xl border border-white/30">
                                    <Play v-if="!isPlaying" class="w-12 h-12 text-white fill-current" />
                                    <Pause v-else class="w-12 h-12 text-white fill-current" />
                                </div>
                            </div>
                        </div>

                        <div class="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
                            <div class="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                                <div class="space-y-2">
                                    <span
                                        class="bg-indigo-50 text-indigo-600 text-xs font-black px-3 py-1 rounded-lg uppercase tracking-wider">Lesson
                                        {{ (activeIndex || 0) + 1 }}</span>
                                    <h2 class="text-3xl font-black text-slate-800">{{ activeLesson ? activeLesson.title
                                        : course.title }}</h2>
                                    <p class="text-slate-500 leading-relaxed max-w-2xl">{{ course.description }}</p>
                                </div>
                                <button v-if="activeLesson" @click="markCompleted"
                                    :disabled="!canComplete || activeLesson.isCompleted"
                                    class="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-green-100"
                                    :class="activeLesson.isCompleted ? 'bg-green-500 text-white cursor-default' : 'bg-green-600 text-white hover:bg-green-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none'">
                                    <CheckCircle2 class="w-5 h-5" />
                                    {{ activeLesson.isCompleted ? 'เรียนจบแล้ว' : 'ทำเครื่องหมายว่าเรียนจบ' }}
                                </button>
                            </div>
                        </div>
                    </template>

                    <template v-else>
                        <div
                            class="bg-white rounded-[3rem] p-10 md:p-16 shadow-xl border border-slate-100 relative overflow-hidden">
                            <div
                                class="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 opacity-50">
                            </div>
                            <div class="relative z-10">
                                <span
                                    class="bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Premium
                                    Course</span>
                                <h1 class="text-5xl font-black text-slate-900 mt-6 mb-8 leading-tight">{{ course.title
                                    }}</h1>
                                <p class="text-xl text-slate-600 leading-relaxed mb-12">{{ course.description }}</p>

                                <div class="grid md:grid-cols-2 gap-6">
                                    <div v-for="(l, i) in course.lessons" :key="l.id"
                                        class="flex items-center p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 font-medium italic">
                                        <Lock class="w-4 h-4 mr-3 text-slate-400" />
                                        บทที่ {{ i + 1 }}: {{ l.title }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>

                <div class="col-span-12 lg:col-span-4 space-y-6">
                    <div v-if="!isEnrolled"
                        class="bg-slate-900 rounded-[2.5rem] p-10 text-white text-center shadow-2xl sticky top-28 transition-all hover:scale-[1.02]">
                        <template v-if="!isPurchased">
                            <p class="text-indigo-400 font-bold mb-2 uppercase tracking-widest text-xs">Unlock Full
                                Access</p>
                            <div class="flex items-center justify-center gap-2 mb-8">
                                <span class="text-2xl font-bold text-slate-500 line-through">฿{{ (course.price *
                                    1.5).toFixed(0) }}</span>
                                <span class="text-6xl font-black">฿{{ course.price }}</span>
                            </div>
                            <button @click="buyCourse"
                                class="w-full bg-white text-slate-900 hover:bg-indigo-50 py-5 rounded-[1.5rem] font-black text-xl transition-all shadow-xl">
                                สมัครเรียนตอนนี้
                            </button>
                        </template>
                        <template v-else-if="enrollmentStatus === 'PENDING'">
                            <div class="py-6 space-y-4">
                                <div
                                    class="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                    <Lock class="text-amber-500 w-10 h-10" />
                                </div>
                                <h3 class="text-2xl font-black">กำลังตรวจสอบ</h3>
                                <p class="text-slate-400">เราได้รับยอดโอนแล้ว<br />แอดมินจะอนุมัติภายใน 24 ชม.</p>
                            </div>
                        </template>
                    </div>

                    <div v-if="isEnrolled"
                        class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden sticky top-28">
                        <div class="p-8 border-b bg-slate-50/50 flex justify-between items-center">
                            <div>
                                <h3 class="font-black text-xl">บทเรียนทั้งหมด</h3>
                                <p class="text-xs text-slate-400 font-bold uppercase mt-1">{{ lessons.length }} Lessons
                                </p>
                            </div>
                        </div>

                        <div class="max-h-[55vh] overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            <button v-for="(l, i) in lessons" :key="l.lessonId" @click="openLesson(i)"
                                :disabled="!canOpenLesson(i)"
                                class="w-full group flex items-center gap-5 p-5 rounded-3xl transition-all duration-300 text-left border"
                                :class="[
                                    activeIndex === i ? 'bg-indigo-600 border-transparent shadow-xl shadow-indigo-100 scale-[1.02]' : 'bg-white border-slate-50 hover:border-indigo-100 hover:bg-indigo-50/30',
                                    !canOpenLesson(i) ? 'opacity-40 cursor-not-allowed grayscale bg-slate-50' : ''
                                ]">

                                <div class="relative flex-shrink-0">
                                    <div class="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-colors"
                                        :class="[
                                            l.isCompleted ? 'bg-green-100 text-green-600' :
                                                activeIndex === i ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                                        ]">
                                        <CheckCircle2 v-if="l.isCompleted" class="w-6 h-6" />
                                        <span v-else>{{ i + 1 }}</span>
                                    </div>
                                </div>

                                <div class="flex-1 overflow-hidden">
                                    <p class="text-sm font-black truncate"
                                        :class="activeIndex === i ? 'text-white' : 'text-slate-700'">
                                        {{ l.title }}
                                    </p>
                                    <div class="flex items-center gap-2 mt-1">
                                        <span class="text-[9px] font-black uppercase tracking-tighter"
                                            :class="activeIndex === i ? 'text-indigo-200' : 'text-slate-300'">
                                            {{ l.isCompleted ? 'Completed' : 'Video' }}
                                        </span>
                                    </div>
                                </div>

                                <Lock v-if="!canOpenLesson(i)" class="w-4 h-4 text-slate-300" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<style scoped>
@import "tailwindcss";

.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #E2E8F0;
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #CBD5E1;
}

/* ซ่อนปุ่มควบคุมวิดีโอ */
video::-webkit-media-controls {
    display: none !important;
}

video {
    outline: none;
}

/* Animation เล็กๆ สำหรับ Progress Circle */
circle {
    transition: stroke-dashoffset 1s ease-in-out;
}
</style>