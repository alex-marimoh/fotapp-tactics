# ADR 0014 — Anonymous account lifecycle: accept growth for now

- Status: accepted
- Date: 2026-06-27
- Decides: [#18](https://github.com/alex-marimoh/fotapp-tactics/issues/18)
- Depends on: Supabase auth (Phase 3 user management)

## Context

In Supabase mode the app calls `signInAnonymously()` on first visit. Each visitor gets a
permanent `auth.users` row plus a `profiles` row and can accumulate scenarios and quiz
results. With no cleanup, guest accounts grow indefinitely — a cost and housekeeping concern
at scale.

## Decision

**Accept anonymous user growth for the current phase.** Do not build a TTL cleanup job,
scheduled purge, or conversion funnel in v1.

Rationale:

- MVP / early-product traffic is low; Supabase free-tier auth rows are not a near-term blocker.
- Anonymous-first keeps the board usable without sign-in friction (design intent).
- Premature cleanup risks deleting a returning guest's scenario before they link an identity.
- A real policy needs usage metrics (MAU, anonymous vs linked ratio, storage cost) we do not
  have yet.

### Privacy / data retention (document now)

- Anonymous profiles hold **minimal PII** (auto-generated id, optional display name after
  link, team scenarios / quiz results tied to `user_id`).
- Users who link Google/email **retain** the same `auth.users` id — anonymous history is not
  orphaned by design.
- When revisiting this ADR, evaluate: GDPR erasure requests, retention window for inactive
  anonymous rows, and cascade rules for `scenarios` / `quiz_results`.

### Revisit trigger

Re-open lifecycle policy when **any** of:

- Auth user count or DB size materially affects cost
- Abuse pattern (bot sign-ups) appears
- Product requires "guest data expires in N days" for compliance

At that point, prefer **TTL cleanup of inactive anonymous users** (e.g. 90 days since last
sign-in, cascade owned rows) over silent deletion on first visit.

## Consequences

- **No implementation issue** filed for cleanup jobs in this phase.
- Monitor Supabase dashboard periodically; no automation required yet.
- Future cleanup slice should reference this ADR and define: retention window, `last_seen`
  signal, cascade order, and soft-delete vs hard-delete.

## Alternatives considered

| Option | Why deferred |
|--------|----------------|
| TTL cleanup job now | No traffic data; risk of deleting legitimate returning guests |
| Conversion prompts | UX scope; doesn't solve storage without linked accounts |
| Disable anonymous auth | Breaks frictionless demo / board-first flow |
