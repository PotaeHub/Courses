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
const route = useRouter()
const fetchOrders = async () => {
    if (loading.value) return
    loading.value = true
    try {
        const res = await api.get('/student/mycourses', {
            params: { page: page.value }
        })
        orders.value = res.data.orders
        totalPages.value = res.data.totalPages
    } catch (error) {
        console.error("Error fetching orders:", error)
    } finally {
        loading.value = false
    }
}

const filteredOrders = computed(() => {
    if (!keyword.value) return orders.value
    return orders.value.filter(o =>
        o.course?.title?.toLowerCase().includes(keyword.value.toLowerCase())
    )
})
const goHome = () => route.push('/')
onMounted(fetchOrders)
</script>

<template>
    <div class="min-h-screen bg-gray-50/50 py-10">
        <div class="max-w-6xl mx-auto px-6 space-y-8">
            <button @click="goHome"
                class="group flex items-center text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                กลับไปหน้าหลัก
            </button>
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">
                        คอร์สของฉัน
                    </h1>
                    <p class="text-gray-500 mt-1">จัดการและเข้าเรียนคอร์สที่คุณชำระเงินแล้ว</p>
                </div>

                <div class="relative w-full md:w-80">
                    <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                    <input v-model="keyword" type="text" placeholder="ค้นหาชื่อคอร์สของคุณ..."
                        class="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" />
                </div>
            </div>

            <hr class="border-gray-200">

            <div v-if="loading && orders.length === 0" class="grid grid-cols-1 gap-6">
                <div v-for="i in 3" :key="i" class="h-32 w-full bg-gray-200 animate-pulse rounded-2xl"></div>
            </div>

            <div v-else-if="filteredOrders.length > 0" class="grid grid-cols-1 gap-6">
                <OrderCard v-for="order in filteredOrders" :key="order.id" :order="order"
                    class="hover:shadow-md transition-shadow duration-300" />
            </div>

            <div v-else class="flex flex-col items-center justify-center py-20 text-center">
                <div class="bg-gray-100 p-6 rounded-full mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900">ไม่พบคอร์สเรียน</h3>
                <p class="text-gray-500 max-w-xs mx-auto">
                    {{ keyword ? `ไม่พบผลลัพธ์สำหรับ "${keyword}"` : 'คุณยังไม่มีคอร์สเรียนในขณะนี้' }}
                </p>
                <button v-if="!keyword" @click="$router.push('/courses')"
                    class="mt-6 text-indigo-600 font-semibold hover:text-indigo-500">
                    ไปเลือกดูคอร์สเรียนทั้งหมด →
                </button>
            </div>
        </div>
    </div>
</template>