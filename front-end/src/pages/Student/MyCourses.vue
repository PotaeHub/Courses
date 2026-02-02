<script setup>
import { ref, computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import api from "@/service/api"
import { ChevronLeft, PlayCircle, Clock, BookOpen } from "lucide-vue-next" // แนะนำให้ลง lucide-vue-next หรือใช้ icon อื่นๆ

const router = useRouter()
const courses = ref([])
const loading = ref(true)
const activeTab = ref("all")
const BASE_URL = import.meta.env.VITE_BACKEND_URL

const fetchCourses = async () => {
    loading.value = true
    try {
        const res = await api.get("/student/course")
        courses.value = res.data
    } catch (error) {
        console.error("Failed to fetch courses", error)
    } finally {
        loading.value = false
    }
}

const filteredCourses = computed(() => {
    if (activeTab.value === "all") return courses.value
    return courses.value.filter(c => c.status === activeTab.value.toUpperCase())
})

const goCourse = (id) => router.push(`/student/course/${id}`)
const goHome = () => router.push('/')

onMounted(fetchCourses)
</script>

<template>
    <div class="min-h-screen bg-gray-50/50 p-6 md:p-10">
        <div class="max-w-6xl mx-auto space-y-8">

            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <button @click="goHome"
                        class="group flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors mb-2">
                        <ChevronLeft class="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        กลับหน้าหลัก
                    </button>
                    <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight">คอร์สของฉัน</h1>
                    <p class="text-gray-500 mt-1">ยินดีต้อนรับกลับมา! มาเรียนต่อกันเถอะ</p>
                </div>

                <div class="inline-flex bg-gray-200/50 p-1 rounded-2xl backdrop-blur-sm">
                    <button v-for="t in [
                        { id: 'all', label: 'ทั้งหมด' },
                        { id: 'pending', label: 'รออนุมัติ' },
                        { id: 'approved', label: 'เรียนได้' }
                    ]" :key="t.id" @click="activeTab = t.id"
                        class="px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200" :class="activeTab === t.id
                            ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5'
                            : 'text-gray-600 hover:text-gray-900'">
                        {{ t.label }}
                    </button>
                </div>
            </div>

            <hr class="border-gray-200" />

            <div v-if="loading" class="grid md:grid-cols-3 gap-8">
                <div v-for="i in 3" :key="i"
                    class="animate-pulse bg-white rounded-3xl h-80 shadow-sm border border-gray-100"></div>
            </div>

            <div v-else-if="filteredCourses.length === 0"
                class="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-300">
                <div class="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen class="text-gray-400" />
                </div>
                <h3 class="text-lg font-medium text-gray-900">ไม่พบคอร์สในหมวดนี้</h3>
                <p class="text-gray-500">คุณยังไม่ได้สมัครเรียนคอร์สในกลุ่มนี้</p>
            </div>

            <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <div v-for="c in filteredCourses" :key="c.courseId"
                    class="group bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">

                    <div class="relative aspect-[16/10] overflow-hidden">
                        <img :src="BASE_URL + c.image"
                            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div class="absolute top-4 right-4">
                            <span
                                class="backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm"
                                :class="c.status === 'APPROVED'
                                    ? 'bg-green-500/80 text-white'
                                    : 'bg-amber-500/80 text-white'">
                                {{ c.status === 'APPROVED' ? 'Active' : 'Pending' }}
                            </span>
                        </div>
                    </div>

                    <div class="p-6 flex flex-col flex-grow">
                        <h3
                            class="font-bold text-xl text-gray-800 line-clamp-1 mb-2 group-hover:text-blue-600 transition-colors">
                            {{ c.title }}
                        </h3>

                        <div class="flex items-center text-gray-500 text-sm mb-6">
                            <Clock class="w-4 h-4 mr-1" />
                            <span>อัปเดตล่าสุด: {{ new Date().toLocaleDateString('th-TH') }}</span>
                        </div>

                        <div class="mt-auto pt-4 border-t border-gray-50">
                            <button v-if="c.canAccess" @click="goCourse(c.courseId)"
                                class="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-100">
                                <PlayCircle class="w-5 h-5" />
                                เข้าสู่บทเรียน
                            </button>

                            <div v-else
                                class="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-400 py-3.5 rounded-2xl font-medium cursor-not-allowed italic">
                                <Clock class="w-4 h-4" />
                                รอการตรวจสอบ...
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
