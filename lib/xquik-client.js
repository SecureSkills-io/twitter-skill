const http = require('http');
const https = require('https');

const DEFAULT_BASE_URL = 'https://xquik.com';

function resolveBackend(value) {
  const normalized = String(value || 'browser').trim().toLowerCase();
  if (['hermes', 'hermes-tweet', 'xquik'].includes(normalized)) return 'xquik';
  return 'browser';
}

function parseArgs(argv) {
  const flags = {};
  const positionals = [];
  const valueFlags = new Set([
    '--account',
    '--backend',
    '--count',
    '--cookies-json',
    '--cursor',
    '--query-type',
    '--woeid',
    '-n',
  ]);

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (valueFlags.has(arg)) {
      const key = arg.replace(/^--?/, '');
      flags[key] = argv[++i];
    } else if (arg.startsWith('--')) {
      flags[arg.slice(2)] = true;
    } else {
      positionals.push(arg);
    }
  }

  return { flags, positionals };
}

function extractTweetId(input) {
  const value = String(input || '').trim();
  const match = value.match(/status\/(\d+)/);
  if (match) return match[1];
  if (/^\d+$/.test(value)) return value;
  return '';
}

function buildUrl(path, query = {}, baseUrl = process.env.XQUIK_BASE_URL || DEFAULT_BASE_URL) {
  const url = new URL(path.replace(/^\//, ''), `${baseUrl.replace(/\/+$/, '')}/`);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }
  return url;
}

function buildHeaders(apiKey = process.env.XQUIK_API_KEY || '', hasBody = false) {
  const headers = { 'User-Agent': 'twitter-skill/1.0' };
  if (apiKey.startsWith('xq_')) {
    headers['x-api-key'] = apiKey;
  } else if (apiKey) {
    headers.authorization = `Bearer ${apiKey}`;
  }
  if (hasBody) headers['content-type'] = 'application/json';
  return headers;
}

function requestJson(url, options, body) {
  return new Promise((resolve, reject) => {
    const transport = url.protocol === 'http:' ? http : https;
    const req = transport.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let parsed;
        try {
          parsed = data ? JSON.parse(data) : {};
        } catch (error) {
          reject(new Error(`Failed to parse response: ${data.slice(0, 200)}`));
          return;
        }

        if (res.statusCode >= 400) {
          const message = parsed.error || parsed.detail || parsed.title || parsed.message || `HTTP ${res.statusCode}`;
          reject(new Error(message));
          return;
        }

        resolve(parsed);
      });
    });
    req.on('error', reject);
    if (body !== undefined) req.write(JSON.stringify(body));
    req.end();
  });
}

async function xquikRequest(method, path, query, body) {
  const apiKey = process.env.XQUIK_API_KEY || '';
  if (!apiKey) throw new Error('XQUIK_API_KEY is not set.');
  const hasBody = body !== undefined;
  return requestJson(buildUrl(path, query), {
    method,
    headers: buildHeaders(apiKey, hasBody),
  }, body);
}

function unwrapPayload(payload) {
  if (payload && payload.data && !Array.isArray(payload.data) && typeof payload.data === 'object') {
    return payload.data;
  }
  return payload || {};
}

function firstValue(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return undefined;
}

function countValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function pickArray(payload, names) {
  if (Array.isArray(payload)) return payload;
  const unwrapped = unwrapPayload(payload);
  if (Array.isArray(unwrapped)) return unwrapped;
  for (const name of names) {
    const value = unwrapped[name] || payload[name];
    if (Array.isArray(value)) return value;
  }
  for (const value of Object.values(unwrapped)) {
    if (Array.isArray(value)) return value;
  }
  return [];
}

function normalizeTweet(input) {
  const tweet = unwrapPayload(input.tweet || input.post || input);
  const author = tweet.author || tweet.user || {};
  const legacy = author.legacy || {};
  const username = firstValue(tweet.username, tweet.handle, author.username, author.screen_name, legacy.screen_name);
  return {
    id: String(firstValue(tweet.id, tweet.tweetId, tweet.tweet_id, tweet.rest_id, tweet.id_str, '')),
    author: firstValue(tweet.authorName, tweet.author_name, tweet.name, author.name, legacy.name, username, 'Unknown'),
    handle: username ? `@${String(username).replace(/^@/, '')}` : '@unknown',
    text: firstValue(tweet.fullText, tweet.full_text, tweet.text, tweet.content, tweet.body, legacy.full_text, ''),
    created_at: firstValue(tweet.createdAt, tweet.created_at, tweet.created, tweet.timestamp, legacy.created_at),
    likes: countValue(firstValue(tweet.likeCount, tweet.likes, tweet.favorite_count, tweet.public_metrics?.like_count, legacy.favorite_count)),
    retweets: countValue(firstValue(tweet.retweetCount, tweet.retweets, tweet.public_metrics?.retweet_count, legacy.retweet_count)),
    replies: countValue(firstValue(tweet.replyCount, tweet.replies, tweet.public_metrics?.reply_count, legacy.reply_count)),
  };
}

function normalizeTweets(payload) {
  return pickArray(payload, ['tweets', 'results', 'items', 'data', 'thread', 'replies', 'timeline'])
    .map(normalizeTweet)
    .filter(tweet => tweet.id || tweet.text);
}

function normalizeUser(input) {
  const user = unwrapPayload(input.user || input.profile || input);
  const legacy = user.legacy || {};
  const username = firstValue(user.username, user.screen_name, user.handle, legacy.screen_name, user.id, 'unknown');
  return {
    id: String(firstValue(user.id, user.userId, user.rest_id, user.id_str, '')),
    name: firstValue(user.name, legacy.name, username),
    username: String(username).replace(/^@/, ''),
    description: firstValue(user.description, user.bio, legacy.description, ''),
    verified: Boolean(firstValue(user.verified, user.isVerified, legacy.verified, false)),
    followers: countValue(firstValue(user.followers, user.followersCount, user.public_metrics?.followers_count, legacy.followers_count)),
    following: countValue(firstValue(user.following, user.followingCount, user.public_metrics?.following_count, legacy.friends_count)),
  };
}

function normalizeUsers(payload) {
  return pickArray(payload, ['users', 'results', 'items', 'data', 'followers', 'following'])
    .map(normalizeUser)
    .filter(user => user.id || user.username);
}

function actionsEnabled() {
  return String(process.env.HERMES_TWEET_ENABLE_ACTIONS || '').toLowerCase() === 'true';
}

module.exports = {
  actionsEnabled,
  buildHeaders,
  buildUrl,
  extractTweetId,
  normalizeTweet,
  normalizeTweets,
  normalizeUser,
  normalizeUsers,
  parseArgs,
  resolveBackend,
  xquikRequest,
};
