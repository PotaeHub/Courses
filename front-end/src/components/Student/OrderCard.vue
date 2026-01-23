<template>
    <div v-if="order?.course" class="bg-white rounded-2xl shadow hover:shadow-lg transition p-5 flex gap-5">
        <img :src="`${BASE_URL}${order.course.image}`" class="w-28 h-28 object-cover rounded-xl" />

        <div class="flex-1 space-y-2">
            <h3 class="text-lg font-bold text-gray-800">
                {{ order.course.title }}
            </h3>

            <p class="text-sm text-gray-500 line-clamp-2">
                {{ order.course.description }}
            </p>

            <div class="flex flex-wrap items-center gap-4 text-sm pt-2">
                <span class="font-semibold text-indigo-600">
                    ฿{{ order.course.price.toLocaleString() }}
                </span>

                <span class="text-gray-500">
                    🗓 {{ formatDate(order.createdAt) }}
                </span>

                <span class="px-3 py-1 rounded-full text-xs font-semibold" :class="statusClass(order.status)">
                    {{ order.status || 'UNKNOWN' }}
                </span>
            </div>
        </div>
    </div>
</template>

<script setup>
const BASE_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"

defineProps({
    order: {
        type: Object,
        required: true
    }
})

const formatDate = (date) =>
    new Date(date).toLocaleDateString("th-TH")

const statusClass = (status) => {
    if (status === "PAID")
        return "bg-green-100 text-green-700"
    if (status === "PENDING")
        return "bg-yellow-100 text-yellow-700"
    return "bg-gray-100 text-gray-600"
}
</script>
