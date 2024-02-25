import { UseGuards, Controller, Post } from '@nestjs/common';
import { ApiExcludeController, ApiTags } from '@nestjs/swagger';
import { Setting } from 'src/setting';
import { TestPurposeGuard } from './common/auth.guard';
import dataSource from 'src/presistence/datasource';

@ApiTags('Database Test')
@ApiExcludeController(Setting.env === 'production')
@UseGuards(TestPurposeGuard)
@Controller('api/test/database')
export class DatabaseTestController {
  @Post('reset-db')
  async resetDb(): Promise<void> {
    const entities = dataSource.entityMetadatas;

    const tableNames = [...new Set(entities.map((entity) => `"${entity.tableName}"`))].join(', ');

    try {
      await dataSource.query(`TRUNCATE ${tableNames} CASCADE;`);
    } catch (error) {
      console.log('ERROR: ', error);
    }
  }
}
