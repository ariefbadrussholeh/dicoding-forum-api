const AddedComment = require('../AddedComment');

describe('a AddedComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      content: 'comment-content',
    };

    expect(() => new AddedComment(payload)).toThrowError(
      'ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: true,
      content: 'comment-content',
      owner: 'user-123',
    };

    expect(() => new AddedComment(payload)).toThrowError(
      'ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create addedComment object correctly', () => {
    const payload = {
      id: 'comment-123',
      content: 'comment-content',
      owner: 'user-123',
    };

    const { content, id, owner } = new AddedComment(payload);

    expect(content).toEqual(payload.content);
    expect(id).toEqual(payload.id);
    expect(owner).toEqual(payload.owner);
  });
});
