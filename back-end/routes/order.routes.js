import { Router } from 'express'
import { createOrder, getOrderById } from '../controllers/Order.controller.js';
import { auth } from '../middlewares/auth.js';
const router = Router();

router.post('/orders', auth, createOrder)
router.get('/orders/:id', auth, getOrderById)

export default router;