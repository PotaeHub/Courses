<script setup>
import { ref, computed } from 'vue'
import TeacherStudentHeader from '../../components/Teacher/TeacherStudentHeader.vue'
import StudentInfoCard from '../../components/Teacher/StudentInfoCard.vue'

const searchQuery = ref('')

const studentList = ref([
    { id: 1, name: 'สมชาย รักเรียน', email: 'somchai.dev@gmail.com', courseName: 'Vue 3 Advanced Mastery', progress: 85, joinedDate: '01 Jan 2026' },
    { id: 2, name: 'Jane Wilson', email: 'jane.w@outlook.com', courseName: 'UI/UX Design for SaaS', progress: 100, joinedDate: '28 Dec 2025' },
    { id: 3, name: 'นที สดใส', email: 'natee.s@company.com', courseName: 'Node.js Backend Essentials', progress: 42, joinedDate: '15 Dec 2025' },
    { id: 4, name: 'Mark Zuckerberg', email: 'mark@meta.com', courseName: 'Vue 3 Advanced Mastery', progress: 10, joinedDate: '02 Jan 2026' },
    { id: 5, name: 'Lisa Manoban', email: 'lisa.black@yg.com', courseName: 'UI/UX Design for SaaS', progress: 65, joinedDate: '20 Dec 2025' },
])

const filteredStudents = computed(() => {
    return studentList.value.filter(s =>
        s.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        s.courseName.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
})
</script>

<template>
    <div class="min-h-screen bg-[#FDFDFD] p-8 md:p-12 space-y-12">
        <TeacherStudentHeader :totalStudents="studentList.length" @update:search="searchQuery = $event" />

        <div v-if="filteredStudents.length > 0"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <StudentInfoCard v-for="student in filteredStudents" :key="student.id" :student="student" />
        </div>

        <div v-else class="py-32 flex flex-col items-center justify-center text-center space-y-4">
            <div class="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200">
                <Users :size="48" />
            </div>
            <h2 class="text-xl font-black text-slate-400 uppercase tracking-widest">No Students Found</h2>
            <p class="text-slate-400 font-medium">ลองปรับคำค้นหาของคุณใหม่อีกครั้งนะครับ</p>
        </div>
    </div>
</template>