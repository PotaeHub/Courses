<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../../service/api.js'
import TeacherStudentHeader from '../../components/Teacher/TeacherStudentHeader.vue'
import StudentInfoCard from '../../components/Teacher/StudentInfoCard.vue'
import { Users } from 'lucide-vue-next'

const searchQuery = ref('')
const studentList = ref([])
const loading = ref(false)

const fetchStudents = async () => {
    try {
        loading.value = true
        const res = await api.get('/teacher/student/enrollment')

        // ✅ backend ส่ง students มาแล้ว
        studentList.value = res.data.students || []
    } catch (err) {
        console.error(err)
        studentList.value = []
    } finally {
        loading.value = false
    }
}

const filteredStudents = computed(() => {
    return studentList.value.filter(s =>
        s.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        s.courseName?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
})

onMounted(fetchStudents)
</script>

<template>
    <div class="min-h-screen bg-[#FDFDFD] p-8 md:p-12 space-y-12">

    
        <TeacherStudentHeader :totalStudents="studentList.length" @update:search="searchQuery = $event" />

        <div v-if="loading" class="text-center py-16 text-slate-400">
            Loading students...
        </div>

    
        <div v-else-if="filteredStudents.length"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <StudentInfoCard v-for="student in filteredStudents" :key="`${student.id}-${student.courseName}`"
                :student="student" />
        </div>

        <div v-else class="py-32 flex flex-col items-center text-slate-400">
            <Users :size="48" />
            <p class="mt-4">ไม่พบข้อมูลนักเรียน</p>
        </div>

    </div>
</template>
