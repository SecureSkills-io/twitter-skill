---
name: twitter
description: Twitter/X CLI for OpenClaw agents - post, reply, engage with automatic cookie management
homepage: https://github.com/SecureSkills-io/twitter-skill
metadata: {"openclaw":{"emoji":"🐦","requires":{"bins":["twitter"]},"install":[{"id":"npm","kind":"node","package":"@secureskills/twitter-skill","bins":["twitter"],"label":"Install twitter-skill"}]}}
---

# twitter-skill 🐦

Twitter/X CLI for OpenClaw agents with automatic cookie management.

## Install

```bash
git clone https://github.com/SecureSkills-io/twitter-skill.git
cd twitter-skill && npm link
```

## Authentication

### Option 1: Save cookies directly

```bash
twitter auth <auth_token> <ct0> [twid] [guest_id]
```

### Option 2: Save full cookie array (from browser export)

```bash
twitter auth --cookies-json '[{"name":"auth_token","value":"...",...}]'
```

### Option 3: Environment variables

```bash
export TWITTER_AUTH_TOKEN="your_auth_token"
export TWITTER_CT0="your_ct0"
export TWITTER_TWID="your_twid"
```

Cookies are stored in `~/.config/twitter-skill/cookies.json` with 600 permissions.

## Optional Hermes Tweet/Xquik Backend

Use this backend when the agent needs structured X search, tweet reads, replies,
followers, following, trends, or approval-gated write actions without browser
cookie handling.

```bash
export TWITTER_SKILL_BACKEND=hermes-tweet
export XQUIK_API_KEY=xq_...
export XQUIK_ACCOUNT=@your_account
```

Set `HERMES_TWEET_ENABLE_ACTIONS=true` only after the user confirms a write
action.

## Commands

### Post a Tweet

```bash
twitter post "Hello world!"
twitter tweet "Hello world!"  # alias
twitter post "Hello world!" --backend hermes-tweet --account @me
```

### Post a Thread

```bash
# Inline (split by ---)
twitter thread "First tweet---Second tweet---Third tweet"

# From file
twitter thread my-thread.txt
```

File format (`my-thread.txt`):
```
First tweet

---

Second tweet

---

Third tweet
```

### Reply to a Tweet

```bash
twitter reply https://x.com/user/status/123456 "Great post!"
twitter reply 123456 "Great post!" --backend hermes-tweet --account @me
```

### Like a Tweet

```bash
twitter like https://x.com/user/status/123456
twitter like 123456 --backend hermes-tweet --account @me
```

### Search and Read with Hermes Tweet/Xquik

```bash
twitter search "AI agents" -n 25 --backend hermes-tweet
twitter read https://x.com/user/status/123456 --backend hermes-tweet
twitter thread 123456 --backend hermes-tweet
twitter replies 123456 --backend hermes-tweet
twitter user @openai --backend hermes-tweet
twitter user-tweets @openai -n 25 --backend hermes-tweet
twitter followers @openai -n 100 --json --backend hermes-tweet
twitter following @openai -n 100 --json --backend hermes-tweet
twitter trends --woeid 23424977 --backend hermes-tweet
```

### Extract Fresh Cookies

After browser activity, extract updated cookies:

```bash
twitter extract
```

This updates `~/.config/twitter-skill/cookies.json` with fresh session data.

### Check Authentication

```bash
twitter whoami
```

## How It Works

1. **Cookie Injection**: The skill injects stored cookies into a Playwright browser session
2. **Browser Automation**: Performs actions (post, reply, like) via browser automation
3. **Cookie Extraction**: After actions, extracts fresh cookies and saves them
4. **Session Persistence**: Fresh cookies ensure the session stays valid

## Security

- Cookies stored with 600 permissions (owner read/write only)
- Default browser backend has no external API dependencies
- Uses existing browser session (CDP on port 18800)
- Respects X's rate limits with built-in delays
- Hermes Tweet/Xquik backend reads `XQUIK_API_KEY` from the environment only
- Confirm account, tweet ID, user handle, and text before any write action

## Requirements

- Node.js 18+
- Playwright browser running on CDP port 18800
- Valid X/Twitter session cookies
- Optional: `XQUIK_API_KEY` for Hermes Tweet/Xquik backend

## Trust Score

**8.0/10** — Medium risk
- Network: Basic — X API calls
- Filesystem: Config only — ~/.config/twitter-skill/
- Credentials: User-provided — Cookie-based auth
- System: None — Browser automation only
- Optional backend: Hermes Tweet/Xquik HTTPS API with environment API key

---

**TL;DR**: Save cookies once, post/extract/update automatically. 🐦
