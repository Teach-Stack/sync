# Tech Stack Auth & Sync

A monorepo providing local-first cloud sync infrastructure for the Teach Stack apps. Apps store data locally using [SignalDB](https://signaldb.js.org/) and optionally back up to a user's personal cloud storage (Google Drive, OneDrive, etc.). No user data passes through any shared server.


## Why

Most local-first sync solutions require a central database. This means that all user data must pass through a shared server, which can be a privacy concern and a potential point of failure. By contrast, this approach allows users to keep their data in their own cloud storage, giving them more control and privacy.


## Structure

```
tech-stack-sync/
├── apps/
│   ├── auth/               # OAuth proxy backend (auth.teachstack.org)
│   └── demo/               # Demo site for local development and testing
└── packages/
    ├── auth/               # Client SDK for interfacing with the auth server
    └── sync/               # SignalDB helpers for cloud provider sync
```
