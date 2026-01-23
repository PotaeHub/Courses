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
const lessonProgress = ref([])
const reviews = ref([])
const rating = ref(5)
const avgRating = ref(0)
const comment = ref('')


const isLogin = computed(() => !!auth.token)

const totalLessons = computed(() =>
    course.value?.lessons?.length || 0
)

const completedLessons = computed(() =>
    lessonProgress.value.filter(l => l.completed).length
)

const progressPercent = computed(() => {
    if (!totalLessons.value) return 0
    return Math.round(
        (completedLessons.value / totalLessons.value) * 100
    )
})

/* =======================
   API
======================= */
const fetchCourse = async () => {
    const res = await api.get(`/public/courses/${courseId}`)
    course.value = res.data
    loading.value = false
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
    const res = await api.get(
        `/public/courses/${courseId}/reviews`
    )
    console.log(res.data)
    reviews.value = res.data.reviews
    avgRating.value = res.data.average
}


const toggleLesson = (lessonId) => {
    if (!isEnrolled.value) return
    openLessonId.value =
        openLessonId.value === lessonId ? null : lessonId
}

const getLessonProgress = (lessonId) => {
    return lessonProgress.value.find(
        l => l.lessonId === lessonId
    )
}

const markLessonWatched = async (videoId) => {
    if (!isEnrolled.value) return
    try {
        await api.post('/progress/watch', {
            courseId,
            videoId
        })
        await loadLessonProgress()
    } catch (err) {
        console.error('markLessonWatched error', err)
    }
}

const submitReview = async () => {
    if (!isEnrolled.value) return
    try {
        await api.post(`/courses/${courseId}/reviews`, {
            rating: rating.value,
            comment: comment.value
        })
        comment.value = ''
        rating.value = 5
        await loadReviews()
    } catch (err) {
        console.error(err)
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

    if (course.value?.lessons?.length) {
        openLessonId.value = course.value.lessons[0].id
    }
})
</script>

<template>
    <div class="min-h-screen bg-slate-50 pb-20">
  
        <div class="max-w-7xl mx-auto px-6 py-4">
            <button @click="goHome" class="text-slate-500">
                ← กลับหน้าแรก
            </button>
        </div>

        <div class="max-w-7xl mx-auto px-6 grid lg:grid-cols-3 gap-8">

     
            <div class="lg:col-span-2 space-y-6">

                <div v-if="loading" class="bg-white p-12 rounded-3xl text-center">
                    กำลังโหลดคอร์ส...
                </div>

                <div v-else-if="course">


                    <div class="bg-white rounded-3xl p-8">
                        <img :src="`${BASE_URL}${course.image}`" class="w-full aspect-video rounded-xl mb-4" />

                        <h1 class="text-3xl font-bold">
                            {{ course.title }}
                        </h1>

                        <p class="text-slate-500 mt-2">
                            {{ course.description }}
                        </p>

             
                        <div v-if="isEnrolled" class="mt-4">
                            <div class="font-bold mb-1">
                                ความคืบหน้า {{ progressPercent }}%
                            </div>
                            <div class="h-3 bg-slate-200 rounded-full">
                                <div class="h-3 bg-blue-600 rounded-full" :style="{ width: progressPercent + '%' }" />
                            </div>
                        </div>
                    </div>

              
                    <div class="bg-white rounded-3xl p-8">
                        <h2 class="text-xl font-bold mb-6">
                            เนื้อหาการเรียน
                        </h2>

                        <div v-for="(lesson, i) in course.lessons" :key="lesson.id" class="mb-5">
                            <div @click="toggleLesson(lesson.id)"
                                class="p-4 bg-slate-100 rounded-xl flex justify-between cursor-pointer">
                                <span>{{ i + 1 }}. {{ lesson.title }}</span>
                                <span v-if="getLessonProgress(lesson.id)?.completed" class="text-green-600 font-bold">
                                    ✔
                                </span>
                            </div>

                  
                            <div v-if="getLessonProgress(lesson.id)" class="mt-2">
                                <div class="text-xs mb-1">
                                    {{ getLessonProgress(lesson.id).percent }}%
                                </div>
                                <div class="h-2 bg-slate-200 rounded-full">
                                    <div class="h-2 bg-green-500 rounded-full" :style="{
                                        width: getLessonProgress(lesson.id).percent + '%'
                                    }" />
                                </div>
                            </div>

              
                            <div v-if="openLessonId === lesson.id" class="mt-4 border rounded-xl p-4">
                                <div v-if="isEnrolled">
                                    <video v-for="v in lesson.videos" :key="v.id" class="w-full mb-4 rounded-xl"
                                        controls :src="`${BASE_URL}${v.url}`" @ended="markLessonWatched(v.id)" />
                                </div>

                                <div v-else class="text-center text-slate-500 p-6">
                                    🔒 ซื้อคอร์สก่อนจึงจะดูวิดีโอได้
                                </div>
                            </div>
                        </div>
                    </div>

              
                    <div class="bg-white rounded-3xl p-8">
                        <h2 class="text-xl font-bold mb-4">รีวิวคอร์ส</h2>

                        <div v-if="isEnrolled" class="mb-6">
                            <textarea v-model="comment" class="w-full border rounded-xl p-3 mb-3"
                                placeholder="เขียนรีวิว..." />
                            <select v-model="rating" class="border rounded-xl p-2 mb-3">
                                <option v-for="n in 5" :key="n" :value="n">
                                    {{ n }} ⭐
                                </option>
                            </select>
                            <button @click="submitReview" class="bg-blue-600 text-white px-6 py-2 rounded-xl">
                                ส่งรีวิว
                            </button>
                        </div>

                        <div v-for="r in reviews" :key="r.id" class="border-t pt-4 mt-4">
                            <div class="font-bold">
                                {{ r.user.username }} • {{ r.rating }} ⭐
                            </div>
                            <div class="text-slate-600">
                                {{ r.comment }}
                            </div>
                        </div>
                    </div>
                    <div class="bg-white rounded-3xl p-8 mt-6">
                        <h2 class="text-xl font-bold mb-4">
                            รีวิวจากผู้เรียน (⭐ {{ avgRating }})
                        </h2>

                        <div v-if="reviews.length === 0" class="text-slate-400">
                            ยังไม่มีรีวิว
                        </div>

                        <div v-for="r in reviews" :key="r.id" class="border-b py-4">
                            <div class="flex items-center gap-3 mb-1">
                                <img :src="r.user.image
                                    ? `${BASE_URL}${r.user.image}`
                                    : '/avatar-default.png'" class="w-8 h-8 rounded-full" />
                                <span class="font-bold">{{ r.user.name }}</span>
                                <span class="text-yellow-500">⭐ {{ r.rating }}</span>
                            </div>

                            <p class="text-slate-600">
                                {{ r.comment }}
                            </p>
                        </div>

                    </div>

                </div>
            </div>

  
            <div v-if="course" class="bg-white p-8 rounded-3xl sticky top-8">
                <button v-if="!isEnrolled" @click="buyCourse"
                    class="w-full bg-blue-600 text-white py-4 rounded-xl font-bold">
                    ซื้อคอร์ส {{ course.price }} บาท
                </button>

                <button v-else disabled class="w-full bg-green-500 text-white py-4 rounded-xl font-bold">
                    คุณลงเรียนแล้ว
                </button>
            </div>

        </div>
    </div>
</template>
