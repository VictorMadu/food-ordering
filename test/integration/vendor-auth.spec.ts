import {
  Configuration,
  SettingTestApi,
  DatabaseTestApi,
  VendorApi,
  JwtToken,
  AccountVerificationApi,
} from 'tmp/sdk';

describe('Vendor Auth', () => {
  const configuration = new Configuration();
  const settingTestApi = new SettingTestApi(configuration);
  const databaseTestApi = new DatabaseTestApi(configuration);
  const vendorApi = new VendorApi(configuration);
  const accountVerificationApi = new AccountVerificationApi(configuration);

  const email = 'vendor@gmail.com';
  const password = 'TestPassword123$';
  const otp = '123456';
  const verificationType = 'VENDOR';

  beforeEach(async () => {
    await databaseTestApi.databaseTestControllerResetDb();
    await settingTestApi.settingTestControllerSetTestOtp(otp);
  });

  test('Happy Path - Registration and Authentication', async () => {
    let isOk: boolean;
    let jwtToken: JwtToken;

    isOk = await vendorApi.vendorControllerRegister({ email, password }).then(() => true);

    expect(isOk).toBe(true);

    isOk = await accountVerificationApi
      .accountVerificationControllerInitializeForSuperAdmin({ email, verificationType })
      .then(() => true);
    expect(isOk).toBe(true);

    jwtToken = await accountVerificationApi
      .accountVerificationControllerVerifyAccount({ email, otp, verificationType })
      .then((resp) => resp.data);

    expect(jwtToken).not.toBe(null);

    jwtToken = await vendorApi.vendorControllerLogin({ email, password }).then((resp) => resp.data);
    expect(jwtToken).not.toBe(null);
  });

  test('Sad Path - Invalid Email during Registration', async () => {
    const invalidEmail = 'vendor';

    const errReason = await vendorApi
      .vendorControllerRegister({ email: invalidEmail, password })
      .catch((err) => err.response.data.reason);

    expect(errReason).toBe('VALIDATION_ERROR');
  });

  test('Sad Path - Wrong otp during Verification', async () => {
    const wrongOtp = '123455';

    await vendorApi.vendorControllerRegister({ email, password });
    await accountVerificationApi.accountVerificationControllerInitializeForSuperAdmin({
      email,
      verificationType,
    });
    const errReason = await accountVerificationApi
      .accountVerificationControllerVerifyAccount({
        email,
        otp: wrongOtp,
        verificationType,
      })
      .catch((err) => err.response.data.reason);

    expect(errReason).toBe('INVALID_OTP');
  });

  test('Sad Path - No initialization of account verification', async () => {
    await vendorApi.vendorControllerRegister({ email, password });

    const errReason = await accountVerificationApi
      .accountVerificationControllerVerifyAccount({ email, otp, verificationType })
      .catch((err) => err.response.data.reason);

    expect(errReason).toBe('NOT_FOUND');
  });

  test('Sad Path - Wrong Email or Password', async () => {
    const wrongEmail = 'vendo2r@gmail.com';
    const wrongPassword = 'TestPassword1233';

    await vendorApi.vendorControllerRegister({ email, password });
    await accountVerificationApi.accountVerificationControllerInitializeForSuperAdmin({
      email,
      verificationType,
    });
    await accountVerificationApi.accountVerificationControllerVerifyAccount({
      email,
      otp,
      verificationType,
    });

    let errReason: string;

    errReason = await vendorApi
      .vendorControllerLogin({ email: wrongEmail, password })
      .catch((err) => err.response.data.reason);
    expect(errReason).toBe('WRONG_LOGIN');

    errReason = await vendorApi
      .vendorControllerLogin({ email, password: wrongPassword })
      .catch((err) => err.response.data.reason);
    expect(errReason).toBe('WRONG_LOGIN');
  });

  test('Sad Path - Verification Initialization with wrong verification type', async () => {
    const wrongVerificationType = 'ADMIN';

    await vendorApi.vendorControllerRegister({ email, password });
    const errReason = await accountVerificationApi
      .accountVerificationControllerInitializeForSuperAdmin({
        email,
        verificationType: wrongVerificationType,
      })
      .catch((err) => err.response.data.reason);

    expect(errReason).toBe('NOT_UNVERIFIED');
  });
});
