import { Request, Response } from 'express';
import { prisma } from '../db.js';

export async function getAllProducts(req: Request, res: Response) {
  try {
    const { category, search, minPrice, maxPrice, sort } = req.query;

    const where: any = {};

    if (category) {
      where.category = {
        slug: String(category),
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { brand: { contains: String(search) } },
        { description: { contains: String(search) } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(String(minPrice));
      if (maxPrice) where.price.lte = parseFloat(String(maxPrice));
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort) {
      if (sort === 'price-asc') orderBy = { price: 'asc' };
      else if (sort === 'price-desc') orderBy = { price: 'desc' };
      else if (sort === 'popular') orderBy = { stock: 'asc' }; // Mock popularity
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        reviews: true,
      },
      orderBy,
    });

    res.status(200).json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error fetching products' });
  }
}

export async function getProductBySlug(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        reviews: {
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
        },
      },
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Generate simulated market trade history for sneaker market analytics
    // e.g. last 7 days of luxury digital trading prices
    const marketHistory = Array.from({ length: 15 }).map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (14 - index));
      // Add random price fluctuate around original price, higher variance for crypto exclusive
      const basePrice = product.price;
      const volatility = product.isCryptoExclusive ? 0.08 : 0.04;
      const change = basePrice * (Math.sin(index / 2) * volatility + (Math.random() - 0.5) * volatility);
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: Math.round(basePrice + change),
        volume: Math.floor(Math.random() * 20) + 1,
      };
    });

    res.status(200).json({
      ...product,
      marketHistory,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error fetching product' });
  }
}

export async function createProduct(req: Request, res: Response) {
  try {
    const { name, slug, description, price, retailPrice, image, gallery, sizes, brand, colorway, releaseDate, isCryptoExclusive, categoryId, stock } = req.body;

    const existingProduct = await prisma.product.findUnique({ where: { slug } });
    if (existingProduct) {
      res.status(400).json({ error: 'Product with this slug already exists' });
      return;
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        retailPrice: parseFloat(retailPrice),
        image,
        gallery: gallery || image,
        sizes: sizes || '9,9.5,10,10.5,11',
        brand,
        colorway,
        releaseDate,
        isCryptoExclusive: !!isCryptoExclusive,
        categoryId,
        stock: parseInt(stock) || 10,
      },
    });

    res.status(201).json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error creating product' });
  }
}

export async function getVirtualDrops(req: Request, res: Response) {
  try {
    const drops = await prisma.virtualDrop.findMany({
      orderBy: {
        releaseTime: 'asc',
      },
    });
    res.status(200).json(drops);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error fetching virtual drops' });
  }
}
