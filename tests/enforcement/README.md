# tests/enforcement — where OM §15 becomes real

**R23: every CI rule has a passing AND a failing fixture.**

A check only ever run against good input is not a control. It is a wish with a green
tick next to it.

Three confirmed defects in the previous repository — `scan-secrets.ps1` blanket-excluding
`projects/`, the receipt validator's regex missing `"pending"`, and
`get-workflow-obligations.ps1` being inert on committed trees — **all passed every test
they were ever given**, because they were never given a test they should fail.

## The rule for contributors

If you add a check to `scripts/verify-core.ts` and do not add a **failing fixture** here,
the rule **does not count as enforcement** and reverts to REVIEW class in OM §15.

There is no exception to this. It is the cheapest control in the entire system and it
would have caught every enforcement defect in the repository's history.
