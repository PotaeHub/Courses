<script setup>
import { onMounted, watch, computed } from 'vue'
import { useCountUp } from '../../composables/useCountUp'

const props = defineProps({
    title: String,
    value: {
        type: [Number, String],
        default: 0
    },
    icon: Object,
    color: {
        type: String,
        default: 'blue'
    },
    suffix: {
        type: String,
        default: ''
    },
    delay: { // เพิ่ม delay สำหรับทางเข้า (ms)
        type: Number,
        default: 0
    }
})

const { value: animatedValue, start } = useCountUp(900)

onMounted(() => {
    if (typeof props.value === 'number') {
        start(props.value)
    }
})

watch(
    () => props.value,
    (v) => {
        if (typeof v === 'number') start(v)
    }
)

const colorConfig = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100/50 glow-blue',
    purple: 'text-purple-600 bg-purple-50 border-purple-100/50 glow-purple',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100/50 glow-emerald',
    orange: 'text-orange-600 bg-orange-50 border-orange-100/50 glow-orange'
}
</script>

<template>
    <div class="stat-card group relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)]"
        :style="{ animationDelay: `${delay}ms` }">

        <div class="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 group-hover:scale-[2.5] transition-all duration-700 pointer-events-none"
            :class="colorConfig[color].split(' ')[1]" />

        <div class="relative z-10">
            <div class="flex justify-between items-start mb-6">
                <p class="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {{ title }}
                </p>
                <div class="icon-box w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-[10deg] group-hover:scale-110 shadow-sm border"
                    :class="colorConfig[color]">
                    <component :is="icon" class="w-7 h-7 stroke-[2.25]" />
                </div>
            </div>

            <div class="flex items-baseline gap-1">
                <h3
                    class="text-4xl font-black text-slate-800 tracking-tight tracking-tighter group-hover:text-slate-900 transition-colors">
                    {{ animatedValue.toLocaleString() }}
                </h3>
                <span v-if="suffix" class="text-lg font-bold text-slate-400">{{ suffix }}</span>
            </div>

            <div class="mt-6 h-1 w-12 rounded-full transition-all duration-500 group-hover:w-full opacity-20"
                :class="colorConfig[color].split(' ')[0].replace('text', 'bg')" />
        </div>

        <div class="absolute -bottom-12 -left-12 w-40 h-40 rounded-full opacity-10 blur-3xl transition-opacity duration-500 group-hover:opacity-25"
            :class="colorConfig[color].split(' ')[1]" />
    </div>
</template>

<style scoped>
.stat-card {
    /* Entrance Animation */
    opacity: 0;
    transform: translateY(20px);
    animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideUpFade {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.icon-box {
    /* Subtle float animation for the icon box */
    animation: float 4s ease-in-out infinite;
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0px);
    }

    50% {
        transform: translateY(-4px);
    }
}

/* Custom Glow Colors */
.glow-blue {
    box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.1);
}

.glow-purple {
    box-shadow: 0 10px 15px -3px rgba(147, 51, 234, 0.1);
}

.glow-emerald {
    box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.1);
}

.glow-orange {
    box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.1);
}
</style>