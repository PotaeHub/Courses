<script setup>
import { ref } from 'vue'

const props = defineProps({
    totalStudents: Number
})
const emit = defineEmits(['update:search'])

const search = ref('')
</script>

<template>
    <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 class="text-xl font-bold text-slate-800">นักเรียนทั้งหมด ({{ props.totalStudents }})</h2>
        <input type="text" v-model="search" @input="$emit('update:search', search)" placeholder="ค้นหานักเรียน / คอร์ส"
            class="px-4 py-2 border rounded-lg w-full md:w-64" />
    </div>
</template>
