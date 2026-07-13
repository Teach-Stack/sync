# @teach-stack/auth-server

Auth backend for the Teach Stack apps, deployed at auth.teachstack.org.

Stores encrypted refresh tokens and exchanges them for short-lived access tokens on demand. Issues a shared session cookie scoped to .teachstack.org so users connect a provider once and all subdomain apps benefit automatically. File data never passes through this server.
