<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../service/api'
import { useAuthStore } from '../../../Store/auth'

/* =======================
   CORE
======================= */
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const courseId = Number(route.params.id)
const BASE_URL = import.meta.env.VITE_BACKEND_URL

/* =======================
   STATE
======================= */
const course = ref(null)
const loading = ref(true)
const isEnrolled = ref(false)
const openLessonId = ref(null)

/* =======================
   REVIEW
======================= */
const reviewForm = ref({ rating: 5, comment: '' })
const submitting = ref(false)

/* =======================
   COMPUTED
======================= */
const isLogin = computed(() => !!auth.token)
const reviews = computed(() => course.value?.reviews || [])
const avgRating = computed(() => course.value?.avgRating || 0)
const reviewCount = computed(() => reviews.value.length)

const canShowReviewForm = computed(() => {
    if (!isLogin.value) return false
    if (!isEnrolled.value) return false

    return !reviews.value.some(
        r => r.user.id === auth.user?.id
    )
})

/* =======================
   API
======================= */
const fetchCourse = async () => {
    try {
        const res = await api.get(`/public/courses/${courseId}`)
        course.value = res.data
    } finally {
        loading.value = false
    }
}

const checkEnroll = async () => {
    if (!isLogin.value) return
    const res = await api.get(`/enroll/check/${courseId}`)
    isEnrolled.value = res.data.enrolled
}

const buyCourse = async () => {
    if (!isLogin.value) {
        router.push('/login')
        return
    }

    try {
        const res = await api.post('/orders', { courseId })

        // ✅ ใช้ res.data.id ตรง ๆ
        router.push(`/student/payment/${res.data.id}`)
    } catch (err) {
        console.log(err.response?.data?.message)
        alert(err.response?.data?.message || 'ไม่สามารถซื้อคอร์สได้')
    }
}

/* =======================
   METHODS
======================= */
const toggleLesson = (lessonId) => {
    if (!isEnrolled.value) return
    openLessonId.value =
        openLessonId.value === lessonId ? null : lessonId
}

const goHome = () => router.push('/')

const submitReview = async () => {
    try {
        submitting.value = true
        await api.post(
            `/courses/${courseId}/reviews`,
            reviewForm.value
        )
        reviewForm.value = { rating: 5, comment: '' }
        await fetchCourse()
    } finally {
        submitting.value = false
    }
}

/* =======================
   LIFECYCLE
======================= */
onMounted(async () => {
    await fetchCourse()
    await checkEnroll()
})
</script>

<template>
    <div class="min-h-screen bg-slate-50 pb-20 text-slate-800">

        <div class="max-w-7xl mx-auto px-6 py-4">
            <button @click="goHome" class="flex items-center gap-2 text-slate-500 hover:text-blue-600">
                <div class="p-2 bg-white rounded-xl shadow-sm">←</div>
                กลับหน้าแรก
            </button>
        </div>

        <div class="max-w-7xl mx-auto px-6 grid lg:grid-cols-3 gap-8">

            <!-- LEFT -->
            <div class="lg:col-span-2 space-y-6">

                <div v-if="loading" class="bg-white p-12 rounded-3xl text-center">
                    <p class="text-slate-400">กำลังโหลดคอร์ส...</p>
                </div>

                <div v-else-if="course" class="space-y-6">

                    <!-- COURSE INFO -->
                    <div class="bg-white rounded-3xl overflow-hidden shadow-sm">
                        <img :src="`${BASE_URL}${course.image}`" class="w-full aspect-video object-cover" />

                        <div class="p-8 space-y-3">
                            <span class="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg">
                                {{ course.category?.name }}
                            </span>

                            <h1 class="text-3xl font-bold">
                                {{ course.title }}
                            </h1>

                            <p class="text-slate-500">
                                {{ course.description }}
                            </p>

                            <div v-if="avgRating" class="text-yellow-500 font-bold">
                                ⭐ {{ avgRating }} / 5
                                <span class="text-slate-400 text-sm">
                                    ({{ reviewCount }} รีวิว)
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- LESSONS -->
                    <div class="bg-white rounded-3xl p-8 shadow-sm">
                        <h2 class="text-xl font-bold mb-6">เนื้อหาการเรียน</h2>

                        <div v-for="(lesson, i) in course.lessons" :key="lesson.id" class="mb-3">

                            <div @click="toggleLesson(lesson.id)"
                                class="p-4 bg-slate-50 rounded-xl cursor-pointer flex justify-between">
                                <span>{{ i + 1 }}. {{ lesson.title }}</span>
                                <span>{{ openLessonId === lesson.id ? '▲' : '▼' }}</span>
                            </div>

                            <div v-if="openLessonId === lesson.id" class="p-5 bg-white border rounded-b-xl">

                                <div v-if="isEnrolled">
                                    <video v-for="v in lesson.videos" :key="v.id" class="w-full mb-4 rounded-xl"
                                        controls :src="`${BASE_URL}${v.url}`" />
                                </div>

                                <div v-else class="text-center text-slate-400">
                                    ต้องซื้อคอร์สก่อนจึงจะดูบทเรียนได้
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- REVIEWS -->
                    <div class="bg-white rounded-3xl p-8 shadow-sm">
                        <h2 class="text-xl font-bold mb-6">
                            รีวิวจากผู้เรียน ({{ reviewCount }})
                        </h2>

                        <div v-if="canShowReviewForm" class="bg-slate-50 p-6 rounded-2xl mb-8">

                            <p class="font-bold mb-3">เขียนรีวิว</p>

                            <div class="text-2xl text-yellow-400 mb-4 cursor-pointer">
                                <span v-for="i in 5" :key="i" @click="reviewForm.rating = i">
                                    {{ i <= reviewForm.rating ? '★' : '☆' }} </span>
                            </div>

                            <textarea v-model="reviewForm.comment" class="w-full p-4 rounded-xl border"
                                placeholder="ความคิดเห็นของคุณ" />

                            <button @click="submitReview" :disabled="submitting"
                                class="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl">
                                ส่งรีวิว
                            </button>
                        </div>

                        <div v-if="reviews.length === 0" class="text-slate-400 text-center">
                            ยังไม่มีรีวิว
                        </div>

                        <div v-else class="space-y-5">
                            <div v-for="r in reviews" :key="r.id" class="border rounded-2xl p-5">

                                <p class="font-bold">{{ r.user?.name }}</p>
                                <p class="text-yellow-400">
                                    {{ '★'.repeat(r.rating) }}
                                </p>
                                <p class="text-slate-600">{{ r.comment }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- RIGHT -->
            <div v-if="course" class="bg-white p-8 rounded-3xl sticky top-8 shadow-sm">

                <button v-if="!isEnrolled" @click="buyCourse"
                    class="w-full px-6 py-4 bg-blue-600 text-white rounded-xl font-bold">
                    ซื้อคอร์ส {{ course.price }} บาท
                </button>

                <button v-else disabled class="w-full px-6 py-4 bg-green-500 text-white rounded-xl font-bold">
                    คุณลงเรียนแล้ว
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
@import "tailwindcss";
</style>
