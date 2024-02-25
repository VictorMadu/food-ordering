import {
  Configuration,
  DatabaseTestApi,
  SettingTestApi,
  SuperAdminApi,
  VendorApi,
  JwtToken,
} from 'tmp/sdk';

describe('Account', () => {
  const configuration = new Configuration();
  const settingTestApi = new SettingTestApi(configuration);
  const databaseTestApi = new DatabaseTestApi(configuration);
  const superAdminApi = new SuperAdminApi(configuration);
  const vendorApi = new VendorApi(configuration);

  beforeEach(async () => {
    await databaseTestApi.databaseTestControllerResetDb();
  });

  test('Admin Account Registration Process', async () => {
    const email = 'superadmin@foodordering.com';
    const password = 'TestPassword123$';
    const otp = '123456';

    await settingTestApi.settingTestControllerSetAdminEmail(email);
    await settingTestApi.settingTestControllerSetTestOtp(otp);

    let isOk: boolean;

    isOk = await superAdminApi.superAdminControllerRegister({ email, password }).then(() => true);

    expect(isOk).toBe(true);

    isOk = await superAdminApi
      .superAdminControllerInitializeAccountVerification({ email })
      .then(() => true);
    expect(isOk).toBe(true);

    const jwtToken = await superAdminApi
      .superAdminControllerVerifyAccount({ email, otp })
      .then((resp) => resp.data);

    expect(jwtToken).not.toBe(null);
  });

  test('Vendor Account Registration Process', async () => {
    const email = 'vendor@gmail.com';
    const password = 'TestPassword123$';
    const otp = '123456';

    await settingTestApi.settingTestControllerSetTestOtp(otp);

    let isOk: boolean;
    let jwtToken: JwtToken;

    isOk = await vendorApi.vendorControllerRegister({ email, password }).then(() => true);

    expect(isOk).toBe(true);

    isOk = await vendorApi
      .vendorControllerInitializeAccountVerification({ email })
      .then(() => true);
    expect(isOk).toBe(true);

    jwtToken = await vendorApi
      .vendorControllerVerifyAccount({ email, otp })
      .then((resp) => resp.data);

    expect(jwtToken).not.toBe(null);
  });

  test('Vendor Account Registration - Bad Email', async () => {
    const email = 'vendor';
    const password = 'TestPassword123$';

    const errReason = await vendorApi
      .vendorControllerRegister({ email, password })
      .catch((err) => err.response.data.reason);

    expect(errReason).toBe('VALIDATION_ERROR');
  });
});
