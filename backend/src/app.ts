import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler } from './middlewares/error.middleware';
import authRoutes from './modules/auth/auth.routes';
import businessRoutes from './modules/business/business.routes';
import categoryRoutes from './modules/categories/category.routes';
import albumRoutes from './modules/albums/album.routes';
import { getSliderImages } from './modules/images/image.controller';

const app = express();

const allowedOrigins = [
  ...env.ADMIN_ORIGIN.split(',').map((o) => o.trim()),
  ...env.WEBSITE_ORIGIN.split(',').map((o) => o.trim()),
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/albums', albumRoutes);
app.get('/api/images/slider', getSliderImages);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

export default app;
