import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './src/routes/index.js';
import { apiRateLimiter } from './src/middlewares/rateLimiter.js';
import { errorHandler } from './src/middlewares/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Bloqueado pela política CORS.'));
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use('/api', apiRateLimiter, routes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`FinanGestor API v2 rodando na porta ${PORT}`);
});
