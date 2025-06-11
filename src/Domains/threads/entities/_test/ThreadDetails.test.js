const ThreadDetails = require('../ThreadDetails');

describe('a ThreadDetails entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      title: 'thread-title',
    };

    expect(() => new ThreadDetails(payload)).toThrowError(
      'THREAD_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      title: 'thread-title',
      body: 'thread-body',
      date: new Date(),
      username: 'ariefbadrussholeh',
      comments: [{ content: 'comment-content' }],
    };

    expect(() => new ThreadDetails(payload)).toThrowError(
      'THREAD_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create threadDetails object correctly', () => {
    const payload = {
      id: 'thread-123',
      title: 'thread-title',
      body: 'thread-body',
      date: new Date(),
      username: 'ariefbadrussholeh',
      comments: [{ content: 'comment-content' }],
    };

    const { id, title, body, date, username, comments } = new ThreadDetails(payload);

    expect(id).toEqual(payload.id);
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(date).toEqual(payload.date);
    expect(username).toEqual(payload.username);
    expect(comments).toEqual(payload.comments);
  });
});
