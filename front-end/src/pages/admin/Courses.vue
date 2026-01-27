<script setup>
import { onMounted, ref, computed } from 'vue'
import CourseTable from '../../components/Admin/CourseTable.vue'
import api from "../../service/api.js"
import CreateCourseModal from '../../components/Admin/CreateCourseModal.vue'
import EditCourseModal from '../../components/Admin/EditCourseModal.vue'
import DeleteCourseModal from '../../components/Admin/DeleteCourseModal.vue'
import ViewCourseModal from '../../components/Admin/ViewCourseModal.vue'

const courses = ref([])
const categories = ref([])
const showCreate = ref(false);
const search = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')
const showEdit = ref(false);
const selectedCourse = ref(null)
const showDelete = ref(false)
const deletingCourse = ref(null)
const showView = ref(false)

const openView = (course) => {
    selectedCourse.value = course
    showView.value = true
}

const closeView = () => {
    showView.value = false
    selectedCourse.value = null
}
const openDelete = (course) => {
    deletingCourse.value = course
    showDelete.value = true
}
const closeDelete = () => {
    showDelete.value = false
    deletingCourse.value = null
}
const openEditModal = (course) => {
    selectedCourse.value = course
    showEdit.value = true
}
const fetchCourse = async () => {
    const res = await api.get("/admin/courses")
    // console.log(res.data.courses.type)
    courses.value = res.data.courses
}

const fetchCategory = async () => {
    const res = await api.get("/admin/category")
    categories.value = res.data.category
}

onMounted(() => {
    fetchCourse()
    fetchCategory()
})

const filteredCourses = computed(() => {
    return courses.value.filter(course => {
        const matchSearch =
            (course.title ?? '').toLowerCase().includes(search.value.toLowerCase()) ||
            (course.teacher?.name ?? '').toLowerCase().includes(search.value.toLowerCase())

        const matchCategory =
            !selectedCategory.value ||
            course.categoryId === Number(selectedCategory.value)

        const matchStatus =
            !selectedStatus.value ||
            course.type === selectedStatus.value

        return matchSearch && matchCategory && matchStatus
    })
})

// -------------------- STATS (dynamic) --------------------
const stats = computed(() => [
    {
        label: 'Total Courses',
        value: courses.value.length,
        color: 'text-blue-600',
        bg: 'bg-blue-50'
    },
    {
        label: 'General',
        value: courses.value.filter(c => c.type === 'GENERAL').length,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50'
    },
    {
        label: 'Popular',
        value: courses.value.filter(c => c.type === 'POPULAR').length,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50'
    },
    {
        label: 'Package',
        value: courses.value.filter(c => c.type === 'PACKAGE').length,
        color: 'text-amber-600',
        bg: 'bg-amber-50'
    }
])

</script>

<template>
    <div class="p-8 max-w-7xl mx-auto space-y-10 antialiased">

        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 class="text-3xl font-semibold text-gray-900 tracking-tight">
                    Courses
                </h1>
                <p class="text-sm text-gray-500 mt-1">
                    จัดการเนื้อหา ราคา และสถานะการมองเห็นของบทเรียนทั้งหมด
                </p>
            </div>

            <button @click="showCreate = true" 
                class="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl
                       font-medium transition-all active:scale-95
                       flex items-center gap-2 shadow-sm text-sm">
                <span class="text-lg">+</span>
                <span>สร้างคอร์สใหม่</span>
            </button>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div v-for="stat in stats" :key="stat.label"
                class="p-6 rounded-2xl bg-white border border-gray-100 transition-hover hover:border-blue-100">
                <p class="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    {{ stat.label }}
                </p>
                <p class="text-2xl font-bold" :class="stat.color">
                    {{ stat.value }}
                </p>
            </div>
        </div>

        <div class="flex flex-col md:flex-row gap-3 bg-gray-50/50 p-2 rounded-2xl border border-gray-100">
            <div class="relative flex-1">
                <input v-model="search" type="text" placeholder="ค้นหาชื่อคอร์ส หรือชื่อผู้สอน..." 
                    class="w-full px-5 py-3 bg-white border border-transparent focus:border-gray-200 rounded-xl
                           outline-none text-sm transition-all placeholder:text-gray-400 shadow-sm" />
            </div>

            <div class="flex gap-2">
                <select v-model="selectedCategory" 
                    class="px-4 py-3 bg-white border border-transparent focus:border-gray-200 rounded-xl
                           text-sm font-medium text-gray-600 outline-none shadow-sm cursor-pointer">
                    <option value="">ทุกหมวดหมู่</option>
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                        {{ cat.icon }} {{ cat.name }}
                    </option>
                </select>

                <select v-model="selectedStatus" 
                    class="px-4 py-3 bg-white border border-transparent focus:border-gray-200 rounded-xl
                           text-sm font-medium text-gray-600 outline-none shadow-sm cursor-pointer">
                    <option value="">ทุกสถานะ</option>
                    <option value="GENERAL">General</option>
                    <option value="POPULAR">Popular</option>
                    <option value="PACKAGE">Package</option>
                </select>
            </div>
        </div>

        <div class="overflow-hidden">
            <CourseTable :course="filteredCourses" @edit="openEditModal" @delete="openDelete" @view="openView" />
        </div>

        <CreateCourseModal v-if="showCreate" @close="showCreate = false" @created="fetchCourse" />
        <EditCourseModal v-if="showEdit" :course="selectedCourse" @close="showEdit = false" @updated="fetchCourse" />
        <DeleteCourseModal v-if="showDelete" :course="deletingCourse" @close="closeDelete" @deleted="fetchCourse" />
        <ViewCourseModal v-if="showView" :course="selectedCourse" @close="closeView" />
    </div>
</template>
