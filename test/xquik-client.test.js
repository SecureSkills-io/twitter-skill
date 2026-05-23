const assert = require('node:assert/strict');
const test = require('node:test');

const {
  buildHeaders,
  buildUrl,
  extractTweetId,
  normalizeTweet,
  normalizeTweets,
  normalizeUser,
  normalizeUsers,
  parseArgs,
  resolveBackend,
} = require('../lib/xquik-client');

test('resolves Hermes Tweet backend aliases', () => {
  assert.equal(resolveBackend('hermes-tweet'), 'xquik');
  assert.equal(resolveBackend('xquik'), 'xquik');
  assert.equal(resolveBackend('browser'), 'browser');
  assert.equal(resolveBackend(undefined), 'browser');
});

test('parses positional arguments and value flags', () => {
  const parsed = parseArgs(['search', 'AI agents', '-n', '25', '--backend', 'hermes-tweet', '--json']);

  assert.deepEqual(parsed.positionals, ['search', 'AI agents']);
  assert.deepEqual(parsed.flags, {
    n: '25',
    backend: 'hermes-tweet',
    json: true,
  });
});

test('extracts tweet IDs from URLs and plain IDs', () => {
  assert.equal(extractTweetId('https://x.com/openai/status/1234567890'), '1234567890');
  assert.equal(extractTweetId('1234567890'), '1234567890');
  assert.equal(extractTweetId('@openai'), '');
});

test('builds Hermes Tweet/Xquik URLs with encoded query parameters', () => {
  const url = buildUrl('/api/v1/x/tweets/search', {
    q: 'from:openai agents',
    limit: 10,
    cursor: undefined,
  }, 'https://example.test/');

  assert.equal(
    url.toString(),
    'https://example.test/api/v1/x/tweets/search?q=from%3Aopenai+agents&limit=10',
  );
});

test('builds API key and bearer headers', () => {
  assert.deepEqual(buildHeaders('xq_test', true), {
    'User-Agent': 'twitter-skill/1.0',
    'x-api-key': 'xq_test',
    'content-type': 'application/json',
  });

  assert.deepEqual(buildHeaders('token', false), {
    'User-Agent': 'twitter-skill/1.0',
    authorization: 'Bearer token',
  });
});

test('normalizes tweet payloads from common response shapes', () => {
  const tweet = normalizeTweet({
    data: {
      tweetId: '42',
      fullText: 'Hermes Tweet reads this.',
      author: { name: 'Hermes', username: 'hermes_agent' },
      likeCount: '8',
      retweetCount: 3,
      replyCount: 2,
    },
  });

  assert.deepEqual(tweet, {
    id: '42',
    author: 'Hermes',
    handle: '@hermes_agent',
    text: 'Hermes Tweet reads this.',
    created_at: undefined,
    likes: 8,
    retweets: 3,
    replies: 2,
  });
});

test('normalizes tweet and user arrays', () => {
  const tweets = normalizeTweets({
    data: {
      tweets: [
        { id: '1', text: 'one', user: { username: 'a' } },
        { id: '2', text: 'two', user: { username: 'b' } },
      ],
    },
  });
  const users = normalizeUsers({
    followers: [
      { userId: '7', name: 'Ada', username: '@ada', followersCount: 100, followingCount: 5 },
    ],
  });

  assert.equal(tweets.length, 2);
  assert.equal(tweets[1].handle, '@b');
  assert.deepEqual(users, [
    {
      id: '7',
      name: 'Ada',
      username: 'ada',
      description: undefined,
      verified: false,
      followers: 100,
      following: 5,
    },
  ]);
});

test('normalizes direct user payloads', () => {
  const user = normalizeUser({
    data: {
      id: '9',
      screen_name: 'openai',
      description: 'AI research',
      public_metrics: { followers_count: 12, following_count: 2 },
      verified: true,
    },
  });

  assert.equal(user.username, 'openai');
  assert.equal(user.followers, 12);
  assert.equal(user.verified, true);
});
