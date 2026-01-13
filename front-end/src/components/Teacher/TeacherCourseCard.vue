<script setup>
const props = defineProps({
    student: Object
})
</script>

<template>
    <div class="bg-white rounded-2xl p-4 shadow hover:shadow-lg transition-all">
        <h3 class="font-bold text-slate-800">{{ student.name }}</h3>
        <p class="text-sm text-slate-500">{{ student.email }}</p>
        <p class="text-xs text-slate-400 mt-1">Course: {{ student.courseName }}</p>
        <p class="text-xs text-slate-400">Progress: {{ student.progress }}%</p>
        <p class="text-xs text-slate-400">Joined: {{ student.joinedDate }}</p>
    </div>
</template>
