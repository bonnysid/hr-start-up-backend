import * as dotenv from 'dotenv';
dotenv.config();

const config = {
  secret: process.env.SECRET as string,
  refreshSecret: process.env.REFRESH_SECRET as string,
  dbUrl: process.env.DB_URL as string,
}

export { config };
