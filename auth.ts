import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export interface TokenPayload {
  businessId: string;
  email: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getAuthBusiness() {
  const cookieStore = cookies();
  const token = cookieStore.get('avizio-token')?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const business = await prisma.business.findUnique({
    where: { id: payload.businessId },
  });

  return business;
}
