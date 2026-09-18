import { Request, Response, NextFunction } from 'express';
import { loginSchema } from './auth.schema';
import * as authService from './auth.service';
import { successResponse, errorResponse } from '../../utils/response.util';
import { env } from '../../config/env';

const IS_PROD = env.NODE_ENV === 'production';

const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: IS_PROD ? ('none' as const) : ('lax' as const),
  path: '/',
  maxAge: 15 * 60 * 1000,
};

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: IS_PROD ? ('none' as const) : ('lax' as const),
  path: '/',
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

const CLEAR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: IS_PROD ? ('none' as const) : ('lax' as const),
  path: '/',
};

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const { accessToken, refreshToken, admin } = await authService.loginAdmin(email, password);

    res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    successResponse(res, { admin }, 'Login successful');
  } catch (err) {
    if (err instanceof Error && err.message === 'Invalid credentials') {
      errorResponse(res, 'Invalid email or password', 401);
      return;
    }
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const refreshToken = req.cookies?.refreshToken as string | undefined;
    if (!refreshToken) {
      res.clearCookie('accessToken', CLEAR_COOKIE_OPTIONS);
      res.clearCookie('refreshToken', CLEAR_COOKIE_OPTIONS);
      errorResponse(res, 'Refresh token missing', 401, 'REFRESH_FAILED');
      return;
    }

    const { accessToken, admin } = await authService.refreshAccessToken(refreshToken);
    res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTIONS);
    successResponse(res, { admin }, 'Token refreshed');
  } catch (err) {
    if (err instanceof Error && err.message === 'INVALID_REFRESH_TOKEN') {
      res.clearCookie('accessToken', CLEAR_COOKIE_OPTIONS);
      res.clearCookie('refreshToken', CLEAR_COOKIE_OPTIONS);
      errorResponse(res, 'Session expired, please login again', 401, 'REFRESH_FAILED');
      return;
    }
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const refreshToken = req.cookies?.refreshToken as string | undefined;
    await authService.logoutAdmin(refreshToken);
    res.clearCookie('accessToken', CLEAR_COOKIE_OPTIONS);
    res.clearCookie('refreshToken', CLEAR_COOKIE_OPTIONS);
    successResponse(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const admin = await authService.getAdminById(req.admin!.id);
    if (!admin) {
      errorResponse(res, 'Admin not found', 404);
      return;
    }
    successResponse(res, { admin });
  } catch (err) {
    next(err);
  }
}