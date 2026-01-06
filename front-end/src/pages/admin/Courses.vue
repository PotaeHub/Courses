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
    <div class="p-8 max-w-7xl mx-auto space-y-8">

        <!-- HEADER -->
        <div class="flex justify-between items-end">
            <div>
                <h1 class="text-4xl font-black text-gray-900 tracking-tight">
                    Courses
                </h1>
                <p class="text-gray-500 mt-1 font-medium">
                    จัดการเนื้อหา ราคา และสถานะการมองเห็นของบทเรียน
                </p>
            </div>

            <button @click="showCreate = true" class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl
               font-bold shadow-lg shadow-blue-200 transition-all active:scale-95
               flex items-center gap-2">
                <span class="text-xl">+</span>
                <span>สร้างคอร์สใหม่</span>
            </button>
        </div>

        <!-- STATS -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div v-for="stat in stats" :key="stat.label" :class="stat.bg"
                class="p-5 rounded-[24px] border border-white shadow-sm">
                <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                    {{ stat.label }}
                </p>
                <p class="text-2xl font-black" :class="stat.color">
                    {{ stat.value }}
                </p>
            </div>
        </div>

        <!-- FILTER BAR -->
        <div class="flex flex-col md:flex-row gap-4 bg-white p-3 rounded-2xl
             shadow-sm border border-gray-100">

            <input v-model="search" type="text" placeholder="ค้นหาชื่อคอร์ส หรือชื่อผู้สอน..." class="flex-1 px-4 py-3 bg-gray-50 rounded-xl
               outline-none text-sm font-medium focus:ring-2 focus:ring-blue-500" />

            <!-- CATEGORY -->
            <select v-model="selectedCategory" class="px-4 py-3 bg-gray-50 rounded-xl
               text-sm font-bold text-gray-600 outline-none">
                <option value="">ทุกหมวดหมู่</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                    {{ cat.icon }} {{ cat.name }}
                </option>
            </select>

            <!-- STATUS -->
            <select v-model="selectedStatus" class="px-4 py-3 bg-gray-50 rounded-xl
               text-sm font-bold text-gray-600 outline-none">
                <option value="">ทุกสถานะ</option>
                <option value="GENERAL">General</option>
                <option value="POPULAR">Popular</option>
                <option value="PACKAGE">Package</option>
            </select>
        </div>

        <!-- TABLE -->
        <CourseTable :course="filteredCourses" @edit="openEditModal" @delete="openDelete" @view="openView" />
        <CreateCourseModal v-if="showCreate" @close="showCreate = false" @created="fetchCourse" />
        <EditCourseModal v-if="showEdit" :course="selectedCourse" @close="showEdit = false" @updated="fetchCourse" />
        <DeleteCourseModal v-if="showDelete" :course="deletingCourse" @close="closeDelete" @deleted="fetchCourse" />
        <ViewCourseModal v-if="showView" :course="selectedCourse" @close="closeView" />
    </div>
</template>
