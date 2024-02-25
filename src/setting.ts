import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

export enum Env {
  PRODUCTION = 'production',
  DEVELOPMENT = 'development',
}

const env: Env = process.env.ENVIRONMENT as Env;

if (!Object.values(Env).includes(env)) {
  throw new Error();
}

export const Setting = {
  env,
  verification: {
    durationInSeconds: +process.env.VERIFICATION_DURATION_TIME_IN_SECONDS,
    testOtp: null as null | string,
  },
  auth: {
    jwt: {
      secretKey: process.env.AUTH_JWT_SECRET_KEY,
      durationInSeconds: +process.env.AUTH_JWT_DURATION_TIME_IN_SECONDS,
    },
  },
  db: {
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    poolSize: +process.env.DB_POOL,
    ssl: env === 'production' || process.env.DB_SSL === 'true',
    synchronize: env !== 'production' && process.env.DB_SYNCHRONIZE === 'true',
    migrationTableName: process.env.MIGRATION_TABLE_NAME ?? 'migrations_TypeORM',
  },
  superAdmin: {
    email: process.env.SUPER_ADMIN_EMAIL,
  },
  server: {
    port: process.env.SERVER_PORT,
  },
};
