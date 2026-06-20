import { Response } from 'express';
import { prisma } from '../db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getCart(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const items = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: true,
      },
    });

    res.status(200).json(items);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error fetching cart' });
  }
}

export async function addToCart(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { productId, quantity, size } = req.body;
    if (!productId || !size) {
      res.status(400).json({ error: 'Product ID and size are required' });
      return;
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Check if item with same productId and size already exists in user's cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        userId: req.user.id,
        productId,
        size,
      },
    });

    let cartItem;
    if (existingCartItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + (parseInt(quantity) || 1),
        },
        include: { product: true },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId: req.user.id,
          productId,
          size,
          quantity: parseInt(quantity) || 1,
        },
        include: { product: true },
      });
    }

    res.status(200).json(cartItem);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error adding to cart' });
  }
}

export async function updateCartItem(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { id } = req.params;
    const { quantity } = req.body;

    const cartItem = await prisma.cartItem.findUnique({ where: { id } });
    if (!cartItem || cartItem.userId !== req.user.id) {
      res.status(404).json({ error: 'Cart item not found' });
      return;
    }

    if (parseInt(quantity) <= 0) {
      await prisma.cartItem.delete({ where: { id } });
      res.status(200).json({ message: 'Item removed from cart' });
      return;
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity: parseInt(quantity) },
      include: { product: true },
    });

    res.status(200).json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error updating cart item' });
  }
}

export async function removeFromCart(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { id } = req.params;

    const cartItem = await prisma.cartItem.findUnique({ where: { id } });
    if (!cartItem || cartItem.userId !== req.user.id) {
      res.status(404).json({ error: 'Cart item not found' });
      return;
    }

    await prisma.cartItem.delete({ where: { id } });
    res.status(200).json({ message: 'Item removed from cart' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error removing from cart' });
  }
}

export async function clearCart(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    await prisma.cartItem.deleteMany({
      where: { userId: req.user.id },
    });

    res.status(200).json({ message: 'Cart cleared' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error clearing cart' });
  }
}
