<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/service/api'
import OrderCard from '../../components/Student/OrderCard.vue'
import { useRouter } from 'vue-router'

const orders = ref([])
const keyword = ref('')
const loading = ref(false)
const page = ref(1)
const totalPages = ref(1)
const router = useRouter()
const category = ref([])
// สำหรับระบบ Tab (ถ้าต้องการกรองตามสถานะเพิ่มในอนาคต)
const activeTab = ref('all')

const fetchOrders = async () => {
    if (loading.value) return
    loading.value = true
    try {
        const res = await api.get('/student/mycourses', {
            params: { page: page.value }
        })
        const ress = await api.get("/student/categories")
        console.log(ress.data)
        category.value = ress.data
        orders.value = res.data.orders
        totalPages.value = res.data.totalPages
    } catch (error) {
        console.error("Error fetching orders:", error)
    } finally {
        loading.value = false
    }
}

// Stats Calculation
const stats = computed(() => {
    return {
        total: orders.value.length,
        inProgress: orders.value.filter(o => (o.progress || 0) < 100 && (o.progress || 0) > 0).length,
        completed: orders.value.filter(o => (o.progress || 0) === 100).length
    }
})

const filteredOrders = computed(() => {
    let result = orders.value
    if (keyword.value) {
        result = result.filter(o =>
            o.course?.title?.toLowerCase().includes(keyword.value.toLowerCase())
        )
    }
    // เพิ่ม Logic การกรองตาม Tab (ตัวอย่าง)
    if (activeTab.value === 'ongoing') result = result.filter(o => (o.progress || 0) < 100)
    if (activeTab.value === 'completed') result = result.filter(o => (o.progress || 0) === 100)

    return result
})

const goHome = () => router.push('/')
onMounted(fetchOrders)
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-10 px-4 md:px-10">
        <div class="max-w-7xl mx-auto space-y-10">

            <!-- Header -->
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <button @click="goHome"
                    class="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition">
                    <span class="text-xl">←</span> กลับหน้าหลัก
                </button>

                <div class="relative w-full md:w-96">
                    <input v-model="keyword" type="text" placeholder="ค้นหาคอร์สที่ชำระเงินแล้ว..."
                        class="w-full pl-11 pr-4 py-3 rounded-2xl bg-white shadow-sm border border-gray-200 focus:ring-4 focus:ring-indigo-100 focus:outline-none" />
                    <span class="absolute left-4 top-3.5 text-gray-400">🔍</span>
                </div>
            </div>

            <!-- Title -->
            <div>
                <h1 class="text-2xl md:text-3xl font-bold text-gray-800">คอร์สที่ชำระเงินแล้ว</h1>
                <p class="text-gray-500 text-sm mt-1">รายการคอร์สทั้งหมดที่คุณสามารถเข้าเรียนได้</p>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="stat-card">📚 คอร์สทั้งหมด <span>{{ stats.total }}</span></div>
            </div>

            <!-- Tabs -->
            <div class="flex gap-3 border-b">
                <button v-for="tab in ['all', 'ongoing', 'completed']" :key="tab" @click="activeTab = tab"
                    class="px-4 py-2 rounded-t-xl text-sm font-semibold"
                    :class="activeTab === tab ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-800'">
                    {{ tab === 'all' || 'ทั้งหมด' }}
                </button>
            </div>

            <!-- Loading -->
            <div v-if="loading && orders.length === 0" class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div v-for="i in 6" :key="i" class="h-48 bg-gray-200 animate-pulse rounded-2xl"></div>
            </div>

            <!-- Orders -->
            <div v-else-if="filteredOrders.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <OrderCard v-for="order in filteredOrders" :key="order.id" :order="order" />
            </div>

            <!-- Empty -->
            <div v-else class="bg-white rounded-3xl p-16 text-center shadow-sm">
                <p class="text-5xl mb-4">📭</p>
                <p class="text-gray-500">ยังไม่มีคอร์สที่ชำระเงิน</p>
            </div>

        </div>
    </div>
</template>

<style scoped>
@import "tailwindcss";

.stat-card {
    @apply bg-white rounded-2xl shadow-sm p-6 flex justify-between items-center text-gray-700 font-semibold;
}

.stat-card span {
    @apply text-xl text-indigo-600 font-bold;
}
</style>

<!-- script setup ใช้ logic เดิมทั้งหมด ไม่ต้องแก้ -->
