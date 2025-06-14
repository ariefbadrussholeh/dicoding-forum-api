const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const EndpointTestHelper = require('../../../../tests/EndpointTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');

describe('/threads endpoint', () => {
  let accessToken;
  let userId;

  const thread = {
    id: 'thread-123',
    title: 'thread-content',
    body: 'thread-body',
  };

  const comment = {
    id: 'comment-123',
    thread_id: thread.id,
    content: 'comment-content',
  };

  beforeAll(async () => {
    const data = await EndpointTestHelper.getAccessTokenAndUserIdHelper();
    accessToken = data.accessToken;
    userId = data.userId;

    await ThreadsTableTestHelper.addThread({ ...thread, owner: userId });

    await CommentsTableTestHelper.addComment({ ...comment, owner: userId });
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await EndpointTestHelper.cleanTables();
    await pool.end();
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should return 200 when liking comment', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${thread.id}/comments/${comment.id}/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(await LikesTableTestHelper.countCommentLikes(comment.id)).toBe(1);
    });

    it('should return 200 when unliking comment', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${thread.id}/comments/${comment.id}/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const response2 = await server.inject({
        method: 'PUT',
        url: `/threads/${thread.id}/comments/${comment.id}/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      const responseJson2 = JSON.parse(response2.payload);
      expect(response2.statusCode).toEqual(200);
      expect(responseJson2.status).toEqual('success');
      expect(await LikesTableTestHelper.countCommentLikes(comment.id)).toBe(0);
    });

    it('should return 401 when user is not authenticated', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${thread.id}/comments/${comment.id}/likes`,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should return 404 when thread not exist', async () => {
      const threadId = 'not-found';
      const server = await createServer(container);

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${comment.id}/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.message).toEqual('utas tidak ditemukan');
    });

    it('should return 404 when comment not exist', async () => {
      const commentId = 'not-found';
      const server = await createServer(container);

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${thread.id}/comments/${commentId}/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.message).toEqual('komentar tidak ditemukan');
    });
  });
});
