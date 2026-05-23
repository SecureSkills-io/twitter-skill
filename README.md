# 🐦 twitter-skill

Twitter/X CLI for OpenClaw agents with automatic cookie management.

> Post tweets, threads, replies, and likes with fresh cookie extraction after every action.

## Features

- ✅ **Post tweets** — Single tweets with media support (coming soon)
- ✅ **Post threads** — Multi-tweet threads with automatic splitting
- ✅ **Reply** — Reply to any tweet by URL
- ✅ **Like** — Like tweets
- ✅ **Auto cookie refresh** — Extracts fresh cookies after every action
- ✅ **Hermes Tweet/Xquik backend** — Optional API-backed search, reads, followers, posting, replies, likes, retweets, and follows
- ✅ **Secure storage** — Cookies stored with 600 permissions
- ✅ **Environment variables** — Support for env-based auth

## Install

```bash
git clone https://github.com/SecureSkills-io/twitter-skill.git
cd twitter-skill
npm link
```

## Quick Start

### 1. Authenticate

Get cookies from your browser (via Cookie-Editor extension or DevTools):

```bash
# Save key cookies
twitter auth <auth_token> <ct0> [twid] [guest_id]

# Or save full cookie array
twitter auth --cookies-json '[{"name":"auth_token",...}]'
```

Or use environment variables:
```bash
export TWITTER_AUTH_TOKEN="..."
export TWITTER_CT0="..."
```

Optional Hermes Tweet/Xquik backend:

```bash
export TWITTER_SKILL_BACKEND=hermes-tweet
export XQUIK_API_KEY="xq_..."
export XQUIK_ACCOUNT="@your_account"        # Required for write actions
export HERMES_TWEET_ENABLE_ACTIONS=true     # Enables write actions after confirmation
```

### 2. Post

```bash
twitter post "Hello from my AI agent! 🤖"
```

### 3. Extract Fresh Cookies

```bash
twitter extract
```

## Commands

| Command | Description |
|---------|-------------|
| `twitter auth <token> <ct0>` | Save credentials |
| `twitter post "text"` | Post a tweet |
| `twitter thread "text---text"` | Post a thread |
| `twitter reply <url> "text"` | Reply to a tweet |
| `twitter like <url>` | Like a tweet |
| `twitter search "query"` | Search tweets with Hermes Tweet/Xquik |
| `twitter read <url-or-id>` | Read a tweet with Hermes Tweet/Xquik |
| `twitter followers <@handle>` | List followers with Hermes Tweet/Xquik |
| `twitter extract` | Extract fresh cookies |
| `twitter whoami` | Show current account |

## Thread Format

```bash
# Inline
twitter thread "First tweet---Second tweet---Third tweet"

# From file
twitter thread my-thread.txt
```

File format:
```
First tweet goes here

---

Second tweet

---

Third tweet
```

## Hermes Tweet/Xquik Backend

The default backend keeps using browser cookies and OpenClaw's CDP browser. Use
the Hermes Tweet/Xquik backend when an agent needs structured X search, tweet
reads, replies, followers, following, trends, or approval-gated write actions.

```bash
twitter auth-check --backend hermes-tweet
twitter search "AI agents" -n 25 --backend hermes-tweet
twitter read 1234567890 --backend hermes-tweet
twitter thread 1234567890 --backend hermes-tweet
twitter replies 1234567890 --backend hermes-tweet
twitter user @openai --backend hermes-tweet
twitter followers @openai -n 100 --json --backend hermes-tweet
twitter following @openai -n 100 --json --backend hermes-tweet
twitter trends --woeid 23424977 --backend hermes-tweet
```

Write commands stay opt-in:

```bash
twitter post "Hello from OpenClaw" --backend hermes-tweet --account @your_account
twitter reply 1234567890 "Thanks for the thread" --backend hermes-tweet --account @your_account
twitter like 1234567890 --backend hermes-tweet --account @your_account
twitter retweet 1234567890 --backend hermes-tweet --account @your_account
twitter follow @openai --backend hermes-tweet --account @your_account
```

Agents must confirm the exact account, tweet ID, user handle, and text before
running any write command.

## How It Works

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ Load Cookies│────▶│ Browser Action│────▶│ Extract New │
│  ~/.config/ │     │ (post/reply) │     │   Cookies   │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                 │
                                          ┌──────▼──────┐
                                          │ Save to File │
                                          │  ~/.config/  │
                                          └─────────────┘
```

1. Loads stored cookies
2. Injects into browser session
3. Performs action (post/reply/like)
4. Extracts fresh cookies
5. Saves updated cookies

## Security

- 🔒 Cookies stored with mode 600 (owner read/write only)
- 📁 Config directory: `~/.config/twitter-skill/`
- 🔐 No plaintext passwords — uses session cookies only
- 🌐 HTTPS-only communication
- 🔌 Hermes Tweet/Xquik backend uses `XQUIK_API_KEY` from the environment and
  never accepts the key through command arguments

## Trust Score

**8.0/10** — Verified by SecureSkills

| Category | Rating |
|----------|--------|
| Network | Basic — X/Twitter API only |
| Filesystem | Config only — ~/.config/twitter-skill/ |
| Credentials | User-provided session cookies |
| System | None — Browser automation only |

## Requirements

- Node.js 18+
- Playwright/Chromium browser
- OpenClaw browser running on CDP port 18800

## License

MIT

---

Built with 🌌 by Orion for SecureSkills
