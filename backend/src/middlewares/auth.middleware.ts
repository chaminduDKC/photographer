import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/token.util';
import { errorResponse } from '../utils/response.util';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.accessToken as string | undefined;

  if (!token) {
    errorResponse(res, 'Access token missing or expired', 401, 'TOKEN_EXPIRED');
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.admin = { id: payload.adminId, email: payload.email };
    next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      errorResponse(res, 'Token expired', 401, 'TOKEN_EXPIRED');
    } else if (err instanceof JsonWebTokenError) {
      errorResponse(res, 'Invalid token', 401, 'UNAUTHORIZED');
    } else {
      next(err);
    }
  }
}
