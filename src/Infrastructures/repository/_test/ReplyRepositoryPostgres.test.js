const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('ReplyRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({
      id: 'user-123',
      username: 'ariefbadrussholeh',
      password: 'supersecretpassword',
      fullname: 'Arief Badrus Sholeh',
    });
    await ThreadsTableTestHelper.addThread({
      id: 'thread-123',
      title: 'thread-title',
      body: 'thread-body',
      owner: 'user-123',
    });
    await CommentsTableTestHelper.addComment({
      id: 'comment-123',
      thread_id: 'thread-123',
      content: 'reply-content',
      owner: 'user-123',
    });
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist new reply and return added reply correctly', async () => {
      const newReply = new NewReply({
        commentId: 'comment-123',
        content: 'reply-content',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      await replyRepositoryPostgres.addReply(newReply);

      const reply = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(reply).toHaveLength(1);
    });

    it('should return added reply correctly', async () => {
      const newReply = new NewReply({
        commentId: 'comment-123',
        content: 'reply-content',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      const addedReply = await replyRepositoryPostgres.addReply(newReply);

      expect(addedReply).toStrictEqual({
        id: 'reply-123',
        content: 'reply-content',
        owner: 'user-123',
      });
    });
  });

  describe('verifyReplyExist function', () => {
    it('should throw NotFoundError when reply is not exist', async () => {
      const replyId = 'reply-xxx';

      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      await expect(replyRepositoryPostgres.verifyReplyExist(replyId)).rejects.toThrowError(
        NotFoundError,
      );
    });

    it('should not throw NotFoundError when reply is exist', async () => {
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        comment_id: 'comment-123',
        content: 'reply-content',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      await expect(replyRepositoryPostgres.verifyReplyExist('reply-123')).resolves.not.toThrowError(
        NotFoundError,
      );
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw AuthorizationError when record with replyId and userId is not exist', async () => {
      const replyId = 'reply-xxx';
      const userId = 'user-xxx';

      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      await expect(
        replyRepositoryPostgres.verifyReplyOwner({ replyId, userId }),
      ).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when record with replyId and userId is exist', async () => {
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        comment_id: 'comment-123',
        content: 'reply-content',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      await expect(
        replyRepositoryPostgres.verifyReplyOwner({
          replyId: 'reply-123',
          userId: 'user-123',
        }),
      ).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('getRepliesByCommentId function', () => {
    it('should return replies correctly', async () => {
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        comment_id: 'comment-123',
        content: 'reply-content',
        owner: 'user-123',
        date: new Date('2025-06-11T07:22:33.555Z'),
        is_deleted: false,
      });

      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      const replies = await replyRepositoryPostgres.getRepliesByCommentId('comment-123');

      expect(replies).toHaveLength(1);

      expect(replies[0]).toHaveProperty('id', 'reply-123');
      expect(replies[0]).toHaveProperty('username', 'ariefbadrussholeh');
      expect(replies[0]).toHaveProperty('date', new Date('2025-06-11T07:22:33.555Z'));
      expect(replies[0]).toHaveProperty('content', 'reply-content');
      expect(replies[0]).toHaveProperty('is_deleted', false);
    });
  });

  describe('deleteReplyById function', () => {
    it('should delete reply correctly', async () => {
      const replyId = 'reply-123';
      await RepliesTableTestHelper.addReply({
        id: replyId,
        comment_id: 'comment-123',
        content: 'comment-content',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      await replyRepositoryPostgres.deleteReplyById(replyId);

      const result = await RepliesTableTestHelper.findReplyById(replyId);
      expect(result[0]).toHaveProperty('is_deleted', true);
    });
  });
});
