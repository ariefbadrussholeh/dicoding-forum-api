const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const EndpointTestHelper = require('../../../../tests/EndpointTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');

describe('/threads endpoint', () => {
  let accessToken;
  let userId;

  beforeAll(async () => {
    const data = await EndpointTestHelper.getAccessTokenAndUserIdHelper();
    accessToken = data.accessToken;
    userId = data.userId;
  });

  afterEach(async () => {
    await EndpointTestHelper.cleanTables();
  });

  afterAll(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      const requestPayload = {
        title: 'thread-title',
        body: 'thread-body',
      };

      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread).toHaveProperty('id');
      expect(responseJson.data.addedThread).toHaveProperty('title', requestPayload.title);
      expect(responseJson.data.addedThread).toHaveProperty('owner', userId);
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const requestPayload = {
        title: 'thread-title',
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat utas baru karena properti yang dibutuhkan tidak ada',
      );
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      const requestPayload = {
        title: 'thread-title',
        body: true,
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat membuat utas baru karena tipe data tidak sesuai',
      );
    });

    it('should response 401 when access token not provided', async () => {
      const requestPayload = {
        title: 'thread-title',
        body: 'thread-body',
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 when request valid', async () => {
      const userData1 = {
        id: 'user-123',
        username: 'ariefbadrussholeh',
        password: 'supersecretpassword',
        fullname: 'Arief Badrus Sholeh',
      };
      await UsersTableTestHelper.addUser(userData1);

      const userData2 = {
        id: 'user-456',
        username: 'lamineyamal',
        password: 'supersecretpassword',
        fullname: 'Arief Badrus Sholeh',
      };
      await UsersTableTestHelper.addUser(userData2);

      const threadData = {
        id: 'thread-123',
        title: 'thread-title',
        body: 'thread-body',
        owner: userData1.id,
        date: new Date('2025-06-11T07:22:33.555Z'),
      };
      await ThreadsTableTestHelper.addThread(threadData);

      const commentData1 = {
        id: 'comment-123',
        thread_id: threadData.id,
        content: 'comment-content',
        date: new Date('2025-06-11T07:22:33.555Z'),
        owner: userData1.id,
      };
      await CommentsTableTestHelper.addComment(commentData1);

      const commentData2 = {
        id: 'comment-456',
        thread_id: threadData.id,
        content: 'comment-content',
        date: new Date('2025-06-11T07:22:33.555Z'),
        owner: userData2.id,
        is_deleted: true,
      };
      await CommentsTableTestHelper.addComment(commentData2);

      const replyData1 = {
        id: 'reply-123',
        comment_id: commentData1.id,
        content: 'reply-content',
        date: new Date('2025-06-11T07:22:33.555Z'),
        owner: userData1.id,
      };
      await RepliesTableTestHelper.addReply(replyData1);

      const replyData2 = {
        id: 'reply-456',
        comment_id: commentData1.id,
        content: 'reply-content',
        date: new Date('2025-06-11T07:22:33.555Z'),
        owner: userData2.id,
        is_deleted: true,
      };
      await RepliesTableTestHelper.addReply(replyData2);

      await LikesTableTestHelper.addLike({
        id: 'like-123',
        commentId: commentData1.id,
        userId: userData1.id,
      });
      await LikesTableTestHelper.addLike({
        id: 'like-456',
        commentId: commentData1.id,
        userId: userData2.id,
      });
      await LikesTableTestHelper.addLike({
        id: 'like-789',
        commentId: commentData2.id,
        userId: userData1.id,
      });

      const expectedThread = {
        id: threadData.id,
        title: threadData.title,
        body: threadData.body,
        date: threadData.date.toISOString(),
        username: userData1.username,
        comments: [
          {
            id: commentData1.id,
            content: commentData1.content,
            date: commentData1.date.toISOString(),
            username: userData1.username,
            likeCount: 2,
            replies: [
              {
                id: replyData1.id,
                content: replyData1.content,
                date: replyData1.date.toISOString(),
                username: userData1.username,
              },
              {
                id: replyData2.id,
                content: '**balasan telah dihapus**',
                date: replyData2.date.toISOString(),
                username: userData2.username,
              },
            ],
          },
          {
            id: commentData2.id,
            content: '**komentar telah dihapus**',
            date: commentData2.date.toISOString(),
            username: userData2.username,
            likeCount: 1,
            replies: [],
          },
        ],
      };

      const server = await createServer(container);

      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadData.id}`,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread).toStrictEqual(expectedThread);
    });

    it('should response 404 when thread not found', async () => {
      const threadId = 'thread-xxx';
      const server = await createServer(container);

      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('utas tidak ditemukan');
    });
  });
});
