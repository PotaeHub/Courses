<script setup>
defineProps(['role'])
</script>

<template>
    <span :class="[
        'px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide',
        role === 'ADMIN' ? 'bg-red-100 text-red-600' :
            role === 'TEACHER' ? 'bg-green-100 text-green-600' :
                'bg-blue-100 text-blue-600'
    ]">
        {{ role }}
    </span>
</template>