# TeachStack Sync

A minimal, privacy-first authentication proxy that handles OAuth token management for all local first TeachStack projects. Apps never touch OAuth tokens directly — this service handles the full lifecycle on their behalf.


## Why
Local-first applications are a powerful way to build software that works offline and syncs when it can. However, managing OAuth tokens for cloud storage providers can be a pain for both developers and users. TeachStack Sync abstracts away this complexity, providing a seamless authentication experience across all TeachStack apps while keeping user data private and secure.


## How It Works
Any locally-first design TeachStack application redirects the user to the auth service to connect a cloud storage provider (Google Drive, OneDrive, etc.). On success, a shared session cookie is issued scoped to .teachstack.org domain, which all subdomains receive automatically. 

When an app needs to sync, it requests a fresh access token from this service — the app then talks to the provider directly, and no file data ever passes through this server.

```
pyrepl.teachstack.org     ─┐
webrepl.teachstack.org    ─┼──► sync.teachstack.org ──► Cloud Storage Provider
step-out.teachstack.org   ─┘              │
                                 .teachstack.org
                                  session cookie
```