import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { seedDatabase } from './server/seed.ts';

// Configure dotenv
import 'dotenv/config';

// Import local routes
import authRouter from './server/routes/authRoutes.ts';
import productRouter from './server/routes/productRoutes.ts';
import categoryRouter from './server/routes/categoryRoutes.ts';
import cartRouter from './server/routes/cartRoutes.ts';
import wishlistRouter from './server/routes/wishlistRoutes.ts';
import orderRouter from './server/routes/orderRoutes.ts';
import reviewRouter from './server/routes/reviewRoutes.ts';
import recommendationRouter from './server/routes/recommendationRoutes.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Seed standard data on start if empty
  try {
    await seedDatabase();
  } catch (err) {
    console.error('Failed to seed database, continuing startup:', err);
  }

  // Bind API routes under '/api'
  app.use('/api/auth', authRouter);
  app.use('/api/products', productRouter);
  app.use('/api/categories', categoryRouter);
  app.use('/api/cart', cartRouter);
  app.use('/api/wishlist', wishlistRouter);
  app.use('/api/orders', orderRouter);
  app.use('/api/reviews', reviewRouter);
  app.use('/api/recommendations', recommendationRouter);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', datetime: new Date().toISOString() });
  });

  // Handle Vite middleware structure
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware integrated active.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running successfully on http://0.0.0.0:${PORT}`);
  });
}

startServer();
