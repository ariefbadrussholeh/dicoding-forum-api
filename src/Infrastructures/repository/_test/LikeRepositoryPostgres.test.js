const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');

describe('LikeRepositoryPostgres', () => {
  const user1 = {
    id: 'user-123',
    username: 'ariefbadrussholeh',
    password: 'supersecretpassword',
    fullname: 'Arief Badrus Sholeh',
  };

  const user2 = {
    id: 'user-456',
    username: 'lamineyamal',
    password: 'supersecretpassword',
    fullname: 'Lamine Yamal',
  };

  const thread = {
    id: 'thread-123',
    title: 'thread-content',
    body: 'thread-body',
    owner: 'user-123',
  };

  const comment = {
    id: 'comment-123',
    thread_id: 'thread-123',
    content: 'comment-content',
    owner: 'user-123',
  };

  beforeAll(async () => {
    await UsersTableTestHelper.addUser(user1);
    await UsersTableTestHelper.addUser(user2);

    await ThreadsTableTestHelper.addThread(thread);

    await CommentsTableTestHelper.addComment(comment);
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('hasLikedComment function', () => {
    it('should return true if user has liked the comment', async () => {
      await LikesTableTestHelper.addLike({
        id: 'like-123',
        commentId: comment.id,
        userId: user1.id,
        date: new Date(),
      });

      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      const result = await likeRepositoryPostgres.hasLikedComment({
        commentId: comment.id,
        userId: user1.id,
      });

      expect(result).toBe(true);
    });

    it('should return false if user has not liked the comment', async () => {
      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      const result = await likeRepositoryPostgres.hasLikedComment({
        commentId: comment.id,
        userId: user1.id,
      });

      expect(result).toBe(false);
    });
  });

  describe('likeComment function', () => {
    it('should persist new like correctly', async () => {
      const likePayload = {
        commentId: comment.id,
        userId: user1.id,
      };

      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      await likeRepositoryPostgres.likeComment(likePayload);

      const like = await LikesTableTestHelper.findLikeById('like-123');
      expect(like).toHaveLength(1);
    });
  });

  describe('unlikeComment function', () => {
    it('should delete like correctly', async () => {
      const likePayload = {
        id: 'like-123',
        commentId: comment.id,
        userId: user1.id,
        date: new Date(),
      };

      await LikesTableTestHelper.addLike(likePayload);

      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      await likeRepositoryPostgres.unlikeComment(likePayload);

      const like = await LikesTableTestHelper.findLikeById(likePayload.id);
      expect(like).toHaveLength(0);
    });
  });

  describe('countCommentLikes function', () => {
    it('should count likes correctly', async () => {
      const likePayload = {
        id: 'like-123',
        commentId: comment.id,
        userId: user1.id,
        date: new Date(),
      };

      const likePayload2 = {
        id: 'like-456',
        commentId: comment.id,
        userId: user2.id,
        date: new Date(),
      };

      await LikesTableTestHelper.addLike(likePayload);
      await LikesTableTestHelper.addLike(likePayload2);

      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      const count = await likeRepositoryPostgres.countCommentLikes(comment.id);

      // Assert
      expect(count).toBe(2);
    });
  });
});
