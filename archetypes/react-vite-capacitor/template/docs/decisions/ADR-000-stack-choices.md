# ADR-000 - Stack choices for this archetype seed

- Status: Proposed
- Decision: React 19 + Vite + TypeScript + Capacitor-ready shell. Browser Supabase
  helpers are included because Signal already corrected that surface and it is a
  common web-first integration seam.

## Why this stays narrow

The archetype carries only what the current harvest justifies:

- React + Vite for the base web shell.
- Capability ports plus web adapters for the OM platform boundary.
- Supabase browser env/client guards as a corrected shared control.

It does not ship broad product defaults like charts, state libraries, UI kits, or
backend-specific feature modules. Products add those from accepted requirements.
