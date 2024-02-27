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
  redis: {
    host: process.env.REDIS_HOST,
    port: +process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    userName: process.env.REDIS_USERNAME
  }
  ,
  superAdmin: {
    email: process.env.SUPER_ADMIN_EMAIL,
  },
  server: {
    port: process.env.SERVER_PORT,
  },
  payment: {
    retry: {
      max: +process.env.MAX_PAYMENT_RETRIES,
      delayInMs: +process.env.RETRY_DELAY_IN_MS,
    },
    test: {
      card: {
        successFull: new Set(process.env.TEST_SUCCESSFULL_PAYMENT_CARD.split(',')),
      },
    },
  },
  order: {
    batchIntervalInMs: +process.env.ORDER_BATCH_INTERVAL_IN_MS,
    delivery: {
      maxBatch: +process.env.ORDER_MAX_DELIVERY_BATCH,
      notificationTimeInMs: +process.env.NOTIFICATION_TIME_IN_MS_BEFEORE_DELIVERY,
    },
    earningDisbursement: {
      vendorToAdminSplit: +process.env.ORDER_EARNING_DISBURSEMENT_VENDOR_TO_ADMIN_SPLIT
    }
  },
};
