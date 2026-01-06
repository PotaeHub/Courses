<script setup>
import { ref, onMounted } from 'vue'
import api from '../../service/api.js'
import StatCard from './StatCard.vue'

// Icons
import {
    Users,
    BookOpen,
    Layers,
    UserCheck,
    DollarSign
} from 'lucide-vue-next'

const loading = ref(true)

const stats = ref({
    userCount: 0,
    courseCount: 0,
    categoryCount: 0,
    enrollmentCount: 0,
    totalRevenue: 0
})

onMounted(async () => {
    try {
        const res = await api.get('/admin/dashboard')
        stats.value = res.data.data
    } catch (err) {
        console.error('DashboardStats error:', err)
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <div>
        <!-- Loading Skeleton -->
        <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div v-for="i in 5" :key="i" class="h-[170px] rounded-[2.5rem] bg-slate-100 animate-pulse" />
        </div>

        <!-- Stats -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <StatCard title="Users" :value="stats.userCount" :icon="Users" color="blue" />

            <StatCard title="Courses" :value="stats.courseCount" :icon="BookOpen" color="purple" />

            <StatCard title="Categories" :value="stats.categoryCount" :icon="Layers" color="orange" />

            <StatCard title="Enrollments" :value="stats.enrollmentCount" :icon="UserCheck" color="emerald" />

            <StatCard title="Revenue" :value="stats.totalRevenue" suffix=" ฿" :icon="DollarSign" color="emerald" />
        </div>
    </div>
</template>
