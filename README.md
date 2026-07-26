# badzwanzen

Aan meerdere features tegelijk werken? Zie [docs/worktrees.md](docs/worktrees.md).

## Development

```bash
npm install      # install dependencies
npm run dev      # start the Vite dev server
npm run build    # type-check and build for production
npm run lint     # lint with oxlint
npm test         # run the Vitest test suite
```

## Deployment

The app is a static Vite + React build hosted on [Vercel](https://vercel.com), linked to this
GitHub repository. Build settings (`buildCommand`, `outputDirectory`, `framework`) are pinned
in [`vercel.json`](./vercel.json) so they're reviewable in the repo instead of only living in
the Vercel dashboard.

- **Production**: every push/merge to `main` triggers a new production deployment
  automatically. If a build fails, the previous production deployment stays live — nothing
  broken is ever published.
- **Previews**: every pull request gets its own preview deployment with a unique URL, posted
  as a check/comment on the PR. New commits to the PR update the same preview URL.

See [specs/005-deployment/](specs/005-deployment/) for the full spec, plan, and
[quickstart.md](specs/005-deployment/quickstart.md) for the setup/verification walkthrough.