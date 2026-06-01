# Security Specification - LoopLab Community Core Hub

## 1. Data Invariants
1. **CoreMember Integrity**: A member cannot exist with a fabricated or mismatching email or without standard contact fields (e.g., `discordUsername`, `joinedAt`).
2. **CoreTeam Capacity**: A circle/team cannot exceed its maximum capacity, and its currentMemberCount status must be updated carefully.
3. **StudentApplication Integrity**: An application must have a valid student section ('LoopLab' or 'LoopTech For Women'), position applied, and valid answers block. Once marked approved or rejected, its status cannot be changed by unauthenticated users or standard applicants.
4. **Verified Authenticity**: To prevent spamming or state poisoning, standard write operations (like creating applications) require authenticated users.

---

## 2. The "Dirty Dozen" Payloads (12 Anti-Patterns for ABAC/Integrity Bypasses)

### Member & Identity Exploits
1. **Payload 1: Unsocial Member spoof**
   An unauthenticated write attempting to create a CoreMember document directly.
2. **Payload 2: Spoofer UI Claim**
   An authenticated user 'A' trying to register a CoreMember record with a different user's `email` or mismatching identity fields.
3. **Payload 3: Immortal Field overwrite**
   An update payload seeking to alter the immutable `joinedAt` date of an existing CoreMember.

### Team & Capacity Exploits
4. **Payload 4: Empty Team Name injection**
   Creating a CoreTeam document with a blank or extremely long custom `teamName` string violating text boundaries.
5. **Payload 5: Negative Capacity state**
   Setting a negative number `maxCapacity` on a CoreTeam circle.
6. **Payload 6: Spoofed Circle Lead**
   An unauthorized user updating the `leadEmail` field to hijacking a custom core team lead position.

### Application & State Validation Exploits
7. **Payload 7: Unauthenticated application inject**
   An anonymous write trying to inject a StudentApplication bypass.
8. **Payload 8: Self-approval transition**
   An applicant updating their own StudentApplication `status` directly to `approved`.
9. **Payload 9: Terminal outcome bypass**
   Updating fields in an application that is already marked as `approved` (fully locked terminal state action).
10. **Payload 10: Value poisoning on assessment score**
    Injecting a spoofed gaming assessment score block with negative timer ticks.
11. **Payload 11: Spoofed email verify status**
    Submitting an application pretending to have a verified email token when the real user is unverified.
12. **Payload 12: Admin Notes injection**
    A standard user editing or updating the `adminNotes` field to approve or cheat the review comments.

---

## 3. Test Cases Configuration (`firestore.rules.test.ts`)
Standard unit runs will ensure that all these Dirty Dozen attempts return `PERMISSION_DENIED` securely.
