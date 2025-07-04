const PasswordHash = require('../PasswordHash');

describe('PasswordHash interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    const passwordHash = new PasswordHash();

    expect(passwordHash.hash('dummy_password')).rejects.toThrowError(
      'PASSWORD_HASH.METHOD_NOT_IMPLEMENTED',
    );
    await expect(passwordHash.comparePassword('plain', 'encrypted')).rejects.toThrowError(
      'PASSWORD_HASH.METHOD_NOT_IMPLEMENTED',
    );
  });
});
