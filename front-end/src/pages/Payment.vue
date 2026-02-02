<script setup>
import { ref, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import api from "@/service/api"
import Swal from "sweetalert2"

const route = useRoute()
const router = useRouter()

// ✅ ตรงนี้คือ orderId ไม่ใช่ courseId
const orderId = Number(route.params.id)

const qrImage = ref(null)
const waitingConfirm = ref(false)
const loading = ref(false)

/**
 * 1️⃣ โหลด Order + ขอ QR
 */
const loadQR = async () => {
    try {
        loading.value = true
        Swal.fire({
            title: "กำลังโหลด QR Code...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        })

        // (optional) โหลด order เพื่อตรวจสอบสถานะ
        const orderRes = await api.get(`/orders/${orderId}`)

        if (orderRes.data.status !== "PENDING") {
            throw new Error("Order ไม่อยู่ในสถานะรอชำระเงิน")
        }

        // ขอ QR จาก order เดิม
        const qrRes = await api.get(`/payments/${orderId}/qr`)
        qrImage.value = qrRes.data.qr

        Swal.close()
    } catch (err) {
        Swal.fire(
            "ผิดพลาด",
            err.response?.data?.message || err.message || "ไม่สามารถโหลด QR ได้",
            "error"
        )
    } finally {
        loading.value = false
    }
}

/**
 * 2️⃣ แจ้งโอน
 */
const confirmTransfer = async () => {
    const confirm = await Swal.fire({
        title: "ยืนยันว่าโอนเงินแล้ว?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "โอนแล้ว",
        cancelButtonText: "ยกเลิก"
    })

    if (!confirm.isConfirmed) return

    try {
        await api.post("/payments/confirm-transfer", {
            orderId
        })

        waitingConfirm.value = true

        Swal.fire(
            "แจ้งโอนสำเร็จ",
            "รอแอดมินตรวจสอบ",
            "success"
        )

        router.push("/student/mycourses")
    } catch (err) {
        Swal.fire(
            "ผิดพลาด",
            err.response?.data?.message || "แจ้งโอนไม่สำเร็จ",
            "error"
        )
    }
}

onMounted(loadQR)
</script>


<template>
    <div class="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <div class="bg-white rounded-2xl shadow p-10 max-w-md w-full text-center">

            <h1 class="text-2xl font-black mb-2">สแกนเพื่อชำระเงิน</h1>
            <p class="text-gray-400 mb-6">PromptPay (Thai QR Payment)</p>

            <!-- QR -->
            <div v-if="qrImage" class="flex justify-center mb-6">
                <img :src="qrImage" class="w-64 h-64 rounded-xl border" alt="PromptPay QR" />
            </div>

            <div v-else class="py-20 animate-pulse text-gray-400">
                กำลังโหลด QR...
            </div>

            <!-- Waiting -->
            <div v-if="waitingConfirm" class="text-indigo-600 font-semibold">
                ⏳ รอการยืนยันจากแอดมิน
            </div>

            <!-- Confirm -->
            <button v-if="qrImage && !waitingConfirm" :disabled="loading" @click="confirmTransfer" class="mt-6 w-full py-3 rounded-xl
                       bg-green-600 hover:bg-green-700
                       disabled:opacity-50
                       text-white font-bold">
                ✅ ฉันโอนแล้ว
            </button>

        </div>
    </div>
</template>
