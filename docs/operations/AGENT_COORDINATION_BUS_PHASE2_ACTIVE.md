# Agent Coordination Bus — Phase 2 Active Coordination

**Status:** repository implementation in validation  
**Base:** Phase 1 PR #61 / SHA `66478b0f1dab001f193a33f27c5add6a85a36f81`  
**Authority:** GitHub remains the evidence and governance source.

## Goal

Phase 1 made coordination durable but passive. Phase 2 adds the missing execution boundary:

```text
material GitHub event
        ↓
durable coordination event
        ↓
atomic worker claim + lease
        ↓
wake adapter OR direct worker claim
        ↓
executor reads GitHub evidence and acts
        ↓
ACK / result
```

The coordination bus does not authorize merges, releases, Teacher Authority, canonical learner state, production migrations, or production automation.

## Claim and lease

A worker claims one PENDING event through:

`POST /api/coordination/events/claim`

The claim is race-safe:
- only `PENDING` events are eligible;
- an unleased or expired event may be claimed;
- the database update is conditional on the same eligibility predicate;
- one worker receives the lease;
- the lease expires automatically if the worker disappears.

Lease duration is constrained to 30–3600 seconds; default is 300 seconds.

ACK clears the lease.

## Active dispatcher

`POST /api/coordination/dispatch`

The dispatcher:
1. claims one event for the target role;
2. resolves a role-specific HTTPS wake endpoint from `PRIME_AGENT_WAKE_URLS_JSON`;
3. sends a compact wake payload containing the coordination event ID and GitHub evidence pointers;
4. records dispatch time;
5. releases the lease on failure so fallback execution can retry.

Wake targets are **disabled by default**. Repository code alone does not activate external delivery.

Example configuration shape:

```json
{
  "validator": "https://example-agent-runtime.invalid/wake",
  "builder": "https://example-agent-runtime.invalid/wake"
}
```

Only HTTPS targets are accepted.

## Direct worker mode

An agent runtime does not need the dispatcher if it can poll/receive a signal itself. It can call the claim endpoint, receive one leased event, read the referenced GitHub evidence, perform the permitted work, then ACK.

This means Phase 2 supports both:
- push/wake delivery;
- pull/claim execution.

## Fallback watcher

A scheduled watcher can call the dispatcher or claim endpoint when event-driven delivery is unavailable. The fallback exists to prevent Alexandre from becoming the human scheduler.

The fallback must obey the same boundaries:
- no duplicate active worker on one event;
- no merge/release authority;
- no production migration or automation activation without a separate authorization;
- no learner/canonical mutation merely because a coordination event exists.

## Runtime boundary

This PR proves repository behavior only.

Not activated by repository validation:
- Production database migration;
- Production wake URLs;
- Production wake secret;
- Pipedream;
- any external agent runtime;
- merge/release.

A real active-coordination witness requires:
1. database migration in an authorized runtime;
2. one configured wake target or direct worker;
3. event creation;
4. one successful claim;
5. wake or worker execution;
6. ACK/read-back proving the same event was consumed exactly once.
