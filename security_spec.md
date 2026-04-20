# Security Specification for Parkside Residences

## Data Invariants
- The `config/main` document must contain an `images` object.
- Every save must include an `updatedAt` server timestamp.
- No one can delete the main configuration document.

## The "Dirty Dozen" Payloads (Red Team Test Cases)
1. **Unauthorized Update**: Attempt to update `config/main` without being logged in.
2. **Identity Spoofing**: Attempt to set `updatedBy` to another user's UID.
3. **Malicious Key Injection**: Attempt to add a 1MB string to the `images` map.
4. **Invalid Type**: Attempt to set `images` to a boolean instead of an object.
5. **Schema Violation**: Update without the `updatedAt` field.
6. **Bypassing Verification**: Attempt to write as a logged-in user whose email is not verified.
7. **Role Escalation**: Attempt to create a document in an unprotected collection to gain admin status.
8. **Shadow Field**: Adding a `hidden_admin: true` field to the config doc.
9. **Terminal State Break**: Attempt to modify the `createdAt` (if implemented).
10. **Query Scraping**: Attempting to list the `config` collection if not authorized.
11. **Malicious ID**: Using a 2KB string as a document ID.
12. **Timestamp Fraud**: Providing a client-side timestamp for `updatedAt`.

## Test Plan
- Verify that `clairee0726@gmail.com` (verified) can update the config.
- Verify that any other user is denied write access.
- Verify that public users can read the config.
