<script setup>
defineProps({
    student: {
        type: Object,
        required: true
    }
})
</script>

<template>
    <div class="bg-white rounded-3xl p-6 shadow-sm space-y-4">

        <!-- NAME -->
        <div>
            <h3 class="text-lg font-bold">{{ student.name }}</h3>
            <p class="text-sm text-slate-400">{{ student.email }}</p>
        </div>

        <!-- COURSE -->
        <div class="text-sm">
            <span class="font-semibold">คอร์ส:</span>
            {{ student.courseName }}
        </div>

        <!-- PROGRESS -->
        <div>
            <div class="flex justify-between text-sm font-semibold mb-1">
                <span>ความคืบหน้า</span>
                <span>{{ student.progressPercent }}%</span>
            </div>

            <div class="h-2 bg-slate-200 rounded-full">
                <div class="h-2 bg-blue-600 rounded-full transition-all"
                    :style="{ width: student.progressPercent + '%' }"></div>
            </div>

            <p class="text-xs text-slate-400 mt-1">
                {{ student.watchedLessons }} / {{ student.totalLessons }} lessons
            </p>
        </div>

        <!-- LAST LESSON -->
        <div v-if="student.lastLessonTitle" class="text-xs text-slate-500">
            ล่าสุด: {{ student.lastLessonTitle }}
        </div>

        <!-- JOIN DATE -->
        <div class="text-xs text-slate-400">
            สมัครเมื่อ {{ student.joinedDate }}
        </div>

    </div>
</template>
