const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');

const EndpointTestHelper = require('../../../../tests/EndpointTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
  let accessToken;
  let userId;
  const threadId = 'thread-123';
  const commentId = 'comment-123';

  beforeEach(async () => {
    const data = await EndpointTestHelper.getAccessTokenAndUserIdHelper();
    accessToken = data.accessToken;
    userId = data.userId;

    await ThreadsTableTestHelper.addThread({
      id: threadId,
      title: 'thread-title',
      body: 'thread-body',
      owner: userId,
    });
    await CommentsTableTestHelper.addComment({
      id: commentId,
      thread_id: threadId,
      content: 'comment-content',
      owner: userId,
    });
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await EndpointTestHelper.cleanTables();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and persisted reply', async () => {
      const requestPayload = {
        content: 'reply-content',
      };

      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
      expect(responseJson.data.addedReply).toHaveProperty('id');
      expect(responseJson.data.addedReply).toHaveProperty('content', requestPayload.content);
      expect(responseJson.data.addedReply).toHaveProperty('owner', userId);
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const requestPayload = {};
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat balasan baru karena properti yang dibutuhkan tidak ada',
      );
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      const requestPayload = {
        content: true,
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat balasan baru karena tipe data tidak sesuai',
      );
    });

    it('should response 401 when access token not provided', async () => {
      const requestPayload = {
        content: 'reply-content',
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200 when reply successfully deleted', async () => {
      const replyId = 'reply-123';
      await RepliesTableTestHelper.addReply({
        id: replyId,
        comment_id: commentId,
        content: 'reply-content',
        owner: userId,
      });

      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 401 when access token not provided', async () => {
      const replyId = 'reply-123';
      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 403 when not authorized', async () => {
      const differentUserId = 'user-456';

      await UsersTableTestHelper.addUser({
        id: differentUserId,
        username: 'lamineyamal',
        password: 'supersecretpassword',
        fullname: 'Lamine Yamal',
      });

      const replyId = 'reply-123';
      await RepliesTableTestHelper.addReply({
        id: replyId,
        comment_id: commentId,
        content: 'reply-content',
        owner: differentUserId,
      });

      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.message).toEqual('anda tidak memiliki akses terhadap balasan ini');
    });

    it('should response 404 when reply not found', async () => {
      const replyId = 'reply-xxx';
      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.message).toEqual('balasan tidak ditemukan');
    });
  });
});
