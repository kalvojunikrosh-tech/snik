import { Response } from 'express';
import { prisma } from '../db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function createOrder(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { addressId, street, city, state, postalCode, country, paymentMethod } = req.body;

    if (!street || !city || !state || !postalCode || !country || !paymentMethod) {
      res.status(400).json({ error: 'Full shipping address and payment method are required' });
      return;
    }

    // Get current user cart
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      res.status(400).json({ error: 'Your cart is empty' });
      return;
    }

    let total = 0;
    const orderItemsData = cartItems.map((item) => {
      const price = item.product.price;
      const quantity = item.quantity;
      total += price * quantity;
      return {
        productId: item.productId,
        quantity,
        price,
        size: item.size,
      };
    });

    // Create Order with nested order items
    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        total,
        addressId: addressId || null,
        street,
        city,
        state,
        postalCode,
        country,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
      },
    });

    // Create Payment status of this order
    await prisma.payment.create({
      data: {
        orderId: order.id,
        method: paymentMethod,
        status: 'SUCCESSFUL', // Simulate instant processing
        amount: total,
        transactionId: 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      },
    });

    // Clear user cart
    await prisma.cartItem.deleteMany({
      where: { userId: req.user.id },
    });

    // Reduce stock for products
    for (const item of cartItems) {
      const currentStock = item.product.stock;
      const newStock = Math.max(0, currentStock - item.quantity);
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: newStock },
      });
    }

    res.status(201).json({
      message: 'Order placed successfully',
      orderId: order.id,
      total,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error occurred during checkout' });
  }
}

export async function getMyOrders(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error retrieving order history' });
  }
}

export async function getOrderById(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payment: true,
      },
    });

    if (!order || order.userId !== req.user.id) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.status(200).json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error retrieving order' });
  }
}
