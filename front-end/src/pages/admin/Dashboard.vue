<script setup>
import DashboardStats from '../../components/Admin/DashboardStats.vue'
import RevenueChart from '../../components/Admin/RevenueChart.vue'
import { ref } from 'vue'
const loading = ref(false);
</script>


<template>
    <div v-if="loading" class="h-[360px] flex items-center justify-center text-gray-400">
        Loading chart...
    </div>
    <div class="space-y-10">
        <!-- 🔢 Stat Cards -->
        <DashboardStats />

        <!-- 📊 Revenue Chart -->
        <RevenueChart />
    </div>
</template>
