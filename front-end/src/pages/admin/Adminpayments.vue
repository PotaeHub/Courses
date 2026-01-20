<script setup>
import { onMounted, ref } from "vue"
import api from "../../service/api"

const payments = ref([])

const fetchPayments = async () => {
    const res = await api.get("/admin/payments")
    payments.value = res.data
}

const confirmPayment = async (id) => {
    if (!confirm("ยืนยันการชำระเงิน?")) return
    await api.patch(`/payments/${id}/confirm`)
    fetchPayments()
}

onMounted(fetchPayments)
</script>

<template>
    <div>
        <h1 class="text-2xl font-bold mb-6">ตรวจสอบการชำระเงิน</h1>

        <table class="w-full border">
            <thead>
                <tr class="bg-gray-100">
                    <th>ผู้เรียน</th>
                    <th>คอร์ส</th>
                    <th>ราคา</th>
                    <th>สลิป</th>
                    <th>สถานะ</th>
                    <th>จัดการ</th>
                </tr>
            </thead>

            <tbody>
                <tr v-for="p in payments" :key="p.id">
                    <td>{{ p.user.name }}</td>
                    <td>{{ p.course.title }}</td>
                    <td>{{ p.amount }}</td>
                    <td>
                        <a :href="p.slip" target="_blank">ดูสลิป</a>
                    </td>
                    <td>
                        <span v-if="p.status === 'PENDING'" class="text-orange-500">
                            รอการยืนยัน
                        </span>
                        <span v-else class="text-green-600">
                            สำเร็จ
                        </span>
                    </td>
                    <td>
                        <button v-if="p.status === 'PENDING'" @click="confirmPayment(p.id)"
                            class="bg-green-500 text-white px-3 py-1 rounded">
                            Confirm
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
