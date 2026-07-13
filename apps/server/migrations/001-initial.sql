CREATE TABLE users (
  id              TEXT NOT NULL,
  provider        TEXT NOT NULL,
  refresh_token   BLOB NOT NULL,
  updated         INTEGER NOT NULL DEFAULT (unixepoch()),

  PRIMARY KEY (id, provider)
);