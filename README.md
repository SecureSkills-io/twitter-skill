# 🐦 twitter-skill

Twitter/X CLI for OpenClaw agents with automatic cookie management.

> Post tweets, threads, replies, and likes with fresh cookie extraction after every action.

## Features

- ✅ **Post tweets** — Single tweets with media support (coming soon)
- ✅ **Post threads** — Multi-tweet threads with automatic splitting
- ✅ **Reply** — Reply to any tweet by URL
- ✅ **Like** — Like tweets
- ✅ **Auto cookie refresh** — Extracts fresh cookies after every action
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