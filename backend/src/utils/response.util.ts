import { Response } from 'express';

export function successResponse<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function errorResponse(
  res: Response,
  message: string,
  statusCode = 500,
  code?: string
) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(code && { code }),
  });
}
