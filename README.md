# Tech Stack Sync

A monorepo providing local-first cloud sync infrastructure for the Teach Stack apps. Apps store data locally using [SignalDB](https://signaldb.js.org/) and optionally back up to a user's personal cloud storage (Google Drive, OneDrive, etc.). No user data passes through any shared server.


## Why

Most sync solutions require a central database that holds everyone's data. Tech Stack Sync takes a different approach: each user's data lives in their own cloud storage account, and this toolkit provides the tools to get it there. The backend handles only authentication — it never sees what users are syncing.


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
