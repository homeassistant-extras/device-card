# AGENTS.md - Helpers

This folder contains project helper functions that support cards and tests.

- Keep helpers focused and testable without rendering a full card.
- Prefer existing helpers before adding another layer of utility functions.
- Avoid leaking test-only shortcuts into production helper modules.
- Add unit tests when helper behavior affects card output or entity selection.
