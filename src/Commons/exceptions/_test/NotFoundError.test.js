const NotFoundError = require('../NotFoundError');
const ClientError = require('../ClientError');

describe('NotFoundError', () => {
  it('should create NotFoundError correctly', () => {
    const notFoundError = new NotFoundError('not found!');

    expect(notFoundError).toBeInstanceOf(NotFoundError);
    expect(notFoundError).toBeInstanceOf(ClientError);
    expect(notFoundError).toBeInstanceOf(Error);

    expect(notFoundError.statusCode).toEqual(404);
    expect(notFoundError.message).toEqual('not found!');
    expect(notFoundError.name).toEqual('NotFoundError');
  });
});
