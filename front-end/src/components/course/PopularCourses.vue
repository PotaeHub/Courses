<script setup>
import CourseCard from './CourseCard.vue'

defineProps({
    courses: {
        type: Array,
        default: () => []
    }
})
</script>

<template>
    <section class="max-w-6xl mx-auto px-6">
        <h2 class="text-2xl font-bold mb-6">🔥 คอร์สนิยม</h2>

        <div class="grid md:grid-cols-4 gap-6">
            <CourseCard v-for="c in courses" :key="c.id" :course="c" />
        </div>
    </section>
</template>
