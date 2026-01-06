import { ref } from 'vue'

export function useCountUp(duration = 1000) {
    const value = ref(0)

    const start = (target = 0) => {
        const startTime = performance.now()
        const from = value.value

        const animate = (now) => {
            const progress = Math.min((now - startTime) / duration, 1)
            value.value = Math.floor(from + (target - from) * progress)

            if (progress < 1) {
                requestAnimationFrame(animate)
            }
        }

        requestAnimationFrame(animate)
    }

    return { value, start }
}
