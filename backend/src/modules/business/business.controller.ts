import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as businessService from './business.service';
import { successResponse } from '../../utils/response.util';

const businessSchema = z.object({
  phone1: z.string().min(1),
  phone2: z.string().optional(),
  whatsapp: z.string().optional(),
  address: z.string().min(1),
  city: z.string().min(1),
  province: z.string().min(1),
});

export async function getBusinessInfo(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const info = await businessService.getBusinessInfo();
    successResponse(res, info);
  } catch (err) {
    next(err);
  }
}

export async function updateBusinessInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = businessSchema.parse(req.body);
    const info = await businessService.upsertBusinessInfo(data);
    successResponse(res, info, 'Business info updated');
  } catch (err) {
    next(err);
  }
}
