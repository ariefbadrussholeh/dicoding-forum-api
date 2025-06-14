const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadDetails = require('../../../Domains/threads/entities/ThreadDetails');
const CommentDetails = require('../../../Domains/comments/entities/CommentDetails');
const ReplyDetails = require('../../../Domains/replies/entities/ReplyDetails');

describe('GetThreadDetailUseCase', () => {
  it('should orchestrating the get thread action correctly', async () => {
    const useCasePayload = 'thread-123';

    const mockThreadRepository = new ThreadRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.verifyThreadExist = jest.fn(() => Promise.resolve());
    mockThreadRepository.getThreadById = jest.fn(() => Promise.resolve({
      id: 'thread-123',
      title: 'thread-title',
      body: 'thread-body',
      date: new Date('2025-06-11T07:22:33.555Z'),
      username: 'ariefbadrussholeh',
    }));
    mockCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve([
      {
        id: 'comment-123',
        username: 'ariefbadrussholeh',
        date: new Date('2025-06-11T07:22:33.555Z'),
        content: 'comment-content',
        is_deleted: false,
      },
      {
        id: 'comment-456',
        username: 'lamineyamal',
        date: new Date('2025-06-11T07:22:33.555Z'),
        content: 'comment-content',
        is_deleted: true,
      },
    ]));
    mockReplyRepository.getRepliesByCommentId = jest.fn((commentId) => {
      if (commentId === 'comment-123') {
        return Promise.resolve([
          {
            id: 'reply-123',
            content: 'reply-content',
            date: new Date('2025-06-11T07:22:33.555Z'),
            username: 'ariefbadrussholeh',
            is_deleted: true,
          },
          {
            id: 'reply-456',
            content: 'reply-content',
            date: new Date('2025-06-11T07:22:33.555Z'),
            username: 'lamineyamal',
            is_deleted: false,
          },
        ]);
      }
      return Promise.resolve([]);
    });

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const thread = await getThreadDetailUseCase.execute(useCasePayload);

    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith(useCasePayload);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(useCasePayload);
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith('comment-123');
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith('comment-456');

    expect(thread).toEqual(
      new ThreadDetails({
        id: 'thread-123',
        title: 'thread-title',
        body: 'thread-body',
        date: new Date('2025-06-11T07:22:33.555Z'),
        username: 'ariefbadrussholeh',
        comments: [
          new CommentDetails({
            id: 'comment-123',
            username: 'ariefbadrussholeh',
            date: new Date('2025-06-11T07:22:33.555Z'),
            content: 'comment-content',
            is_deleted: false,
            replies: [
              new ReplyDetails({
                id: 'reply-123',
                content: 'reply-content',
                date: new Date('2025-06-11T07:22:33.555Z'),
                username: 'ariefbadrussholeh',
                is_deleted: true,
              }),
              new ReplyDetails({
                id: 'reply-456',
                content: 'reply-content',
                date: new Date('2025-06-11T07:22:33.555Z'),
                username: 'lamineyamal',
                is_deleted: false,
              }),
            ],
          }),
          new CommentDetails({
            id: 'comment-456',
            username: 'lamineyamal',
            date: new Date('2025-06-11T07:22:33.555Z'),
            content: 'comment-content',
            is_deleted: true,
            replies: [],
          }),
        ],
      }),
    );
  });
});
