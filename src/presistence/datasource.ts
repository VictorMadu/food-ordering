import { Setting } from 'src/setting';
import { DataSource } from 'typeorm';

const dataSource = new DataSource({
  type: 'postgres',
  host: Setting.db.host,
  port: Setting.db.port,
  username: Setting.db.username,
  password: Setting.db.password,
  database: Setting.db.database,
  poolSize: Setting.db.poolSize,
  ssl: Setting.db.ssl,
  synchronize: Setting.db.synchronize,
  migrationsRun: !Setting.db.synchronize,
  migrationsTableName: Setting.db.migrationTableName ?? 'migrations_TypeORM',
  useUTC: true,
  migrations: [],
  entities: ['dist/**/*.entity.js'],
  subscribers: ['dist/**/*.subscriber.js', 'dist/**/*.controller.js'],
});

dataSource.initialize();

export default dataSource;
