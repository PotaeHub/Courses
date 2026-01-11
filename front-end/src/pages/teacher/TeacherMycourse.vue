<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, Plus, SlidersHorizontal } from 'lucide-vue-next'
import CourseTableRow from '../../components/Teacher/CourseTableRow.vue'
import api from '../../service/api'
import CreateCourseModal from '../../components/Teacher/CreateCourseModal.vue'
import EditCourseModal from '../../components/Teacher/EditCourseModal.vue'
import DeleteConfirmModal from '../../components/Teacher/DeleteConfirmModal.vue'

const searchQuery = ref('')
const activeTab = ref('All')
const showCreate = ref(false)
const categories = ref([]);
const courses = ref([]);
const loading = ref(true)
const selectedCourse = ref(null)
const showEdit = ref(false)
const showDeleteModal = ref(false)
const courseToDelete = ref(null)

const openDeleteModal = (course) => {
    courseToDelete.value = course
    showDeleteModal.value = true
}
const onEdit = (course) => {
    selectedCourse.value = course
    showEdit.value = true
}
const confirmDelete = async () => {
    loading.value = true
    try {
        await api.delete(`/teacher/course/${courseToDelete.value.id}`)
        fetchCourses();
        showDeleteModal.value = false
    } catch (err) {
        alert('ลบไม่สำเร็จ');
    } finally {
        loading.value = false
    }
}
const fetchCategories = async () => {
    try {
        const res = await api.get('/teacher/categories')
        categories.value = res.data.data
    } catch (err) {
        console.error(err)
    }
}
const fetchCourses = async () => {
    try {
        const res = await api.get('/teacher/courses')
        courses.value = res.data.data
    } catch (err) {
        console.error(err)
    } finally {
        loading.value = false
    }
}
onMounted(() => {
    fetchCourses(),
        fetchCategories()
})
const filteredCourses = computed(() => {
    return courses.value.filter(c => {
        const matchSearch =
            c.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ?? true

        const matchCategory =
            activeTab.value === 'All' ||
            c.category === activeTab.value

        return matchSearch && matchCategory
    })
})
</script>

<template>
    <div class="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <h1 class="text-3xl font-black text-slate-900 tracking-tighter">My Courses</h1>
                <p class="text-slate-500 font-medium">จัดการเนื้อหาและดูภาพรวมคอร์สเรียนของคุณ</p>
            </div>
            <button @click="showCreate = true"
                class="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-[1.5rem] font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-1 transition-all">
                <Plus :size="20" stroke-width="3" />
                New Course
            </button>
        </div>

        <div class="flex flex-col lg:flex-row justify-between items-center gap-4
           bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">

            <!-- CATEGORY WRAPPER -->
            <div class="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl
               overflow-x-auto w-full lg:w-auto
               scrollbar-hide">

                <!-- ALL -->
                <button @click="activeTab = 'All'" class="
                relative px-6 py-2.5 rounded-xl text-xs font-black
                uppercase tracking-widest whitespace-nowrap
                transition-all duration-300 ease-out
                hover:-translate-y-0.5 hover:shadow-md
            " :class="activeTab === 'All'
                ? 'bg-white text-blue-600 shadow-lg ring-2 ring-blue-100'
                : 'text-slate-400 hover:text-slate-600'">
                    All
                </button>

                <!-- CATEGORY -->
                <button v-for="category in categories" :key="category.id" @click="activeTab = category.name" class="
                relative px-6 py-2.5 rounded-xl text-xs font-black
                uppercase tracking-widest whitespace-nowrap
                transition-all duration-300 ease-out
                hover:-translate-y-0.5 hover:shadow-md
            " :class="activeTab === category.name
                ? 'bg-white text-blue-600 shadow-lg ring-2 ring-blue-100'
                : 'text-slate-400 hover:text-slate-600'">
                    {{ category.name }}
                </button>
            </div>

            <!-- SEARCH -->
            <div class="relative w-full lg:w-96">
                <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" :size="18" />
                <input v-model="searchQuery" type="text" placeholder="Search your courses..." class="w-full pl-12 pr-6 py-3.5 bg-slate-50 border-none rounded-2xl
                   outline-none focus:ring-2 focus:ring-blue-100
                   font-bold text-sm transition-all" />
            </div>
        </div>


        <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead class="bg-slate-50/50 border-b border-slate-50">
                        <tr>
                            <th class="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                Course Information</th>
                            <th class="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                Student Stats</th>
                            <th class="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                Earnings</th>
                            <th
                                class="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">
                                Status</th>
                            <th
                                class="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">
                                Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">
                        <CourseTableRow v-for="course in filteredCourses" :key="course.id" :course="course"
                            @edit="onEdit" @delete="openDeleteModal" />
                    </tbody>
                </table>
            </div>

            <div v-if="filteredCourses.length === 0" class="py-24 text-center">
                <div
                    class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-50 text-slate-200 mb-4">
                    <SlidersHorizontal :size="40" />
                </div>
                <h3 class="text-lg font-black text-slate-400 uppercase tracking-widest">No Courses Found</h3>
                <p class="text-slate-400 text-sm font-medium">ลองเปลี่ยนคำค้นหาหรือตัวกรองดูนะครับ</p>
            </div>
        </div>
    </div>
    <CreateCourseModal v-if="showCreate" @close="showCreate = false" @created="fetchCourses()" />
    <EditCourseModal v-if="showEdit && selectedCourse" :course="selectedCourse" @close="showEdit = false"
        @updated="fetchCourses()" :categories="categories" />
    <DeleteConfirmModal v-if="showDeleteModal" :courseTitle="courseToDelete?.title" :loading="loading"
        @confirm="confirmDelete" @close="showDeleteModal = false" />
</template>