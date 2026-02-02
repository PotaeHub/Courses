import prisma from "../config/db.js"
import QRCode from "qrcode"
import { createThaiQRPayload } from "../utils/thaipayment.js"

/* =========================
   1. USER ขอ QR Payment
========================= */
export const getPaymentQR = async (req, res) => {
  const userId = req.user.id
  const orderId = Number(req.params.orderId)

  if (!orderId || isNaN(orderId)) {
    return res.status(400).json({ message: "Invalid orderId" })
  }

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { course: true }
  })

  if (!order) {
    return res.status(404).json({ message: "Order not found" })
  }

  /* ---------- PAYMENT ---------- */
  let payment = await prisma.payment.findUnique({
    where: { orderId } // ✅ ใช้ได้แล้ว เพราะ @unique
  })

  if (!payment) {
    payment = await prisma.payment.create({
      data: {
        amount: order.course.price,
        status: "PENDING",
        method: "PROMPTPAY",
        userId,
        orderId,
        courseId: order.courseId
      }
    })
  }

  /* ---------- ENROLLMENT ---------- */
  const enrollment = await prisma.enrollment.findFirst({
    where: { userId, courseId: order.courseId }
  })

  if (!enrollment) {
    await prisma.enrollment.create({
      data: {
        userId,
        courseId: order.courseId,
        orderId,
        status: "PENDING"
      }
    })
  }

  /* ---------- QR ---------- */
  const payload = createThaiQRPayload({
    promptpayId: "0812345678",
    amount: payment.amount
  })

  const qr = await QRCode.toDataURL(payload)

  res.json({
    orderId,
    amount: payment.amount,
    qr
  })
}

/* =========================
   2. USER แจ้งโอน
========================= */
export const markAsTransferred = async (req, res) => {
  const userId = req.user.id
  const { orderId } = req.body

  if (!orderId) {
    return res.status(400).json({ message: "orderId is required" })
  }

  const payment = await prisma.payment.findUnique({
    where: { orderId } // ✅ FIX
  })

  if (!payment) {
    return res.status(404).json({ message: "Payment not found" })
  }

  if (payment.userId !== userId) {
    return res.status(403).json({ message: "Forbidden" })
  }

  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "WAITING_CONFIRM" }
  })

  res.json(updated)
}

/* =========================
   3. ADMIN confirm payment
========================= */
export const adminConfirmPayment = async (req, res) => {
  const paymentId = Number(req.params.id)

  if (!paymentId || isNaN(paymentId)) {
    return res.status(400).json({ message: "Invalid payment id" })
  }

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { order: true }
  })

  if (!payment) {
    return res.status(404).json({ message: "Payment not found" })
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: paymentId },
      data: { status: "COMPLETED" }
    }),
    prisma.order.update({
      where: { id: payment.orderId },
      data: { status: "PAID" }
    }),
    prisma.enrollment.updateMany({
      where: { orderId: payment.orderId },
      data: { status: "APPROVED" }
    })
  ])

  res.json({ message: "Payment approved & course unlocked" })
}
