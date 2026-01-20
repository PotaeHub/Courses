<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../service/api'

const route = useRoute()
const router = useRouter()

const orderId = Number(route.params.id)
const order = ref(null)
const loading = ref(true)

const slipFile = ref(null)
const method = ref('BANK_TRANSFER') // ⭐ ค่าเริ่มต้น

// โหลด order
const loadOrder = async () => {
    try {
        const res = await api.get(`/orders/${orderId}`)
        order.value = res.data
    } catch (err) {
        alert('ไม่พบคำสั่งซื้อ')
        router.push('/')
    } finally {
        loading.value = false
    }
}

// เมื่อเลือกไฟล์
const onFileChange = (e) => {
    slipFile.value = e.target.files[0]
}

// อัปโหลดสลิป
const uploadSlip = async () => {
    if (!slipFile.value) return alert("กรุณาเลือกไฟล์")

    const formData = new FormData()
    formData.append("slip", slipFile.value)
    formData.append("orderId", orderId)
    formData.append("method", method.value)

    await api.post("/payments", formData)
    alert("อัปโหลดสลิปเรียบร้อย")
}

onMounted(loadOrder)
</script>

<template>
    <div class="max-w-xl mx-auto py-10">
        <div v-if="loading">กำลังโหลด...</div>

        <div v-else-if="order" class="bg-white p-6 rounded-xl shadow space-y-4">
            <h1 class="text-xl font-bold">
                ชำระเงินคอร์ส {{ order.course.title }}
            </h1>

            <p>
                ราคา: <b>{{ order.amount }}</b> บาท
            </p>

            <!-- เลือกวิธีชำระเงิน -->
            <div>
                <label class="block mb-1 font-medium">วิธีชำระเงิน</label>
                <select v-model="method" class="border p-2 rounded mb-3 w-full">
                    <option value="BANK_TRANSFER">โอนผ่านธนาคาร</option>
                    <option value="PROMPTPAY">PromptPay</option>
                </select>
            </div>

            <!-- อัปโหลดสลิป -->
            <div>
                <label class="block mb-1 font-medium">อัปโหลดสลิป</label>
                <input type="file" @change="onFileChange" />
            </div>

            <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded" @click="uploadSlip">
                อัปโหลดสลิป
            </button>

            <p class="text-sm text-slate-400">
                หลังจากอัปโหลดสลิป ระบบจะลงทะเบียนให้อัตโนมัติเมื่อแอดมินยืนยัน
            </p>
        </div>
    </div>
</template>
