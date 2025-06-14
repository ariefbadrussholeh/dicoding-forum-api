const ThreadDetails = require('../../Domains/threads/entities/ThreadDetails');
const CommentDetails = require('../../Domains/comments/entities/CommentDetails');
const ReplyDetails = require('../../Domains/replies/entities/ReplyDetails');

class GetThreadUseCaseUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.verifyThreadExist(useCasePayload);

    const thread = await this._threadRepository.getThreadById(useCasePayload);

    const commentsData = await this._commentRepository.getCommentsByThreadId(useCasePayload);

    const comments = await Promise.all(
      commentsData.map(async (comment) => {
        const repliesData = await this._replyRepository.getRepliesByCommentId(comment.id);
        const replies = repliesData.map((reply) => new ReplyDetails(reply));
        return new CommentDetails({ ...comment, replies });
      }),
    );

    return new ThreadDetails({
      ...thread,
      comments,
    });
  }
}

module.exports = GetThreadUseCaseUseCase;
