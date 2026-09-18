import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../../config/prisma';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/token.util';

const REFRESH_TOKEN_EXPIRES_MS = 30 * 24 * 60 * 60 * 1000;

export async function loginAdmin(email: string, password: string) {
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) throw new Error('Invalid credentials');

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) throw new Error('Invalid credentials');

  const accessToken = signAccessToken({ adminId: admin.id, email: admin.email });
  const refreshToken = signRefreshToken({ adminId: admin.id });
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

  await prisma.refreshToken.create({
    data: {
      tokenHash,
      adminId: admin.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS),
    },
  });

  return { accessToken, refreshToken, admin: { id: admin.id, email: admin.email } };
}

export async function refreshAccessToken(refreshToken: string) {
  let payload: { adminId: string };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new Error('INVALID_REFRESH_TOKEN');
  }

  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw new Error('INVALID_REFRESH_TOKEN');
  }

  if (stored.adminId !== payload.adminId) {
    throw new Error('INVALID_REFRESH_TOKEN');
  }

  const admin = await prisma.admin.findUnique({ where: { id: payload.adminId } });
  if (!admin) throw new Error('INVALID_REFRESH_TOKEN');

  const newAccessToken = signAccessToken({ adminId: admin.id, email: admin.email });
  return { accessToken: newAccessToken, admin: { id: admin.id, email: admin.email } };
}

export async function logoutAdmin(refreshToken?: string): Promise<void> {
  if (!refreshToken) return;
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  await prisma.refreshToken.updateMany({
    where: { tokenHash },
    data: { revoked: true },
  });
}

export async function getAdminById(id: string) {
  return prisma.admin.findUnique({
    where: { id },
    select: { id: true, email: true, createdAt: true },
  });
}

export async function changePassword(
  adminId: string,
  currentPassword: string,
  newPassword: string
) {
  const admin = await prisma.admin.findUnique({ where: { id: adminId } });
  if (!admin) throw new Error('ADMIN_NOT_FOUND');

  const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!valid) throw new Error('INVALID_CURRENT_PASSWORD');

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.admin.update({
    where: { id: adminId },
    data: { passwordHash },
  });

  // Revoke all previous refresh tokens for security
  await prisma.refreshToken.updateMany({
    where: { adminId },
    data: { revoked: true },
  });

  // Issue new session tokens
  const accessToken = signAccessToken({ adminId: admin.id, email: admin.email });
  const refreshToken = signRefreshToken({ adminId: admin.id });
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

  await prisma.refreshToken.create({
    data: {
      tokenHash,
      adminId: admin.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS),
    },
  });

  return { accessToken, refreshToken };
}
