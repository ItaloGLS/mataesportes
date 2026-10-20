<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep shared presentation tokens in src/styles.css and reuse Shell and the UI Button; this preserves the approved presentation across real-data flows.
- Derive sports statistics from persisted user content, never fabricated records; supporting cover imagery is illustrative.
- Keep domain types and validation browser/DOM-independent, database access in server functions, and web UI separate; this enables a future first-party React Native client to share the database rules.
- Use per-request QueryClient instances with Router SSR query integration; this prevents stale hydration and cross-request cache leakage.
- Preload visible primary navigation routes on viewport entry and other links on intent, retaining Query-controlled freshness; this avoids downloading page chunks only after the first click without adding a second data cache.
- Maintain one root auth subscriber and session-driven navigation, with public loaders reading only public data; authenticated mutations validate identity server-side and RLS owns authorization.
- Keep registrations capacity-checked transactionally in PostgreSQL and résumé saves atomic; this makes the same invariants apply to web and native clients.
- Store sports media privately with owner-scoped uploads and short-lived read URLs for referenced public sports photos; this respects workspace storage restrictions.
- Apply shared soft-control and content-surface presentation rules across desktop and mobile while keeping native-size navigation mobile-only; this maintains one visual system for both surfaces.
