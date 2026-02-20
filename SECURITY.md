# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please prioritize the safety of our users.

1.  **Do not create a public GitHub issue.**
2.  Email the maintainer directly or engage via private channels.
3.  We will acknowledge your report within 48 hours.

## Security Features

- **Row Level Security (RLS)**: Enforced on all tables (`couples`, `notes`, `couple_members`).
- **Anonymous Authentication**: Minimizes PII collection (no emails/passwords).
- **Secure Linking**: Crypto-hased linking of users to shared spaces.
