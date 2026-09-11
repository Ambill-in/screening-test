# Copilot instructions

## Project scope

This repository is a small TypeScript payment-allocation screening exercise. The
runtime code has no framework or database; the public API is exported from
`src/index.ts`, and behavior is exercised by Vitest tests under `tests/`.

The `Manware-s-AI-Learning-Toolkit/` directory is a separate, nested project
with its own `.github/copilot-instructions.md`. When working inside that
directory, follow its learning-companion workflow in addition to these
repository-level instructions.

## Build, typecheck, and test commands

Install dependencies with:

```bash
npm install
```

The CI-equivalent checks are:

```bash
npm run typecheck
npm test
```

Useful focused test commands:

```bash
npx vitest run tests/hooks.test.ts
npx vitest run tests/money.test.ts
npx vitest run -t "rejects duplicate invoice ids"
```

Use `npm run test:watch` for an interactive watch run while editing.

## Architecture

- `src/types.ts` defines payment, allocation, user, and pipeline context
  contracts. `src/constants.ts` defines server-managed payment fields.
- The hook modules under `src/hooks/` are small, composable transformations or
  validations: normalize nullable/sentinel values, remove managed fields,
  merge PATCH data, enforce tenant scope, and apply receipt-type rules.
- `src/services/allocationPipeline.ts` is the orchestration boundary. It
  processes create, patch, and remove operations, applying the hooks in the
  order required by the operation. It also validates allocation rows for
  duplicate invoices, non-negative amounts, and a total equal to the payment
  amount.
- `src/lib/money.ts` is the precision boundary for currency comparisons.
  Amounts must be normalized to two decimal places before equality or ordering
  decisions; raw floating-point sums are not reliable for billing rules.
- `src/lib/receiptType.ts` is the provided receipt classifier. TDS receipts
  represent tax credits rather than cash and therefore must have
  `amount_paid` forced to zero. Regular receipts preserve their amount.
- `src/index.ts` re-exports the public types, constants, hooks, helpers, and
  pipeline functions.

## Repository-specific conventions

- Preserve the pipeline semantics: PATCH payloads must be merged with the
  existing payment before rules that depend on inherited fields are applied;
  normalization and managed-field stripping must not mutate caller-owned
  objects; delete operations must enforce organization scope and reject synced
  payments.
- Non-superadmin requests require `query.organization_id` and it must equal the
  authenticated user’s organization. Superadmins bypass that query check.
- The UI sentinel `bank_account_id: "__none__"` and empty strings for
  `payment_mode` or `bank_account_id` are persisted as `null`.
- `public_key` and `payment_seq` are server-managed. Do not accept them from
  client payloads, and use `MANAGED_PAYMENT_FIELDS` rather than duplicating
  their names.
- Allocation totals and money comparisons use cent/paisa precision. Keep
  validation tolerant of representation noise while still rejecting a real
  over-allocation.
- Keep changes within the intended implementation surface. CI rejects changes
  to `tests/`, `src/constants.ts`, and `src/lib/receiptType.ts`; the README
  also prohibits adding dependencies. Existing tests and file comments are the
  behavioral specification.
- CI runs on Node.js 20 with `npm ci`, then `npm run typecheck` and `npm test`.
