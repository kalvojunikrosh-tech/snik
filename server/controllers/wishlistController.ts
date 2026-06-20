import { Response } from 'express';
import { prisma } from '../db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getWishlist(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: true,
      },
    });

    res.status(200).json(items);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error fetching wishlist' });
  }
}

export async function toggleWishlist(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { productId } = req.body;
    if (!productId) {
      res.status(400).json({ error: 'Product ID is required' });
      return;
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const existingWish = await prisma.wishlistItem.findFirst({
      where: {
        userId: req.user.id,
        productId,
      },
    });

    if (existingWish) {
      await prisma.wishlistItem.delete({
        where: { id: existingWish.id },
      });
      res.status(200).json({ message: 'Removed from wishlist', active: false });
    } else {
      const newWish = await prisma.wishlistItem.create({
        data: {
          userId: req.user.id,
          productId,
        },
        include: { product: true },
      });
      res.status(200).json({ message: 'Added to wishlist', active: true, data: newWish });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error toggling wishlist' });
  }
}
