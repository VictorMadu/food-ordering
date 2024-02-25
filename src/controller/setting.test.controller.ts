import { UseGuards, Controller, Delete, Param, Post } from '@nestjs/common';
import { ApiExcludeController, ApiTags } from '@nestjs/swagger';
import { Setting } from 'src/setting';
import { TestPurposeGuard } from './common/auth.guard';

@ApiTags('Setting Test')
@ApiExcludeController(Setting.env === 'production')
@UseGuards(TestPurposeGuard)
@Controller('api/test/setting')
export class SettingTestController {
  @Post('super-admin/:email')
  async setAdminEmail(@Param('email') email: string): Promise<void> {
    Setting.superAdmin.email = email;
  }

  @Post('test-otp/:otp')
  async setTestOtp(@Param('otp') otp: string): Promise<void> {
    Setting.verification.testOtp = otp;
  }

  @Delete('test-otp')
  async deleteTestOtp(): Promise<void> {
    Setting.verification.testOtp = null;
  }
}
