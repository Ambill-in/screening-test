# Ambill Engineering Screen

**Stack:** TypeScript (no database or framework setup)

## Your task

Several functions that run **before a payment is saved** are incomplete or buggy. Your job:

1. Run `npm install` then `npm test` — some tests will fail.
2. Fix the files listed in **[Files to implement](#files-to-implement)** until **all 31 tests pass**.
3. Open a **pull request** into this repo (see [Submit](#submit)).

Work only in `src/`. Do not edit `tests/`, `src/lib/receiptType.ts`, or `src/constants.ts`.

---

## Quick start

```bash
npm install
npm test              # see which tests fail
npm run test:watch    # optional: re-run on save
```

Each failing test names the behavior that is missing. Use the test output together with the file comments and the [background](#background-billing-rules) below.

---

## Files to implement

| # | File | What you need to make work |
|---|------|----------------------------|
| 1 | `src/lib/money.ts` | Round amounts to 2 decimal places. Compare money using cent (paisa) precision, not raw `===`. |
| 2 | `src/hooks/normalizePayload.ts` | Turn empty strings on `payment_mode` and `bank_account_id` into `null`. Turn `bank_account_id: "__none__"` into `null`. |
| 3 | `src/hooks/stripManagedFields.ts` | Remove **managed fields** — the field names passed in the `fields` argument. In this exercise that list is always `MANAGED_PAYMENT_FIELDS` in `src/constants.ts` (`public_key`, `payment_seq`). Works for one record or an array. |
| 4 | `src/hooks/mergePatch.ts` | On PATCH, combine the existing payment with the partial update. Fields not in the patch must stay from the existing record. |
| 5 | `src/hooks/applyReceiptTypeRules.ts` | Apply receipt-type rules from the [background](#background-billing-rules) (see TDS). Use `isTdsReceipt()` from `src/lib/receiptType.ts`. |
| 6 | `src/hooks/enforceOrgScope.ts` | Non–superadmin users must pass `organization_id` in the query, and it must match their own org. Throw `Unauthorized Access` on mismatch. |
| 7 | `src/services/allocationPipeline.ts` | Wire hooks in the right order for create/patch, fix `canDeletePayment`, and fix `validateAllocationTotal` so allocation sums match the payment amount reliably. |

**Suggested order:** 1 → 6 (hooks in isolation), then 7 (pipeline wires them together).

---

## Background: billing rules

Ambill helps finance teams track **accounts receivable** — money customers owe and pay against invoices.

| Rule | Meaning |
|------|---------|
| **Allocations** | A payment is split across invoices. The total allocated must equal the payment amount. |
| **REGULAR receipt** | Normal cash/bank receipt against invoices. |
| **TDS receipt** | Tax deducted at source — a tax credit, **not** cash in the bank. Must not store cash in `amount_paid`. |
| **Synced payments** | If `sync_status` is `success`, the payment was sent to the customer's accounting system and must not be deleted. |
| **Organizations** | Each customer is a separate tenant. Users may only access their own `organization_id`. |
| **`__none__` sentinel** | The UI sends `__none__` when no bank account is selected. The API must store `null` instead. |
| **Managed fields** | `public_key` and `payment_seq` are set by the server. Clients must not send them — see `MANAGED_PAYMENT_FIELDS` in `src/constants.ts`. |

---

## Submit

**Open a pull request** — this is how we receive and review submissions. No email required.

### Steps

1. **Fork** this repo to your GitHub account.
2. Clone your fork locally.
3. Create a branch named `firstname-lastname` (lowercase, hyphens):

   ```bash
   git checkout -b jane-doe
   ```

4. Fix the code until `npm test` shows **31 passing** locally.
5. Commit, push to your fork:

   ```bash
   git push -u origin jane-doe
   ```

6. Open a **pull request from your fork into this repository** (the original `Ambill-in/screening-test`, not your fork):

   - Go to **your fork** on GitHub.
   - Click **Contribute** → **Open pull request** (or use the banner GitHub shows after you push).
   - Set **base repository** to `Ambill-in/screening-test` and **base** to `main`.
   - Set **head repository** to **your fork** and **compare** to your branch (e.g. `jane-doe`).
   - Click **Create pull request**.

   You are proposing changes from your fork’s branch into our `main`. That pull request is your submission.

7. Fill in the PR template (name, email, written answers, checklist).
8. Wait for CI on the PR to turn green.

**Your submission is the pull request.** We review open PRs — you do not need to email anyone.

If you were given a Google Form link in your invitation email, submit it once after opening your PR (name, email, GitHub username).

---

## Written answers (required)

Answer both in the **pull request description** (template provided when you open the PR).

**1.** What was the hardest bug to fix? Describe what failed, the root cause, and how you fixed it.

**2.** How is a TDS payment different from a REGULAR payment in this exercise, and where in your code did you enforce that?

---

## Rules

- AI and other tools are fine — we want to see how you work with them.
- Do not modify anything under `tests/`, `src/constants.ts`, or `src/lib/receiptType.ts` (CI rejects PRs that change tests).
- Do not add npm dependencies.

Good luck.
