<template>
    <section class="bg-white shadow-sm py-12">
        <div class="max-w-6xl mx-auto px-6 flex flex-col md:flex-row gap-8 items-start">
            <div class="w-full md:w-1/3 rounded-xl overflow-hidden shadow">
                <img :src="course.image" alt="Course Image" class="w-full h-full object-cover" />
            </div>

            <div class="flex-1 space-y-4">
                <h1 class="text-3xl font-bold text-gray-800">{{ course.title }}</h1>
                <p class="text-gray-500">{{ course.description }}</p>

                <div class="flex flex-wrap items-center gap-4 mt-4">
                    <span class="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
                        {{ course.category?.name }}
                    </span>
                    <span class="text-gray-700 font-semibold">
                        Instructor: {{ course.teacher?.name }}
                    </span>
                    <span class="text-gray-700 font-bold text-lg">${{ course.price }}</span>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
defineProps({
    course: Object
})
</script>
