class CommentDetails {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, username, date, content, replies } = this._formatPayload(payload);

    this.id = id;
    this.username = username;
    this.date = date;
    this.content = content;
    this.replies = replies;
  }

  _verifyPayload({ id, username, date, content, replies, is_deleted: isDeleted }) {
    if (!id || !username || !date || !content || !replies || isDeleted === undefined) {
      throw new Error('COMMENT_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string'
      || typeof username !== 'string'
      || !(date instanceof Date)
      || typeof content !== 'string'
      || !Array.isArray(replies)
      || typeof isDeleted !== 'boolean'
    ) {
      throw new Error('COMMENT_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  _formatPayload({ id, username, date, content, replies, is_deleted: isDeleted }) {
    return {
      id,
      username,
      date,
      replies,
      content: isDeleted ? '**komentar telah dihapus**' : content,
    };
  }
}

module.exports = CommentDetails;
