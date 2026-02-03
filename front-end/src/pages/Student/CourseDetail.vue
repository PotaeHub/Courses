<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../service/api'
import { useAuthStore } from '../../../Store/auth'
import Swal from 'sweetalert2'
import {
    ChevronLeft, Play, Pause, CheckCircle2, Lock,
    PlayCircle, Trophy, ArrowRight, ExternalLink
} from 'lucide-vue-next'

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
const preTestDone = ref(false)
const activeIndex = ref(null)
const videoRef = ref(null)
const isPlaying = ref(false)
const lastTime = ref(0)
const canComplete = ref(false)

/* =======================
  COMPUTED
======================= */
const preTestUrl = computed(() => course.value?.preTestUrl || null)
const postTestUrl = computed(() => course.value?.postTestUrl || null)
const activeLesson = computed(() => activeIndex.value !== null ? lessons.value[activeIndex.value] : null)

// เช็คว่าเรียนจบครบทุกบทหรือยัง
const isAllLessonsCompleted = computed(() => {
    if (lessons.value.length === 0) return false
    return lessons.value.every(l => l.isCompleted)
})

const progressPercent = computed(() => {
    if (!lessons.value.length) return 0
    const completed = lessons.value.filter(l => l.isCompleted).length
    return Math.round((completed / lessons.value.length) * 100)
})

/* =======================
  VIDEO CONTROLS (Anti-Cheat)
======================= */
const togglePlay = () => {
    if (!videoRef.value) return
    videoRef.value.paused ? videoRef.value.play() : videoRef.value.pause()
    isPlaying.value = !videoRef.value.paused
}

const onTimeUpdate = () => {
    if (!videoRef.value) return
    const current = videoRef.value.currentTime
    // ป้องกันการลากข้าม (Skip)
    if (current > lastTime.value && current - lastTime.value < 1.2) {
        lastTime.value = current
    }
    // ต้องดูอย่างน้อย 95% ถึงจะจบ
    const duration = videoRef.value.duration || 0
    if (duration && lastTime.value >= duration * 0.95) {
        canComplete.value = true
    }
}

const onSeeking = () => {
    if (videoRef.value.currentTime > lastTime.value + 0.5) {
        videoRef.value.currentTime = lastTime.value
    }
}

/* =======================
  LOGIC & ACTIONS
======================= */
const canOpenLesson = (index) => {
    if (!isEnrolled.value || (preTestUrl.value && !preTestDone.value)) return false
    if (index === 0) return true
    return lessons.value[index - 1]?.isCompleted === true
}

const openLesson = (index) => {
    if (!canOpenLesson(index)) return
    activeIndex.value = index
    lastTime.value = 0
    canComplete.value = false
    isPlaying.value = false
}

const markCompleted = async () => {
    try {
        const video = activeLesson.value.videos[0]
        await api.post('/watch', {
            videoId: video.id,
            watchTime: Math.floor(lastTime.value)
        })

        // Update local state
        lessons.value[activeIndex.value].isCompleted = true

        await Swal.fire({
            title: 'เยี่ยมมาก!',
            text: 'คุณเรียนจบเนื้อหาส่วนนี้แล้ว',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        })

        // Auto-play next lesson if available
        if (activeIndex.value < lessons.value.length - 1) {
            openLesson(activeIndex.value + 1)
        }
    } catch (e) {
        Swal.fire('Error', 'ไม่สามารถบันทึกความคืบหน้าได้', 'error')
    }
}

const confirmPreTest = async () => {
    const res = await Swal.fire({
        title: 'ทำ Pre-test หรือยัง?',
        text: 'เมื่อยืนยันแล้ว ระบบจะเปิดเนื้อหาให้เรียนทันที',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'ยืนยันทำแล้ว',
        confirmButtonColor: '#4f46e5'
    })
    if (res.isConfirmed) preTestDone.value = true
}

const fetchCourse = async () => {
    try {
        const res = await api.get(`/public/courses/${courseId}`)
        course.value = res.data
        enrollmentStatus.value = res.data.enrollmentStatus
        isEnrolled.value = enrollmentStatus.value === 'APPROVED'

        lessons.value = res.data.lessons.map(l => ({
            lessonId: l.id,
            title: l.title,
            videos: l.videos,
            isCompleted: false
        }))

        if (isEnrolled.value) await loadProgress()
    } catch (e) { console.error(e) }
    finally { loading.value = false }
}

const loadProgress = async () => {
    const res = await api.get(`/student/courses/${courseId}/lessons`)
    const map = Object.fromEntries(res.data.map(p => [p.lessonId, p.completed]))
    lessons.value.forEach(l => (l.isCompleted = !!map[l.lessonId]))
}

onMounted(fetchCourse)
</script>

<template>
    <div class="min-h-screen bg-[#F8FAFC] text-slate-900">
        <nav class="bg-white/80 backdrop-blur-xl border-b sticky top-0 z-50 px-6 py-4">
            <div class="max-w-[1600px] mx-auto flex justify-between items-center">
                <button @click="router.push('/')"
                    class="group flex items-center text-slate-500 hover:text-indigo-600 font-bold transition-all">
                    <ChevronLeft class="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>

                <div class="flex items-center gap-4" v-if="course">
                    <div class="hidden md:block text-right">
                        <p class="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">Course Progress</p>
                        <p class="text-sm font-bold text-slate-700">{{ progressPercent }}% Completed</p>
                    </div>
                    <div class="w-12 h-12 relative flex items-center justify-center">
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
            <div v-if="loading" class="flex justify-center py-32">
                <div class="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>

            <div v-else class="grid grid-cols-12 gap-8">
                <div class="col-span-12 lg:col-span-8 space-y-6">
                    <template v-if="isEnrolled">
                        <div
                            class="relative bg-slate-950 rounded-[2.5rem] overflow-hidden shadow-2xl aspect-video group shadow-indigo-200/50">

                            <div v-if="preTestUrl && !preTestDone"
                                class="absolute inset-0 z-30 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center">
                                <div
                                    class="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6 ring-8 ring-indigo-500/10">
                                    <Lock class="w-10 h-10 text-indigo-400" />
                                </div>
                                <h2 class="text-3xl font-black text-white mb-2">Unlock Your Learning</h2>
                                <p class="text-slate-400 mb-8 max-w-sm">
                                    กรุณาทำแบบทดสอบก่อนเรียนเพื่อเริ่มเข้าสู่บทเรียนแรก</p>
                                <div class="flex flex-col gap-4 w-full max-w-xs">
                                    <a :href="preTestUrl" target="_blank"
                                        class="bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2">
                                        เปิดแบบทดสอบ
                                        <ExternalLink :size="18" />
                                    </a>
                                    <button @click="confirmPreTest"
                                        class="text-slate-500 hover:text-white text-sm font-bold underline">ฉันทำเสร็จแล้ว</button>
                                </div>
                            </div>

                            <div v-else-if="isAllLessonsCompleted"
                                class="absolute inset-0 z-30 bg-gradient-to-br from-indigo-900 to-slate-900 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in duration-500">
                                <div
                                    class="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(250,204,21,0.3)]">
                                    <Trophy class="w-12 h-12 text-indigo-900" />
                                </div>
                                <h2 class="text-4xl font-black text-white mb-2">ยินดีด้วย! จบคอร์สแล้ว</h2>
                                <p class="text-indigo-200 mb-8">ขั้นตอนสุดท้าย: ทำแบบทดสอบหลังเรียนเพื่อรับใบเซอร์ฯ</p>
                                <a :href="postTestUrl" target="_blank"
                                    class="bg-white text-indigo-900 px-10 py-4 rounded-2xl font-black hover:scale-105 transition-all flex items-center gap-2 shadow-2xl">
                                    ทำ Post-test ตอนนี้
                                    <ArrowRight :size="20" />
                                </a>
                            </div>

                            <template v-else>
                                <div v-if="!activeLesson"
                                    class="absolute inset-0 z-10 bg-slate-900 flex flex-col items-center justify-center text-white">
                                    <PlayCircle class="w-20 h-20 mb-4 text-indigo-500 opacity-80" />
                                    <h3 class="text-xl font-bold">เลือกบทเรียนที่ต้องการเรียน</h3>
                                    <button @click="openLesson(0)"
                                        class="mt-6 bg-indigo-600 px-8 py-3 rounded-xl font-bold">เริ่มบทเรียนแรก</button>
                                </div>

                                <video v-else ref="videoRef" :key="activeLesson.lessonId"
                                    :src="`${BASE_URL}${activeLesson.videos[0]?.url}`"
                                    class="w-full h-full object-contain" @timeupdate="onTimeUpdate" @seeking="onSeeking"
                                    @click="togglePlay" />

                                <div v-if="activeLesson && !isPlaying"
                                    class="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none transition-opacity">
                                    <div
                                        class="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                                        <Play class="w-8 h-8 text-white fill-current" />
                                    </div>
                                </div>
                            </template>
                        </div>

                        <div
                            class="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100 transition-all">
                            <div class="flex flex-col md:flex-row justify-between items-start gap-6">
                                <div class="space-y-3">
                                    <div class="flex items-center gap-2">
                                        <span
                                            class="bg-indigo-50 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                            {{ isAllLessonsCompleted ? 'Completed' : `Lesson ${(activeIndex || 0) + 1}`
                                            }}
                                        </span>
                                        <span v-if="activeLesson?.isCompleted"
                                            class="text-green-500 flex items-center gap-1 text-[10px] font-black uppercase">
                                            <CheckCircle2 :size="14" /> Completed
                                        </span>
                                    </div>
                                    <h1 class="text-3xl font-black text-slate-800 leading-tight">
                                        {{ isAllLessonsCompleted ? 'คุณยอดเยี่ยมมาก!' : (activeLesson ?
                                            activeLesson.title : course.title) }}
                                    </h1>
                                    <p class="text-slate-500 leading-relaxed max-w-2xl">{{ course.description }}</p>
                                </div>

                                <button v-if="activeLesson" @click="markCompleted"
                                    :disabled="!canComplete || activeLesson.isCompleted"
                                    class="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black transition-all shadow-lg"
                                    :class="activeLesson.isCompleted
                                        ? 'bg-green-50 text-green-600 cursor-default'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 shadow-indigo-100'">
                                    <CheckCircle2 class="w-5 h-5" />
                                    {{ activeLesson.isCompleted ? 'บทเรียนนี้จบแล้ว' : 'ทำเครื่องหมายว่าเรียนจบ' }}
                                </button>
                            </div>
                        </div>
                    </template>

                    <template v-else>
                        <div
                            class="bg-white rounded-[3rem] p-10 md:p-16 shadow-xl border border-slate-100 relative overflow-hidden group">
                            <div
                                class="absolute -top-24 -right-24 w-64 h-64 bg-indigo-50 rounded-full transition-transform group-hover:scale-110">
                            </div>
                            <div class="relative z-10">
                                <span
                                    class="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200">Premium
                                    Course</span>
                                <h1 class="text-5xl font-black text-slate-900 mt-8 mb-6 leading-[1.1]">{{ course.title
                                }}</h1>
                                <p class="text-xl text-slate-500 leading-relaxed mb-12 max-w-2xl">{{ course.description
                                }}</p>

                                <div class="grid md:grid-cols-2 gap-4">
                                    <div v-for="(l, i) in course.lessons" :key="l.id"
                                        class="flex items-center p-5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 font-bold group/item hover:bg-white hover:border-indigo-200 transition-all">
                                        <div
                                            class="w-8 h-8 rounded-lg bg-white flex items-center justify-center mr-4 text-xs shadow-sm group-hover/item:bg-indigo-600 group-hover/item:text-white transition-colors">
                                            {{ i + 1 }}</div>
                                        {{ l.title }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>

                <div class="col-span-12 lg:col-span-4 space-y-6">
                    <div v-if="!isEnrolled"
                        class="bg-slate-900 rounded-[2.5rem] p-10 text-white text-center shadow-2xl sticky top-28 border border-white/5">
                        <template v-if="enrollmentStatus !== 'PENDING'">
                            <p class="text-indigo-400 font-black mb-4 uppercase tracking-[0.2em] text-xs">Full Access
                            </p>
                            <div class="flex items-center justify-center gap-3 mb-10">
                                <span class="text-6xl font-black italic">฿{{ course.price }}</span>
                            </div>
                            <button
                                class="w-full bg-white text-slate-900 py-5 rounded-2xl font-black text-xl hover:bg-indigo-50 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:-translate-y-1">
                                สมัครเรียนทันที
                            </button>
                        </template>
                        <div v-else class="py-10 space-y-6">
                            <div
                                class="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse border border-amber-500/30">
                                <Lock class="text-amber-500 w-8 h-8" />
                            </div>
                            <h3 class="text-2xl font-black italic">รอการอนุมัติ...</h3>
                            <p class="text-slate-400 text-sm leading-relaxed">
                                แอดมินกำลังตรวจสอบยอดโอนของคุณ<br />กรุณารอสักครู่
                                (ไม่เกิน 24 ชม.)</p>
                        </div>
                    </div>

                    <div v-if="isEnrolled"
                        class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden sticky top-28">
                        <div class="p-8 border-b bg-slate-50/50">
                            <h3 class="font-black text-xl text-slate-800 italic">Course Content</h3>
                            <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{{
                                lessons.length }} Lessons
                                Available</p>
                        </div>

                        <div class="max-h-[60vh] overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            <button v-for="(l, i) in lessons" :key="l.lessonId" @click="openLesson(i)"
                                :disabled="!canOpenLesson(i)"
                                class="w-full group flex items-center gap-4 p-5 rounded-3xl transition-all duration-300 text-left border relative overflow-hidden"
                                :class="[
                                    activeIndex === i ? 'bg-indigo-600 border-transparent shadow-xl shadow-indigo-100 translate-x-1' : 'bg-white border-slate-50 hover:border-indigo-100 hover:bg-slate-50',
                                    !canOpenLesson(i) ? 'opacity-40 cursor-not-allowed grayscale' : ''
                                ]">

                                <div class="relative z-10 w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all shadow-sm"
                                    :class="[
                                        l.isCompleted ? 'bg-green-100 text-green-600' :
                                            activeIndex === i ? 'bg-white text-indigo-600 rotate-12' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'
                                    ]">
                                    <CheckCircle2 v-if="l.isCompleted" class="w-6 h-6" />
                                    <span v-else>{{ i + 1 }}</span>
                                </div>

                                <div class="flex-1 overflow-hidden relative z-10">
                                    <p class="text-sm font-black truncate transition-colors"
                                        :class="activeIndex === i ? 'text-white' : 'text-slate-700'">
                                        {{ l.title }}
                                    </p>
                                    <div class="flex items-center gap-2 mt-0.5">
                                        <span class="text-[9px] font-black uppercase tracking-tighter"
                                            :class="activeIndex === i ? 'text-indigo-200' : 'text-slate-400'">
                                            {{ l.isCompleted ? 'Completed' : 'Video Lesson' }}
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
    width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #E2E8F0;
    border-radius: 10px;
}

video {
    border-radius: 1rem;
}

video::-webkit-media-controls {
    display: none !important;
}

.animate-in {
    animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Background Pattern */
.min-h-screen {
    background-image: radial-gradient(#e2e8f0 0.5px, transparent 0.5px);
    background-size: 24px 24px;
}
</style>