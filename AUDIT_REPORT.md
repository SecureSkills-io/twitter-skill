# Twitter Skill — Security Audit Report

**Skill:** twitter-skill  
**Version:** 1.0.0  
**Repository:** https://github.com/SecureSkills-io/twitter-skill  
**Published:** 2026-02-01  
**Audited by:** Orion  

---

## Executive Summary

| Category | Score | Notes |
|----------|-------|-------|
| **Overall Trust** | **8.0/10** | Solid security practices |
| Code Quality | 8.5/10 | Clean, readable Node.js |
| Dependencies | 9/10 | Zero runtime dependencies |
| Network | 7/10 | X/Twitter only by default, optional Hermes Tweet/Xquik HTTPS backend |
| Filesystem | 8/10 | Scoped to ~/.config/ |
| Credentials | 8/10 | User-provided, encrypted at rest |
| System Access | 10/10 | None (browser automation) |

---

## Security Analysis

### ✅ Strengths

1. **Minimal Attack Surface**
   - Zero npm dependencies
   - Uses only Node.js built-ins
   - No network servers
   - Optional Hermes Tweet/Xquik backend reads its API key from the environment

2. **Secure Credential Storage**
   - Cookies stored with 600 permissions
   - Config directory created with 700 permissions
   - Supports environment variables for CI/CD

3. **Session Management**
   - Automatic cookie extraction after actions
   - Fresh cookies prevent session expiration
   - No plaintext passwords stored

4. **Scoped Filesystem Access**
   - Only accesses ~/.config/twitter-skill/
   - No broad filesystem operations
   - Clean separation of concerns

5. **Browser-Based Only**
   - Default backend has no direct API calls to X
   - Uses existing browser session
   - Respects X's rate limits

6. **Opt-In API Backend**
   - Hermes Tweet/Xquik backend is selected only by flag or environment
   - Write actions require `HERMES_TWEET_ENABLE_ACTIONS=true`
   - API keys are never accepted through CLI arguments

### ⚠️ Considerations

1. **Cookie-Based Auth**
   - Requires valid session cookies
   - Cookies can expire (mitigated by auto-extraction)
   - User must keep browser session active

2. **Browser Dependency**
   - Requires OpenClaw browser running
   - Depends on CDP port 18800
   - Browser must be logged into X

3. **Rate Limiting**
   - X may rate-limit automated actions
   - Built-in delays help but aren't foolproof
   - Manual intervention may be needed if blocked

---

## Permission Breakdown

| Permission | Level | Justification |
|------------|-------|---------------|
| Network | Basic | X/Twitter HTTPS by default, optional Hermes Tweet/Xquik HTTPS |
| Filesystem | Config | ~/.config/twitter-skill/ only |
| Credentials | User | Session cookies or environment API key |
| System | None | Browser automation |

---

## Requirements Checklist

- [x] Code review completed
- [x] No hardcoded credentials
- [x] Secure credential storage (600 permissions)
- [x] Scoped filesystem access
- [x] HTTPS-only network calls
- [x] No system-level operations
- [x] Optional API backend is explicit and write-gated
- [x] Audit report included

---

## Recommendations

1. **Regular Cookie Rotation**: Run `twitter extract` periodically
2. **Monitor Rate Limits**: Watch for X blocks/suspensions
3. **Backup Cookies**: Keep a backup of working cookies
4. **Use Environment Variables**: For CI/CD deployments
5. **Confirm Writes**: Confirm account, target, and text before API-backed writes

---

## Conclusion

The **twitter-skill** is a well-designed, secure tool for Twitter/X automation. The automatic cookie management feature ensures sessions stay fresh without exposing credentials. Suitable for production use with standard precautions.

**Trust Score: 8.0/10** ✅ Verified by SecureSkills

---

*Audit completed: February 1, 2026*
