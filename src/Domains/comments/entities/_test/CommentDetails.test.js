const CommentDetails = require('../CommentDetails');

describe('a CommentDetails entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      content: 'comment-content',
    };

    expect(() => new CommentDetails(payload)).toThrowError(
      'COMMENT_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      username: 'ariefbadrussholeh',
      date: new Date(),
      content: 'comment-content',
      replies: [{ content: 'reply-content' }],
      is_deleted: false,
    };

    expect(() => new CommentDetails(payload)).toThrowError(
      'COMMENT_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create commentDetails object correctly', () => {
    const payload1 = {
      id: 'comment-123',
      username: 'ariefbadrussholeh',
      date: new Date(),
      content: 'comment-content',
      replies: [{ content: 'reply-content' }],
      is_deleted: false,
    };

    const payload2 = {
      id: 'comment-456',
      username: 'lamineyamal',
      date: new Date(),
      content: 'comment-content',
      replies: [{ content: 'reply-content' }],
      is_deleted: true,
    };

    const {
      id: id1,
      username: username1,
      date: date1,
      content: content1,
      replies: replies1,
    } = new CommentDetails(payload1);

    const {
      id: id2,
      username: username2,
      date: date2,
      content: content2,
      replies: replies2,
    } = new CommentDetails(payload2);

    expect(id1).toEqual(payload1.id);
    expect(username1).toEqual(payload1.username);
    expect(date1).toEqual(payload1.date);
    expect(content1).toEqual(payload1.content);
    expect(replies1).toEqual(payload1.replies);

    expect(id2).toEqual(payload2.id);
    expect(username2).toEqual(payload2.username);
    expect(date2).toEqual(payload2.date);
    expect(content2).toEqual('**komentar telah dihapus**');
    expect(replies2).toEqual(payload2.replies);
  });
});
