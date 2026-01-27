<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../service/api'
import Swal from 'sweetalert2' // 1. นำเข้า SweetAlert2

const route = useRoute()
const router = useRouter()
const previewUrl = ref(null)
const orderId = Number(route.params.id)
const order = ref(null)
const loading = ref(true)
const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"
const slipFile = ref(null)
const method = ref('BANK_TRANSFER')

// โหลด order
const loadOrder = async () => {
    try {
        const res = await api.get(`/orders/${orderId}`)
        order.value = res.data
    } catch (err) {
        // แจ้งเตือนกรณีไม่พบ Order
        Swal.fire({
            icon: 'error',
            title: 'ไม่พบคำสั่งซื้อ',
            text: 'กรุณาลองใหม่อีกครั้ง หรือติดต่อเจ้าหน้าที่',
            confirmButtonColor: '#111827',
        }).then(() => {
            router.push('/')
        })
    } finally {
        loading.value = false
    }
}

// เมื่อเลือกไฟล์
const onFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
        Swal.fire({
            icon: 'warning',
            title: 'ไฟล์ไม่ถูกต้อง',
            text: 'กรุณาลองเลือกไฟล์รูปภาพ (JPG, PNG) เท่านั้น',
            confirmButtonColor: '#111827',
        })
        return
    }

    slipFile.value = file
    previewUrl.value = URL.createObjectURL(file)
}

// อัปโหลดสลิป
const uploadSlip = async () => {
    if (!slipFile.value) {
        return Swal.fire({
            icon: 'info',
            title: 'ยังไม่ได้เลือกไฟล์',
            text: 'กรุณาอัปโหลดรูปภาพสลิปธนาคารก่อนกดยืนยัน',
            confirmButtonColor: '#111827',
        })
    }

    // แสดง Loading ระหว่างส่งข้อมูล
    Swal.fire({
        title: 'กำลังส่งข้อมูล...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading()
        }
    })

    const formData = new FormData()
    formData.append("slip", slipFile.value)
    formData.append("orderId", orderId)
    formData.append("method", method.value)

    try {
        await api.post("/payments", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        })

        // แจ้งเตือนสำเร็จ
        await Swal.fire({
            icon: 'success',
            title: 'อัปโหลดสลิปเรียบร้อย',
            text: 'แอดมินจะรีบตรวจสอบข้อมูลของคุณให้เร็วที่สุด',
            showConfirmButton: false,
            timer: 2000,
            customClass: {
                popup: 'rounded-[2rem]'
            }
        })

        router.push('/')

    } catch (err) {
        console.error(err)
        Swal.fire({
            icon: 'error',
            title: 'อัปโหลดไม่สำเร็จ',
            text: err.response?.data?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์',
            confirmButtonColor: '#111827',
        })
    }
}

const goHome = () => {
    router.push('/')
}

onMounted(loadOrder)
</script>

<template>
    <div class="min-h-screen bg-[#F8FAFC] py-12 px-4 md:px-8">
        <div class="max-w-6xl mx-auto">

            <div v-if="loading" class="flex flex-col items-center justify-center py-20">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p class="mt-4 text-gray-500 font-medium">กำลังโหลดข้อมูล...</p>
            </div>

            <div v-else-if="order" class="space-y-6">
                <button @click="goHome"
                    class="flex items-center text-gray-500 hover:text-gray-800 transition-colors mb-4 group">
                    <svg xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span class="font-bold text-lg">ชำระเงิน</span>
                </button>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    <div class="lg:col-span-2 space-y-6">
                        <div class="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                            <div class="flex items-center gap-3 mb-6">
                                <div class="bg-blue-50 p-2 rounded-lg text-blue-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                <h2 class="text-xl font-black text-gray-900">เลือกวิธีชำระเงิน</h2>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div @click="method = 'PROMPTPAY'"
                                    :class="method === 'PROMPTPAY' ? 'border-blue-600 bg-blue-50/30 ring-1 ring-blue-600' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'"
                                    class="relative p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center gap-3">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/c/c5/PromptPay-logo.png"
                                        alt="PromptPay" class="h-8 object-contain" />
                                    <span class="font-bold text-gray-700">พร้อมเพย์</span>
                                </div>

                                <div @click="method = 'BANK_TRANSFER'"
                                    :class="method === 'BANK_TRANSFER' ? 'border-blue-600 bg-blue-50/30 ring-1 ring-blue-600' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'"
                                    class="relative p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center gap-3">
                                    <div class="bg-white p-2 rounded-xl shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400"
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <span class="font-bold text-gray-700">โอนผ่านธนาคาร</span>
                                </div>
                            </div>

                            <div v-if="method === 'PROMPTPAY'"
                                class="mt-8 p-8 border-2 border-dashed border-gray-100 rounded-[2rem] flex flex-col items-center">
                                <p class="text-gray-400 text-sm font-bold uppercase tracking-widest mb-4">Scan QR Code
                                    เพื่อชำระเงิน</p>
                                <div class="bg-white p-4 rounded-3xl shadow-md border border-gray-50 mb-4">
                                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PROMPTPAY_DATA"
                                        class="w-48 h-48" alt="QR Code" />
                                </div>
                                <p class="text-gray-900 font-black text-lg">ชื่อบัญชี: บจก. EduFlex Website</p>
                            </div>
                        </div>

                        <div class="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                            <div class="flex items-center gap-3 mb-6">
                                <div class="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                </div>
                                <h2 class="text-xl font-black text-gray-900">อัปโหลดหลักฐานการชำระเงิน</h2>
                            </div>

                            <div
                                class="relative group border-2 border-dashed border-gray-200 rounded-[2rem] p-10 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer overflow-hidden">
                                <input type="file" accept="image/*" @change="onFileChange"
                                    class="absolute inset-0 opacity-0 cursor-pointer z-10" />

                                <div v-if="!previewUrl" class="flex flex-col items-center">
                                    <div
                                        class="bg-indigo-50 p-4 rounded-full text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                    <p class="text-gray-900 font-bold text-lg">คลิกเพื่ออัปโหลดสลิป</p>
                                    <p class="text-gray-400 text-sm mt-1">รองรับไฟล์ JPG, PNG เท่านั้น</p>
                                </div>

                                <div v-else class="w-full flex flex-col items-center gap-4">
                                    <img :src="previewUrl" class="max-h-64 rounded-xl shadow border object-contain" />
                                    <p class="text-sm text-gray-500">{{ slipFile?.name }}</p>
                                    <p class="text-xs text-indigo-500 underline">คลิกเพื่อเปลี่ยนรูป</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-6 lg:sticky lg:top-8">
                        <div class="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                            <h2 class="text-xl font-black text-gray-900 mb-6">สรุปการสั่งซื้อ</h2>

                            <div class="flex items-start gap-4 pb-6 border-b border-gray-50 mb-6">
                                <div class="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                                    <img :src="`${BASE_URL}${order.course.image}`" class="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h3 class="font-bold text-gray-900 leading-tight line-clamp-2">{{ order.course.title
                                        }}</h3>
                                    <p class="text-xs text-gray-400 mt-1 uppercase tracking-wider">{{
                                        order.course.instructor }}</p>
                                </div>
                            </div>

                            <div class="space-y-4">
                                <div class="flex justify-between text-gray-500 font-medium">
                                    <span>ราคาคอร์ส</span>
                                    <span>฿{{ order.amount.toLocaleString() }}</span>
                                </div>
                                <div class="flex justify-between text-emerald-500 font-medium">
                                    <span>ส่วนลด</span>
                                    <span>-฿0</span>
                                </div>
                                <div class="pt-4 border-t border-gray-50 flex justify-between items-end">
                                    <span class="text-gray-900 font-black">ยอดที่ต้องจ่าย</span>
                                    <span class="text-3xl font-black text-indigo-600">฿{{ order.amount.toLocaleString()
                                        }}</span>
                                </div>
                            </div>

                            <button @click="uploadSlip"
                                class="w-full mt-8 bg-gray-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-gray-200 hover:bg-indigo-600 transition-all active:scale-[0.98]">
                                ยืนยันการแจ้งชำระเงิน
                            </button>

                            <p class="text-center text-xs text-gray-400 mt-6 leading-relaxed">
                                หลังจากอัปโหลดสลิป ระบบจะตรวจสอบและ <br />
                                ลงทะเบียนให้อัตโนมัติเมื่อแอดมินยืนยัน
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>