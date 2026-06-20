import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'sneakerverse_ultra_secret_cyber_security_key_2026';

export async function register(req: any, res: Response) {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1d' });

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        isVerified: true, // Auto-verified for instant perfect UX in sandbox, but token stored
        verificationToken,
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error occurred during registration' });
  }
}

export async function login(req: any, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error occurred during login' });
  }
}

export async function googleLogin(req: any, res: Response) {
  try {
    const { email, googleId, name, imageUrl } = req.body;

    if (!email || !googleId) {
      res.status(400).json({ error: 'Email and Google ID are required' });
      return;
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create user
      const randomPassword = Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || email.split('@')[0],
          googleId,
          isVerified: true,
        },
      });
    } else if (!user.googleId) {
      // Connect count
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId },
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Google Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error occurred during Google login' });
  }
}

export async function forgotPassword(req: any, res: Response) {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Standard practice: don't reveal if user exists
      res.status(200).json({ message: 'If user exists, a password reset link has been sent.' });
      return;
    }

    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetTokenExpires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires,
      },
    });

    res.status(200).json({
      message: 'Password reset token generated successfully',
      resetToken, // Returned in API directly so we can test the flow easily in front-end
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error occurred during forgot password' });
  }
}

export async function resetPassword(req: any, res: Response) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      res.status(400).json({ error: 'Token and new password are required' });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      res.status(400).json({ error: 'Reset token is invalid or has expired' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error resetting password' });
  }
}

export async function getProfile(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        addresses: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isVerified: user.isVerified,
      addresses: user.addresses,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error fetching profile' });
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authorized' });
      return;
    }

    const { name, email, password } = req.body;
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
    });

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error updating profile' });
  }
}
