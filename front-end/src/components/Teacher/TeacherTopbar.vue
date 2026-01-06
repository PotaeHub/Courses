<script setup>
import { computed } from 'vue'
import { Bell } from 'lucide-vue-next'

const user = computed(() =>
    JSON.parse(localStorage.getItem('user')) || {}
)
</script>

<template>
    <header class="h-[72px] bg-white border-b px-8 flex items-center justify-between">

        <h1 class="text-xl font-bold text-slate-800">
            {{ user.name }}'s Courses
        </h1>

        <div class="flex items-center gap-6">
            <Bell class="w-6 h-6 text-slate-500" />

            <div class="flex items-center gap-3">
                <img src="https://i.pravatar.cc/40" class="w-10 h-10 rounded-full" />
                <div>
                    <p class="font-semibold text-sm">{{ user.name }}</p>
                    <p class="text-xs text-slate-400">Course Creator</p>
                </div>
            </div>
        </div>
    </header>
</template>
