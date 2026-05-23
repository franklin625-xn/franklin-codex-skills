# Franklin Codex Skills

Personal Codex skills maintained as separate folders in one repository.

## Skills

- `franklin-resume-pdf`: Export finalized English resume content to a fixed-layout one-page A4 PDF.

## Repository structure

Each skill should live in its own top-level folder:

```text
skill-name/
├── SKILL.md
├── agents/
├── assets/
├── examples/
├── references/
└── scripts/
```

This layout supports multiple skills in the same repo while keeping each skill self-contained.

## Install locally

Copy or symlink the desired skill folder into your Codex skills directory:

```bash
cp -R franklin-resume-pdf ~/.codex/skills/franklin-resume-pdf
```

Restart or refresh Codex if the skill does not appear immediately in the Skills management UI.
