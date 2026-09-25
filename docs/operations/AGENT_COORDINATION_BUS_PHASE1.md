# Agent Coordination Bus — Phase 1

**Status:** non-blocking infrastructure sprint  
**Authority:** GitHub remains the sole evidence and governance source.  
**Scope:** routing, deduplication and acknowledgement only.

## Invariant

```text
GitHub evidence / canonical governance
        ↓
coordination event
        ↓
notification / ACK
```

Never the reverse.

The bus must not authorize merges, releases, Teacher Authority, canonical learning state, production migrations or runtime activation.

## Phase 1 event types

- `CANDIDATE_SHA_PUBLISHED`
- `VALIDATION_REQUESTED`
- `VALIDATION_ACKNOWLEDGED`
- `VALIDATION_PASSED`
- `VALIDATION_BLOCKED`
- `CORRECTION_REQUESTED`

Merge/runtime events are deliberately outside the Phase 1 authority contract.

## Delivery

Expected integration:

```text
GitHub event
→ Pipedream
→ POST /api/coordination/events
→ Neon agent_coordination_events
→ target-role notification
→ executor reads GitHub evidence
→ POST /api/coordination/events/:id/ack
→ result remains evidenced in GitHub
```

The portal does not replace Pipedream's GitHub trigger. It provides the durable coordination ledger and idempotent ACK surface.

## Authentication

Both coordination endpoints use:

```text
x-prime-agent-bus-secret: <PRIME_AGENT_BUS_SECRET>
```

No secret belongs in Git, Issue #58, PR comments or payload metadata.

## Event request

`POST /api/coordination/events`

Example:

```json
{
  "workstreamId": "prime:p0:shared-runner",
  "senderRole": "builder",
  "targetRole": "validator",
  "eventType": "VALIDATION_REQUESTED",
  "repo": "alexmelloenglish-gif/prime-hub-portal",
  "issueNumber": 58,
  "prNumber": 59,
  "sha": "abcdef1234567",
  "githubCommentUrl": "https://github.com/alexmelloenglish-gif/prime-hub-portal/pull/59#issuecomment-...",
  "sourceDeliveryId": "<github-delivery-id>",
  "requiresAck": true,
  "payload": {
    "summary": "routing metadata only"
  }
}
```

`payload` is capped at 16 KiB and must never duplicate the technical report. Use the GitHub URL as the evidence pointer.

## Idempotency

The event identity is:

```text
sha256(
  repo
  + sourceDeliveryId
  + eventType
  + targetRole
  + sha-or-null
)
```

The resulting `idempotencyKey` is unique in Neon. GitHub/Pipedream retries therefore resolve to the same event row.

## Pending inbox

`GET /api/coordination/events?targetRole=validator&workstreamId=prime:p0:shared-runner`

Only `PENDING` events are returned. This can support a future event-driven agent wake-up or a scheduled fallback watcher.

## ACK

`POST /api/coordination/events/:id/ack`

```json
{
  "acknowledgedBy": "validator",
  "ackStatus": "ACKNOWLEDGED"
}
```

Allowed terminal states:

- `ACKNOWLEDGED`
- `SUPERSEDED`

A terminal ACK cannot be changed to the other terminal state. Replaying the same ACK by the same actor is idempotent.

## Pipedream Phase 1

Pipedream should:

1. listen only for material GitHub events around the configured coordination scope;
2. preserve the stable GitHub delivery identifier;
3. normalize the event into the request contract above;
4. call the coordination endpoint;
5. notify the target role/human surface only when the endpoint reports a newly created event;
6. treat duplicate responses as successful redelivery, not a new work request.

Slack/email may mirror the notification, but are never source of truth.

## Proof boundary

Repository proof for Phase 1 consists of:

- Prisma schema + additive migration;
- deterministic input normalization/idempotency contract;
- unique database key;
- race-safe duplicate collapse;
- terminal ACK transition rules;
- secured event/ACK endpoints;
- synthetic self-test;
- exact-SHA TypeScript/Prisma/CI proof;
- Preview build.

Actual Pipedream/GitHub webhook delivery remains a separate runtime integration witness until configured and exercised with a real delivery ID.
