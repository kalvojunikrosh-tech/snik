import { Request, Response } from 'express';
import { prisma } from '../db.js';

export async function getAllCategories(req: Request, res: Response) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    res.status(200).json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error fetching categories' });
  }
}

export async function createCategory(req: Request, res: Response) {
  try {
    const { name, slug, description, image } = req.body;

    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      res.status(400).json({ error: 'Category with this slug already exists' });
      return;
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        image,
      },
    });

    res.status(201).json(category);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error creating category' });
  }
}
