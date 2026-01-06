<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Chart, registerables } from 'chart.js'
import api from '../../service/api.js'

Chart.register(...registerables)

const canvasRef = ref(null)
const isLoading = ref(true)
let chartInstance = null

onMounted(async () => {
    try {
        const res = await api.get('/admin/revenue-chart')
        const data = res.data.data
        isLoading.value = false

        const labels = data.map(i => i.month)
        const values = data.map(i => i.total)

        const ctx = canvasRef.value.getContext('2d')

        const gradient = ctx.createLinearGradient(0, 0, 0, 320)
        gradient.addColorStop(0, 'rgba(37,99,235,0.18)')
        gradient.addColorStop(1, 'rgba(37,99,235,0.02)')

        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    data: values,
                    fill: true,
                    backgroundColor: gradient,
                    borderColor: '#2563eb',
                    borderWidth: 3,
                    tension: 0.45,

                    // จุด (โชว์เฉพาะ hover)
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#2563eb',
                    pointBorderWidth: 3,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,

                animation: {
                    duration: 1400,
                    easing: 'easeOutQuart'
                },

                interaction: {
                    intersect: false,
                    mode: 'index'
                },

                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#0f172a',
                        titleColor: '#e5e7eb',
                        bodyColor: '#cbd5f5',
                        padding: 14,
                        cornerRadius: 14,
                        displayColors: false,
                        callbacks: {
                            label: ctx => ` ฿ ${ctx.raw.toLocaleString()}`
                        }
                    }
                },

                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            color: '#94a3b8',
                            font: { size: 11, weight: '600' }
                        }
                    },
                    y: {
                        border: { display: false },
                        grid: {
                            color: '#f1f5f9',
                            drawTicks: false
                        },
                        ticks: {
                            color: '#cbd5e1',
                            font: { size: 11 },
                            maxTicksLimit: 5,
                            callback: v =>
                                v >= 1000 ? '฿' + (v / 1000) + 'k' : '฿' + v
                        }
                    }
                }
            }
        })
    } catch (err) {
        console.error(err)
    }
})

onUnmounted(() => chartInstance?.destroy())
</script>

<template>
    <div
        class="relative bg-white rounded-[2.2rem] p-7 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-700 min-h-[360px] overflow-hidden">

        <!-- Header -->
        <div class="flex justify-between items-start mb-6">
            <div>
                <h3 class="text-lg font-black text-slate-800 tracking-tight">
                    ประสิทธิภาพด้านรายได้
                </h3>
                <p class="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    รายได้ต่อเดือน
                </p>
            </div>

            <select
                class="bg-slate-50 text-xs font-bold px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 transition">
                <option>2025</option>
                <option>2024</option>
            </select>
        </div>

        <!-- Chart -->
        <div class="relative h-[260px]">
            <!-- Loader -->
            <div v-if="isLoading"
                class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white z-10">
                <div class="w-10 h-10 border-[3px] border-blue-100 border-t-blue-600 rounded-full animate-spin">
                </div>
                <p class="text-[11px] font-black text-slate-400 tracking-widest">
                    LOADING DATA
                </p>
            </div>

            <canvas ref="canvasRef"></canvas>
        </div>

        <!-- Glow -->
        <div class="absolute -bottom-16 -right-16 w-52 h-52 bg-blue-500/10 blur-3xl rounded-full pointer-events-none">
        </div>
    </div>
</template>

<style scoped>
canvas {
    filter: drop-shadow(0 12px 12px rgba(37, 99, 235, 0.06));
}

@keyframes softIn {
    from {
        opacity: 0;
        transform: translateY(24px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

div {
    animation: softIn 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}
</style>
