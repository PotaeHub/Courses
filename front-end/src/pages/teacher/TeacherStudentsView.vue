<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../../service/api.js'  // axios instance ของคุณ
import TeacherStudentHeader from '../../components/Teacher/TeacherStudentHeader.vue'
import StudentInfoCard from '../../components/Teacher/StudentInfoCard.vue'
import { Users } from 'lucide-vue-next'

const searchQuery = ref('')
const studentList = ref([])
const loading = ref(false)

// Fetch students from backend
const fetchStudents = async () => {
    try {
        loading.value = true
        const res = await api.get('/teacher/student/enrollment')
        studentList.value = res.data
    } catch (err) {
        console.error(err)
        studentList.value = []
    } finally {
        loading.value = false
    }
}

// คัดกรองนักเรียนตาม searchQuery
const filteredStudents = computed(() => {
    return studentList.value.filter(s =>
        s.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        s.courseName.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
})

onMounted(fetchStudents)
</script>

<template>
    <div class="min-h-screen bg-[#FDFDFD] p-8 md:p-12 space-y-12">

        <!-- Header -->
        <TeacherStudentHeader :totalStudents="studentList.length" @update:search="searchQuery = $event" />

        <!-- Student Cards -->
        <div v-if="loading" class="text-center py-16 text-slate-400">Loading students...</div>

        <div v-else-if="filteredStudents.length > 0"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <StudentInfoCard v-for="student in filteredStudents" :key="student.id" :student="student" />
        </div>

        <!-- Empty State -->
        <div v-else class="py-32 flex flex-col items-center justify-center text-center space-y-4">
            <div class="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200">
                <Users :size="48" />
            </div>
            <h2 class="text-xl font-black text-slate-400 uppercase tracking-widest">ไม่พบข้อมูลนักเรียน</h2>
            <p class="text-slate-400 font-medium">ลองปรับคำค้นหาของคุณใหม่อีกครั้งนะครับ</p>
        </div>

    </div>
</template>
