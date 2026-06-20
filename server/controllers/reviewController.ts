import { Response } from 'express';
import { prisma } from '../db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function addReview(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { productId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      res.status(400).json({ error: 'Product ID, rating (1-5), and comment text are required' });
      return;
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const ratingInt = parseInt(rating);
    if (isNaN(ratingInt) || ratingInt < 1 || ratingInt > 5) {
      res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
      return;
    }

    const review = await prisma.review.create({
      data: {
        userId: req.user.id,
        productId,
        rating: ratingInt,
        comment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json(review);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error occurred adding review' });
  }
}

export async function getProductReviews(req: AuthenticatedRequest, res: Response) {
  try {
    const { productId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json(reviews);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error fetching reviews' });
  }
}
