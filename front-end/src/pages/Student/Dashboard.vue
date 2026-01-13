<script setup>
import { ref, onMounted } from 'vue'
// import api from '@/services/api.js'
import {
    BookOpen,
    CheckCircle,
    Percent,
    Wallet
} from 'lucide-vue-next'
import CourseCard from '../../components/Student/CourseCard.vue'

const loading = ref(true)

const stats = ref({
    enrolled: 0,
    completed: 0,
    lessonProgress: 0,
    totalPaid: 0
})

const recentCourses = ref([])

onMounted(async () => {
    try {
        const res = await api.get('/studetn/dashboard')
        stats.value = res.data.stats
        recentCourses.value = res.data.recentCourses
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <div class="p-6 animate-fade-in">
        <!-- Header -->
        <h1 class="text-2xl font-bold mb-6">🎓 Student Dashboard</h1>

        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatCard title="Enrolled Courses" :value="stats.enrolled">
                <BookOpen />
            </StatCard>

            <StatCard title="Completed" :value="stats.completed">
                <CheckCircle />
            </StatCard>

            <StatCard title="Lesson Progress" :value="stats.lessonProgress + '%'">
                <Percent />
            </StatCard>

            <StatCard title="Total Paid" :value="stats.totalPaid + ' ฿'">
                <Wallet />
            </StatCard>
        </div>

        <!-- Recent Courses -->
        <div>
            <h2 class="text-xl font-semibold mb-4">📚 Recent Courses</h2>

            <div v-if="recentCourses.length" class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <CourseCard v-for="c in recentCourses" :key="c.courseId" :course="c" />
            </div>

            <p v-else class="text-gray-400">No courses yet</p>
        </div>
    </div>
</template>

<style>
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in {
    animation: fadeIn 0.4s ease;
}
</style>
