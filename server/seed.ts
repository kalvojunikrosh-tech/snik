import { prisma } from './db.js';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  console.log('Seeding database...');

  // Check if categories already exist
  const existingCategories = await prisma.category.findMany();
  if (existingCategories.length > 0) {
    console.log('Database already has categories, skipping seed.');
    return;
  }

  // Create Categories
  const neonCategory = await prisma.category.create({
    data: {
      name: 'Cyber Neon',
      slug: 'cyber-neon',
      description: 'Glow-in-the-dark photon-emitting sneakers of the future.',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    },
  });

  const minimalCategory = await prisma.category.create({
    data: {
      name: 'Chrono Minimalist',
      slug: 'chrono-minimalist',
      description: 'Sleek, lightweight titanium-woven silhouettes.',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80',
    },
  });

  const brutalistCategory = await prisma.category.create({
    data: {
      name: 'Exo Brutalist',
      slug: 'exo-brutalist',
      description: 'Heavy protective exoskeletal digital armor.',
      image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&auto=format&fit=crop&q=80',
    },
  });

  // Create Products
  const products = [
    {
      name: 'AETHER SHIFT ONE',
      slug: 'aether-shift-one',
      description: 'The pinnacle of digital luxury. Features an active neon photon sole with real-time reactive soundwave lighting. Hand-woven with carbon fiber nano-tubes and smart memory mesh.',
      price: 1850.0,
      retailPrice: 1500.0,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&auto=format&fit=crop&q=80',
      gallery: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=650,https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=650',
      sizes: '8,8.5,9,9.5,10,10.5,11,12',
      brand: 'AETHERLABS',
      colorway: 'Carbon/Volt/Cyan',
      releaseDate: '2026-05-12',
      isCryptoExclusive: true,
      categoryId: neonCategory.id,
      stock: 5,
    },
    {
      name: 'NEON VELOCITY V2',
      slug: 'neon-velocity-v2',
      description: 'Built for speed in the metaverse. Programmed with cyber-fluoresce coating that shines with iridescent purple, violet, and electric peach depending on viewing angle.',
      price: 940.0,
      retailPrice: 850.0,
      image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1000&auto=format&fit=crop&q=80',
      gallery: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=650',
      sizes: '7,8,9,10,11',
      brand: 'AETHERLABS',
      colorway: 'HyperPurple/NeonPeach',
      releaseDate: '2026-06-01',
      isCryptoExclusive: false,
      categoryId: neonCategory.id,
      stock: 12,
    },
    {
      name: 'CHRONO MATRIX-BLANC',
      slug: 'chrono-matrix-blanc',
      description: 'Clean. Silent. Timeless. White premium calf-skin styled digitally with micro-brushed titanium clips and a smart self-lacing mechanism.',
      price: 1420.0,
      retailPrice: 1200.0,
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1000&auto=format&fit=crop&q=80',
      gallery: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=650',
      sizes: '9,9.5,10,10.5,11,11.5',
      brand: 'CHRONO',
      colorway: 'Alabaster White/Brushed Metal',
      releaseDate: '2026-04-20',
      isCryptoExclusive: false,
      categoryId: minimalCategory.id,
      stock: 8,
    },
    {
      name: 'GLITCH SHADOW SILHOUETTE',
      slug: 'glitch-shadow-silhouette',
      description: 'An elite stealth model with anti-detection mesh. Standard shadows distort with a subtle VHS static noise pattern, rendering the wearer practically invisible in digital maps.',
      price: 2100.0,
      retailPrice: 1950.0,
      image: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=1000&auto=format&fit=crop&q=80',
      gallery: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=650',
      sizes: '8,9,10,11',
      brand: 'CHRONO',
      colorway: 'Vanta Black/Static Gray',
      releaseDate: '2026-06-15',
      isCryptoExclusive: true,
      categoryId: minimalCategory.id,
      stock: 3,
    },
    {
      name: 'EXO SHIELD FORTRESS',
      slug: 'exo-shield-fortress',
      description: 'Heavily armored digital boots featuring hard-angled carbon shield guards. Protects avatar integrity in high-risk cyberspace zones while keeping a high-end streetwear aesthetic.',
      price: 2750.0,
      retailPrice: 2500.0,
      image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1000&auto=format&fit=crop&q=80',
      gallery: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=650',
      sizes: '8,9,10,11,12',
      brand: 'EXO_ARMOR',
      colorway: 'Iron Ore/Acid Orange',
      releaseDate: '2026-05-30',
      isCryptoExclusive: false,
      categoryId: brutalistCategory.id,
      stock: 4,
    },
    {
      name: 'TITAN CARAPACE-01',
      slug: 'titan-carapace-01',
      description: 'An experimental brutalist sneaker inspired by robotic exoskeletons and high-tensile hydraulics. High stability, zero gravity simulation presets.',
      price: 3100.0,
      retailPrice: 2900.0,
      image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1000&auto=format&fit=crop&q=80',
      gallery: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=650,https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=650',
      sizes: '9,10,11',
      brand: 'EXO_ARMOR',
      colorway: 'Raw Steel/Neon Green',
      releaseDate: '2026-06-18',
      isCryptoExclusive: true,
      categoryId: brutalistCategory.id,
      stock: 2,
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  // Create standard admin and user accounts
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Admin user
  await prisma.user.create({
    data: {
      email: 'admin@sneakerverse.com',
      password: hashedPassword,
      name: 'Admin Sneakerhead',
      role: 'ADMIN',
      isVerified: true,
    },
  });

  // Regular user
  const regularUser = await prisma.user.create({
    data: {
      email: 'user@gmail.com',
      password: hashedPassword,
      name: 'Kalvo Junikrosh',
      role: 'USER',
      isVerified: true,
    },
  });

  // Create default address for user
  await prisma.address.create({
    data: {
      userId: regularUser.id,
      title: 'Home (Metacity-01)',
      street: '404 Neon Boulevard, Sector 9',
      city: 'Neo Tokyo',
      state: 'Kanto',
      postalCode: '100-0001',
      country: 'Japan',
      isDefault: true,
    },
  });

  // Create Virtual Drops
  const drops = [
    {
      name: 'HYPER PULSE V3 EXTREME',
      releaseTime: new Date(Date.now() + 1000 * 60 * 45), // 45 seconds/minutes from now
      price: 2400.0,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
      brand: 'AETHERLABS',
      supply: 50,
      description: 'Ultra-exclusive, photon sound-reactive drops. Released in a minute-run virtual lobby. Max 1 per avatar.',
    },
    {
      name: 'EXO-SLATE ZERO GRAVITY',
      releaseTime: new Date(Date.now() + 1000 * 60 * 60 * 4), // 4 hours from now
      price: 3600.0,
      image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80',
      brand: 'EXO_ARMOR',
      supply: 20,
      description: 'Brutalist zero gravity magnetic plate attachments. Zero acceleration weight drop.',
    },
  ];

  for (const drop of drops) {
    await prisma.virtualDrop.create({
      data: drop,
    });
  }

  console.log('Database seeding complete!');
}
