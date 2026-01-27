import prisma from "../config/db.js";

export const uploadPayment = async (req, res) => {
  try {
    const { orderId, method } = req.body;
    const userId = req.user.id;
    console.log("FILE =", req.file);

    if (!orderId || !method) {
      return res.status(400).json({
        message: "orderId และ method จำเป็นต้องมี",
      });
    }

    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
      include: { course: true },
    });

    if (!order) {
      return res.status(404).json({ message: "ไม่พบ order" });
    }

    const exists = await prisma.payment.findUnique({
      where: { orderId: order.id },
    });

    if (exists) {
      return res.status(400).json({ message: "Order นี้มีการชำระเงินแล้ว" });
    }

    const slipPath = req.file
      ? `/uploads/payments/slips/${req.file.filename}`
      : null;

    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        userId,
        courseId: order.courseId,
        method,
        amount: order.amount,
        slip: slipPath,
        status: "PENDING",
      },
    });

    res.json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
export const confirmPayment = async (req, res, next) => {
  try {
    const paymentId = Number(req.params.id);
    if (!paymentId) {
      throw new AppError("Invalid payment id", 400);
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: true,
      },
    });

    if (!payment) {
      throw new AppError("Payment not found", 404);
    }

    if (payment.status === "COMPLETED") {
      throw new AppError("Payment already confirmed", 400);
    }

    const { userId, courseId, orderId } = payment;

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: paymentId },
        data: { status: "COMPLETED" },
      });

      await tx.order.update({
        where: { id: orderId },
        data: { status: "PAID" },
      });

      const exists = await tx.enrollment.findFirst({
        where: { userId, courseId },
      });

      if (!exists) {
        await tx.enrollment.create({
          data: {
            userId,
            courseId,
            status: "ENROLLED",
          },
        });
      }
    });

    res.json({ message: "Confirm payment success" });
  } catch (err) {
    next(err);
  }
};
