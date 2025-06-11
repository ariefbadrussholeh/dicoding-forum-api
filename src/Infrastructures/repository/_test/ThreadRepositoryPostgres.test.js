const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({
      id: 'user-123',
      username: 'ariefbadrussholeh',
      password: 'supersecretpassword',
      fullname: 'Arief Badrus Sholeh',
    });
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist new thread', async () => {
      const newThread = new NewThread({
        title: 'thread-title',
        body: 'thread-body',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      await threadRepositoryPostgres.addThread(newThread);

      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      const newThread = new NewThread({
        title: 'thread-title',
        body: 'thread-body',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      const addedThread = await threadRepositoryPostgres.addThread(newThread);

      expect(addedThread).toStrictEqual({
        id: 'thread-123',
        title: 'thread-title',
        owner: 'user-123',
      });
    });
  });

  describe('verifyThreadExist function', () => {
    it('should throw NotFoundError when thread is not exist', async () => {
      const threadId = 'thread-xxx';

      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      await expect(threadRepositoryPostgres.verifyThreadExist(threadId)).rejects.toThrowError(
        NotFoundError,
      );
    });

    it('should not throw NotFoundError when thread is exist', async () => {
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'thread-title',
        body: 'thread-body',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      await expect(
        threadRepositoryPostgres.verifyThreadExist('thread-123'),
      ).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('getThreadById function', () => {
    it('should return thread correctly', async () => {
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'thread-title',
        body: 'thread-body',
        owner: 'user-123',
        date: new Date('2025-06-11T07:22:33.555Z'),
      });

      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      const thread = await threadRepositoryPostgres.getThreadById('thread-123');

      expect(thread).toHaveProperty('id', 'thread-123');
      expect(thread).toHaveProperty('title', 'thread-title');
      expect(thread).toHaveProperty('body', 'thread-body');
      expect(thread).toHaveProperty('date', new Date('2025-06-11T07:22:33.555Z'));
      expect(thread).toHaveProperty('username', 'ariefbadrussholeh');
    });
  });
});
