const ThreadDetails = require('../../Domains/threads/entities/ThreadDetails');
const CommentDetails = require('../../Domains/comments/entities/CommentDetails');

class GetThreadUseCaseUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.verifyThreadExist(useCasePayload);

    const thread = await this._threadRepository.getThreadById(useCasePayload);

    const commentsData = await this._commentRepository.getCommentsByThreadId(useCasePayload);

    const comments = commentsData.map((comment) => new CommentDetails(comment));

    return new ThreadDetails({
      ...thread,
      comments,
    });
  }
}

module.exports = GetThreadUseCaseUseCase;
