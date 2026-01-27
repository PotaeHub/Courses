<script setup>
import DashboardStats from '../../components/Admin/DashboardStats.vue'
import RevenueChart from '../../components/Admin/RevenueChart.vue'
import { ref } from 'vue'
const loading = ref(false);
</script>


<template>
    <div v-if="loading" class="h-[400px] flex flex-col items-center justify-center space-y-4">
        <div class="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
        <p class="text-sm font-medium text-gray-400 tracking-wide">Preparing dashboard...</p>
    </div>

    <div v-else class="max-w-7xl mx-auto p-6 space-y-12 animate-in fade-in duration-700">
        
        <section>
            <DashboardStats />
        </section>

        <section class="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-800">Revenue Overview</h3>
                <p class="text-sm text-gray-500">Monthly performance insights</p>
            </div>
            <RevenueChart />
        </section>

    </div>
</template>
