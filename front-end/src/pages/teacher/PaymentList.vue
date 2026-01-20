<script setup>
import { ref, onMounted } from "vue";
import api from "../../service/api";

const payments = ref([]);

const fetchPayments = async () => {
    const res = await api.get("/payments"); // API ดึงรายการสลิป
    payments.value = res.data;
};

const confirmPayment = async (paymentId) => {
    try {
        await api.post(`/payments/${paymentId}/confirm`);
        alert("ยืนยันการชำระเงินเรียบร้อย");
        fetchPayments(); // โหลดข้อมูลใหม่
    } catch (err) {
        alert(err.response?.data?.message || "เกิดข้อผิดพลาด");
    }
};

onMounted(fetchPayments);
</script>
<template>
    <div>
        <h2>ตรวจสอบการชำระเงิน</h2>

        <table>
            <tr>
                <th>ผู้เรียน</th>
                <th>คอร์ส</th>
                <th>สลิป</th>
                <th>สถานะ</th>
                <th>จัดการ</th>
            </tr>

            <tr v-for="p in payments" :key="p.id">
                <td>{{ p.order.user.name }}</td>
                <td>{{ p.order.course.title }}</td>
                <td>
                    <img :src="p.image" width="100" />
                </td>
                <td>{{ p.status }}</td>
                <td>
                    <button v-if="p.status === 'PENDING'" @click="confirmPayment(p.id)">
                        ✅ ยืนยัน
                    </button>
                </td>
            </tr>
        </table>
    </div>
</template>
