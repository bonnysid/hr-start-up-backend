import express from 'express';
import mongoose from 'mongoose';
import AuthRouter from './routers/AuthRouter';
import AdminRouter from './routers/AdminRouter';
import UserRouter from './routers/UserRouter';
import { config } from './config';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerDoc from './swagger.json';

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors({
  credentials: true,
  origin: process.env.CLIENT_URL
}));
app.use(express.json());
app.use(cookieParser());
app.use('/auth', AuthRouter);
app.use('/admin', AdminRouter);
app.use('/users', UserRouter);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc))

const start = async () => {
  try {
    await mongoose.connect(config.dbUrl)
    app.listen(PORT, () => {
      console.log(`server started on port ${PORT}`)
    });
  } catch (e) {
    console.log(e);
  }
}

start();
