const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const EndpointTestHelper = require('../../../../tests/EndpointTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

describe('/threads/{threadId}/comments endpoint', () => {
  let accessToken;
  let userId;
  const threadId = 'thread-123';

  beforeEach(async () => {
    const data = await EndpointTestHelper.getAccessTokenAndUserIdHelper();
    accessToken = data.accessToken;
    userId = data.userId;

    await ThreadsTableTestHelper.addThread({
      id: threadId,
      title: 'thread-title',
      body: 'thread-body',
      owner: data.userId,
    });
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await EndpointTestHelper.cleanTables();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
      const requestPayload = {
        content: 'comment-content',
      };

      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment).toHaveProperty('id');
      expect(responseJson.data.addedComment).toHaveProperty('content', requestPayload.content);
      expect(responseJson.data.addedComment).toHaveProperty('owner', userId);
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const requestPayload = {};
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat komentar baru karena properti yang dibutuhkan tidak ada',
      );
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      const requestPayload = {
        content: true,
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat komentar baru karena tipe data tidak sesuai',
      );
    });

    it('should response 401 when access token not provided', async () => {
      const requestPayload = {
        content: 'comment-content',
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 when comment successfully deleted', async () => {
      const commentId = 'comment-123';
      await CommentsTableTestHelper.addComment({
        id: commentId,
        thread_id: threadId,
        content: 'comment-content',
        owner: userId,
      });

      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 401 when access token not provided', async () => {
      const commentId = 'comment-123';
      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 403 when not authorized', async () => {
      const otherUserId = 'user-456';

      await UsersTableTestHelper.addUser({
        id: otherUserId,
        username: 'lamineyamal',
        password: 'supersecretpassword',
        fullname: 'Lamine Yamal',
      });

      const commentId = 'comment-123';
      await CommentsTableTestHelper.addComment({
        id: commentId,
        thread_id: threadId,
        content: 'comment-content',
        owner: otherUserId,
      });

      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.message).toEqual('anda tidak memiliki akses terhadap komentar ini');
    });

    it('should response 404 when comment not found', async () => {
      const commentId = 'comment-xxx';
      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.message).toEqual('komentar tidak ditemukan');
    });
  });
});
