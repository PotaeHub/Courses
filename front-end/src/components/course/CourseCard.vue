<script setup>
defineProps({
    course: {
        type: Object,
        required: true
    }
})

const BASE_URL = import.meta.env.VITE_BACKEND_URL
</script>

<template>
    <div class="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden group">
        <!-- Image -->
        <img :src="`${BASE_URL}${course.image}`" class="h-40 w-full object-cover group-hover:scale-105 transition"
            alt="course image" />

        <div class="p-4">
            <!-- Title -->
            <h3 class="font-bold text-gray-800 line-clamp-2">
                {{ course.title }}
            </h3>

            <!-- Teacher -->
            <p class="text-sm text-gray-500 mt-1">
                {{ course.teacher?.name }}
            </p>

            <div class="flex justify-between items-center mt-3">
                <!-- Price -->
                <span class="font-bold text-blue-600">
                    ฿{{ course.price.toLocaleString() }}
                </span>

                <!-- Link -->
                <router-link :to="{ name: 'student-course-detail', params: { id: course.id } }"
                    class="text-sm text-blue-600 hover:underline font-medium">
                    ดูรายละเอียด →
                </router-link>
            </div>
        </div>
    </div>
</template>
