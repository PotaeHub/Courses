<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../service/api'
import { useAuthStore } from '../../../Store/auth'
import Swal from 'sweetalert2'

/* =======================
    CORE & STATE
======================= */
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const courseId = Number(route.params.id)
const BASE_URL = import.meta.env.VITE_BACKEND_URL

const course = ref(null)
const loading = ref(true)
const isEnrolled = ref(false)
const openLessonId = ref(null)
const lessonProgress = ref([])
const reviews = ref([])
const rating = ref(5)
const avgRating = ref(0)
const comment = ref('')

const isLogin = computed(() => !!auth.token)
const totalLessons = computed(() => course.value?.lessons?.length || 0)
const completedLessons = computed(() => lessonProgress.value.filter(l => l.completed).length)

const progressPercent = computed(() => {
    if (!totalLessons.value) return 0
    return Math.round((completedLessons.value / totalLessons.value) * 100)
})

/* =======================
    API ACTIONS
======================= */
const fetchCourse = async () => {
    try {
        const res = await api.get(`/public/courses/${courseId}`)
        course.value = res.data
        if (course.value?.lessons?.length) {
            openLessonId.value = course.value.lessons[0].id
        }
    } catch (err) {
        console.error("Fetch Course Error:", err)
    } finally {
        loading.value = false
    }
}

const checkEnroll = async () => {
    if (!isLogin.value) return
    const res = await api.get(`/enroll/check/${courseId}`)
    isEnrolled.value = res.data.enrolled
}

const loadLessonProgress = async () => {
    if (!isEnrolled.value) return
    const res = await api.get(`/my-course/${courseId}/lesson`)
    lessonProgress.value = res.data
}

const loadReviews = async () => {
    const res = await api.get(`/public/courses/${courseId}/reviews`)
    reviews.value = res.data.reviews
    // console.log(res.data.reviews)   
    avgRating.value = res.data.average
}

const toggleLesson = (lessonId) => {
    if (!isEnrolled.value) return
    openLessonId.value = openLessonId.value === lessonId ? null : lessonId
}

const getLessonProgress = (lessonId) => {
    return lessonProgress.value.find(l => l.lessonId === lessonId)
}

const markLessonWatched = async (videoId) => {
    if (!isEnrolled.value) return
    try {
        await api.post('/progress/watch', { courseId, videoId })
        await loadLessonProgress()
    } catch (err) {
        console.error('markLessonWatched error', err)
    }
}

/* =======================
    REVIEW & DELETE LOGIC
======================= */
const submitReview = async () => {
    if (!comment.value.trim()) return
    try {
        await api.post(`/courses/${courseId}/reviews`, {
            rating: rating.value,
            comment: comment.value
        })
        comment.value = ''
        rating.value = 5
        await loadReviews()
        Swal.fire({ icon: 'success', title: 'ขอบคุณสำหรับรีวิวครับ', timer: 1500, showConfirmButton: false })
    } catch (err) {
        Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: err.response?.data?.message })
    }
}

const deleteReview = async (reviewId) => {
    const result = await Swal.fire({
        title: 'ลบรีวิวนี้ใช่หรือไม่?',
        text: "คุณจะไม่สามารถกู้คืนความคิดเห็นนี้ได้",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#334155',
        confirmButtonText: 'ยืนยันการลบ',
        cancelButtonText: 'ยกเลิก',
        reverseButtons: true,
        customClass: { popup: 'rounded-[2rem]' }
    })

    if (result.isConfirmed) {
        try {
            await api.delete(`/courses/${courseId}/reviews/${reviewId}`)
            await loadReviews()
            Swal.fire({ title: 'ลบเรียบร้อย', icon: 'success', timer: 1000, showConfirmButton: false })
        } catch (err) {
            Swal.fire({ title: 'ลบไม่สำเร็จ', icon: 'error' })
        }
    }
}

const buyCourse = async () => {
    if (!isLogin.value) return router.push('/login')
    const res = await api.post('/orders', { courseId })
    router.push(`/student/payment/${res.data.id}`)
}

const goHome = () => router.push('/')

onMounted(async () => {
    await fetchCourse()
    await checkEnroll()
    await loadLessonProgress()
    await loadReviews()
})
</script>

<template>
    <div class="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased pb-20">
        <nav class="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100">
            <div class="max-w-7xl mx-auto px-6 h-16 flex items-center">
                <button @click="goHome"
                    class="group flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
                    <span class="mr-2 transform group-hover:-translate-x-1 transition-transform">←</span>
                    กลับหน้าแรก
                </button>
            </div>
        </nav>

        <main class="max-w-7xl mx-auto px-6 py-8">
            <div v-if="loading" class="flex flex-col items-center justify-center py-20">
                <div class="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4">
                </div>
                <p class="text-slate-400 font-medium">กำลังเตรียมบทเรียนให้คุณ...</p>
            </div>

            <div v-else-if="course" class="grid lg:grid-cols-12 gap-10">

                <div class="lg:col-span-8 space-y-10">
                    <section class="overflow-hidden bg-white border border-slate-100 rounded-3xl">
                        <img :src="`${BASE_URL}${course.image}`" class="w-full aspect-[16/8] object-cover" />
                        <div class="p-8">
                            <h1 class="text-3xl font-extrabold mb-4">{{ course.title }}</h1>
                            <p class="text-slate-500 text-lg leading-relaxed">{{ course.description }}</p>

                            <div v-if="isEnrolled" class="mt-8 pt-6 border-t border-slate-50">
                                <div class="flex justify-between items-end mb-2">
                                    <span class="text-sm font-semibold">ความคืบหน้าการเรียน</span>
                                    <span class="text-sm font-bold text-blue-600">{{ progressPercent }}%</span>
                                </div>
                                <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div class="h-full bg-blue-600 transition-all duration-700"
                                        :style="{ width: progressPercent + '%' }" />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 class="text-xl font-bold mb-6 flex items-center">
                            เนื้อหาการเรียน
                            <span class="ml-3 text-xs font-normal bg-slate-100 text-slate-500 px-2 py-1 rounded-full">{{
                                totalLessons }} บทเรียน</span>
                        </h2>

                        <div class="space-y-3">
                            <div v-for="(lesson, i) in course.lessons" :key="lesson.id" class="group">
                                <div @click="toggleLesson(lesson.id)" :class="[
                                    'p-5 rounded-2xl flex items-center justify-between cursor-pointer transition-all border',
                                    openLessonId === lesson.id ? 'bg-white border-blue-100 ring-4 ring-blue-50' : 'bg-white border-slate-100 hover:border-blue-200'
                                ]">
                                    <div class="flex items-center gap-4">
                                        <span
                                            class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 text-sm font-bold group-hover:bg-blue-50 group-hover:text-blue-600">
                                            {{ i + 1 }}
                                        </span>
                                        <span class="font-medium text-slate-700">{{ lesson.title }}</span>
                                    </div>
                                    <div class="flex items-center gap-3">
                                        <span v-if="getLessonProgress(lesson.id)?.completed"
                                            class="text-emerald-500">✓</span>
                                        <span class="text-slate-300 transform transition-transform"
                                            :class="{ 'rotate-180': openLessonId === lesson.id }">▼</span>
                                    </div>
                                </div>

                                <div v-if="openLessonId === lesson.id" class="mt-2 p-6 bg-slate-900 rounded-2xl">
                                    <div v-if="isEnrolled">
                                        <div v-for="v in lesson.videos" :key="v.id" class="space-y-4">
                                            <video class="w-full rounded-xl shadow-2xl" controls
                                                :src="`${BASE_URL}${v.url}`" @ended="markLessonWatched(v.id)" />
                                        </div>
                                    </div>
                                    <div v-else class="py-10 text-center">
                                        <span class="text-4xl block mb-2">🔒</span>
                                        <p class="text-white font-medium">เนื้อหานี้เฉพาะผู้เรียนเท่านั้น</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section class="bg-white border border-slate-100 rounded-3xl p-8">
                        <div class="flex items-center justify-between mb-8">
                            <h2 class="text-xl font-bold">รีวิวจากผู้เรียน</h2>
                            <div class="bg-yellow-50 px-3 py-1 rounded-full text-yellow-600 font-bold">⭐ {{ avgRating }}
                                ({{ reviews.length }})</div>
                        </div>

                        <div v-if="isEnrolled" class="mb-10 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <textarea v-model="comment"
                                class="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                                rows="3" placeholder="บทเรียนเป็นอย่างไรบ้าง..." />
                            <div class="flex items-center justify-between mt-4">
                                <select v-model="rating"
                                    class="bg-white border border-slate-200 rounded-lg p-1 text-sm font-bold">
                                    <option v-for="n in 5" :key="n" :value="n">{{ n }} ⭐</option>
                                </select>
                                <button @click="submitReview"
                                    class="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all">ส่งรีวิว</button>
                            </div>
                        </div>

                        <div v-if="reviews.length === 0" class="text-center py-10 text-slate-400">
                            ยังไม่มีรีวิวสำหรับคอร์สนี้</div>
                        <div v-else class="space-y-6">
                            <div v-for="r in reviews" :key="r.id"
                                class="group/review flex gap-4 pb-6 border-b border-slate-50 last:border-0 relative">
                                <img :src="r.user.image ? `${BASE_URL}${r.user.image}` : '/avatar-default.png'"
                                    class="w-10 h-10 rounded-full object-cover shrink-0 bg-slate-100" />
                                <div class="flex-1">
                                    <div class="flex items-center justify-between mb-1">
                                        <div class="flex items-center gap-3">
                                            <span class="font-bold text-sm">{{ r.user.name || r.user.username }}</span>
                                            <span class="text-yellow-500 text-xs font-bold">⭐ {{ r.rating }}</span>
                                        </div>
                                        <button v-if="auth.user && r.userId === auth.user.id"
                                            @click="deleteReview(r.id)"
                                            class="opacity-0 group-hover/review:opacity-100 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                                            🗑️
                                        </button>
                                    </div>
                                    <p class="text-slate-600 text-sm leading-relaxed">{{ r.comment }}</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <div class="lg:col-span-4">
                    <div class="sticky top-24 space-y-6">
                        <div class="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm">
                            <div class="mb-6">
                                <span class="text-slate-400 text-sm block mb-1">ราคาคอร์สเรียน</span>
                                <div class="flex items-baseline gap-1">
                                    <span class="text-4xl font-black text-slate-900">{{ course.price }}</span>
                                    <span class="text-slate-500 font-medium">บาท</span>
                                </div>
                            </div>
                            <button v-if="!isEnrolled" @click="buyCourse"
                                class="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-blue-100">สมัครเรียนเลย</button>
                            <div v-else
                                class="w-full bg-emerald-50 text-emerald-600 py-4 rounded-2xl font-bold text-center border border-emerald-100">
                                คุณลงเรียนแล้ว</div>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    </div>
</template>

<style scoped>
.animate-spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}
</style>