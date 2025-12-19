# Security Policy - Bobby's World Tools (Pandora Codex)

**Version**: 2.0  
**Last Updated**: December 17, 2024

---

## 🔒 Overview

Bobby's World Tools (Pandora Codex) is a professional device operations platform designed with security as a core principle. This document outlines our security practices, vulnerability reporting procedures, and security best practices for deployments.

---

## 🚨 Reporting Security Vulnerabilities

### Responsible Disclosure

If you discover a security vulnerability, please report it responsibly:

**Contact**: [Create a private security advisory on GitHub](https://github.com/Bboy9090/Bobbys_World_Tools/security/advisories/new)

**Please DO NOT**:

- Report security issues through public GitHub issues
- Disclose vulnerabilities publicly before we've had a chance to address them
- Exploit vulnerabilities beyond what's necessary to demonstrate the issue

**Please DO**:

- Provide detailed reproduction steps
- Include the affected version(s)
- Describe the potential impact
- Suggest a fix if possible

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 7 days
- **Fix Release**: Based on severity
  - Critical: Within 7 days
  - High: Within 14 days
  - Medium: Within 30 days
  - Low: Next regular release

---

## 🛡️ Security Features

### 1. Truth-First Design

**Principle**: No fake success responses, no silent failures

**Implementation**:

- All operations return real results
- Confidence scoring for device detection
- Evidence-based classifications
- Full audit trail

**Security Benefit**: Prevents false sense of security, enables forensic analysis

### 2. Authorization Triggers System

**Feature**: 36+ mapped device authorization prompts

**Implementation**:

- Every sensitive operation requires explicit authorization
- Typed confirmations (e.g., "UNLOCK", "RESET")
- Full audit logging with timestamps
- Chain-of-custody tracking

**Code Reference**: `server/authorization-triggers.js:12-157`

### 3. Critical Partition Protection

**Feature**: Blocked access to critical device partitions

**Protected Partitions**:

- `bootloader` - Device bootloader
- `radio` - Baseband firmware
- `aboot` - Android bootloader
- Boot-critical partitions

**Implementation**: Whitelist-based approach in fastboot operations

**Code Reference**: `server/index.js:228-240`

### 4. Command Filtering (ADB)

**Feature**: Whitelist of safe ADB commands

**Blocked Commands**:

- Direct root shell access
- Package installation without verification
- System modification commands

**Allowed Commands**:

- Device information queries
- Non-destructive diagnostics
- Authorized operations only

### 5. Evidence Bundle System

**Feature**: Signed, immutable audit logs

**Implementation**:

- SHA-256 signing of evidence bundles
- Timestamped operation logs
- Chain-of-custody preservation
- Tamper detection

**Code Reference**: `src/lib/evidence-bundle.ts:1-29`

### 6. Admin API Key Authentication

**Feature**: Admin operations require API key

**Implementation**:

```bash
# All admin endpoints check x-api-key header
curl -H "x-api-key: $ADMIN_API_KEY" http://localhost:3001/api/admin/...
```

**Endpoints Protected**:

- Authorization triggers
- System configuration
- Evidence export

---

## 🔐 Security Best Practices

### Deployment Security

#### 1. Change Default Admin Key

```bash
# Generate strong admin key
openssl rand -hex 32

# Set in .env
ADMIN_API_KEY=generated_key_here
```

**Never use**:

- Default keys
- Weak passwords
- Keys in source control

#### 2. Use HTTPS in Production

```bash
# Use nginx with Let's Encrypt
sudo certbot --nginx -d your-domain.com
```

**Never expose**:

- HTTP-only endpoints in production
- Unencrypted WebSocket connections

#### 3. Configure Firewall

```bash
# Ubuntu/Debian
sudo ufw allow 443/tcp  # HTTPS
sudo ufw allow 22/tcp   # SSH (restrict to specific IPs)
sudo ufw deny 3001/tcp  # Block direct backend access
sudo ufw enable
```

#### 4. USB Access Control

```bash
# Restrict USB access to specific users
sudo usermod -aG plugdev authorized_user

# Review udev rules
sudo nano /etc/udev/rules.d/51-android.rules
```

#### 5. Regular Updates

```bash
# Check for updates weekly
git pull origin main
npm install
cd server && npm install
```

### Operational Security

#### 1. Audit Log Monitoring

```bash
# Review authorization logs daily
tail -f /var/log/pandora-codex/authorization.log

# Alert on suspicious activity
# (Configure your monitoring system)
```

#### 2. Evidence Bundle Verification

```bash
# Verify evidence bundle integrity
sha256sum evidence-bundle.json
# Compare with recorded hash
```

#### 3. Access Control

- **Principle of Least Privilege**: Users only get minimum necessary permissions
- **Multi-User Deployments**: Separate admin and operator roles
- **Physical Security**: Restrict physical access to deployment machine

---

## ⚠️ Known Security Considerations

### 1. USB Device Trust

**Issue**: USB devices must be trusted by the operator

**Mitigation**:

- Visual device identification
- Device serial number verification
- Authorization trigger confirmation

**Recommendation**: Only connect known, authorized devices

### 2. ADB Authorization Requirement

**Issue**: Android devices require ADB authorization

**Mitigation**:

- Physical device access required
- User must approve ADB authorization on device
- Authorization tracked in audit logs

**Recommendation**: This is a security feature, not a bug

### 3. Trapdoor Module

**Issue**: Trapdoor module provides access to powerful bypass tools

**Mitigation**:

- Admin-only access
- Firejail sandboxing (optional)
- Full audit logging
- Legal disclaimer required

**Recommendation**: Only use on devices you own or have explicit authorization to service

---

## 🚫 Out of Scope (Intentional Exclusions)

### Security Bypass Features

The following features are **intentionally excluded** for legal and ethical reasons:

❌ **iOS**:

- Apple ID bypass
- Activation lock bypass
- MDM profile removal (unauthorized)
- Jailbreaking without user consent

❌ **Android**:

- FRP (Factory Reset Protection) bypass
- Bootloader unlock bypass
- IMEI alteration
- Knox warranty bit modification
- Carrier unlock

**Rationale**: Legal compliance, ownership respect, ethical boundaries

**Legal Note**: Bypassing security features on devices you do not own is illegal under:

- Computer Fraud and Abuse Act (CFAA) - United States
- Computer Misuse Act - United Kingdom
- Similar laws in most jurisdictions

---

## 📋 Security Checklist

### Pre-Deployment

- [ ] Change default admin API key
- [ ] Configure HTTPS/TLS
- [ ] Set up firewall rules
- [ ] Configure USB access control
- [ ] Review udev rules
- [ ] Set up log monitoring
- [ ] Configure backup encryption
- [ ] Test disaster recovery

### Post-Deployment

- [ ] Verify HTTPS certificate
- [ ] Test admin authentication
- [ ] Review audit logs daily
- [ ] Monitor for suspicious activity
- [ ] Keep dependencies updated
- [ ] Conduct monthly security reviews

### Ongoing Maintenance

- [ ] Weekly: Check for security updates
- [ ] Monthly: Review access logs
- [ ] Quarterly: Security audit
- [ ] Annually: Penetration testing (recommended)

---

## 🔍 Security Audit

### Last Audit

**Date**: December 17, 2024  
**Type**: Production Reality Audit  
**Findings**: See `docs/audits/production-reality-audit.md`

**Key Results**:

- ✅ No hardcoded success responses
- ✅ No silent error swallowing
- ✅ Proper error propagation
- ✅ Evidence-based device detection
- ✅ Full audit trail implemented

### Next Audit

**Scheduled**: March 17, 2025  
**Type**: Quarterly Security Review

---

## 📞 Security Contact

**GitHub Security Advisories**: [Create Advisory](https://github.com/Bboy9090/Bobbys_World_Tools/security/advisories/new)

**For Non-Security Issues**: [GitHub Issues](https://github.com/Bboy9090/Bobbys_World_Tools/issues)

---

## 📚 Related Documentation

- `docs/DEPLOYMENT.md` - Secure deployment guide
- `docs/OPERATIONS.md` - Security monitoring and maintenance
- `docs/audits/production-reality-audit.md` - Latest security audit
- `LEGAL_NOTICE.md` - Legal boundaries and compliance

---

**Security Policy Version**: 2.0  
**Maintained By**: Pandora Codex Security Team  
**Next Review**: March 17, 2025

---

_"Security through transparency. Trust through audit. Protection through design."_  
— **Pandora Codex Security Principles**
