<script setup>
import { useRouter } from "vue-router"

const props = defineProps({
    order: Object
})

const router = useRouter()
const BASE_URL = import.meta.env.VITE_BACKEND_URL
const goCourse = () => {
    router.push(`/student/course/${props.order.courseId}`)
}
</script>

<template>
    <div class="bg-white rounded-xl shadow p-5 space-y-3">
        <img :src="BASE_URL + order.image" class="w-full h-40 object-cover rounded-lg" />

        <h3 class="font-bold text-lg">{{ order.title }}</h3>

        <div v-if="order.status === 'APPROVED'" class="text-green-600 font-semibold">
            ✅ เรียนได้แล้ว
        </div>

        <div v-else class="text-orange-500 font-semibold">
            ⏳ รอแอดมินอนุมัติ
        </div>

        <button v-if="order.status === 'APPROVED'" @click="goCourse"
            class="w-full mt-3 py-2 rounded-lg bg-black text-white hover:bg-gray-800">
            ▶️ เข้าเรียน
        </button>
    </div>
</template>
