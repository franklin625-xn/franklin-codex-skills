---
name: franklin-resume-pdf
description: Convert Franklin's finalized English resume draft or resume_content.json into a stable one-page A4 PDF using a fixed black-and-white resume layout with inline SVG icons, section rules, compact typography, and overflow checks. Use when Codex needs to faithfully structure finalized resume content, validate resume_content.json, or export output/resume.html and output/resume.pdf without tailoring, rewriting, polishing, shortening, inventing, or deleting resume content.
---

# Franklin Resume PDF

## Purpose

Use this skill only for stable formatting and PDF export of finalized English resume content. Preserve the fixed one-page A4 layout, section order, typography, spacing, icons, and black-and-white consulting-style design.

Do not tailor the resume to a job description. Do not rewrite, polish, shorten, invent, or delete content unless the user explicitly asks for content editing.

## Workflow

1. If the user provides raw finalized resume text, convert it faithfully into `resume_content.json` using the schema in `references/resume_content_schema.md`. Preserve meaning, sequence, dates, names, bullets, and wording as closely as possible.
2. If the user provides `resume_content.json`, validate it against `references/resume_content_schema.md`.
3. Place `resume_content.json` in the current working directory before running the generator. If it is absent, the generator uses `examples/resume_content.example.json` and prints a clear message.
4. Run:

   ```bash
   node /path/to/franklin-resume-pdf/scripts/generate_resume_pdf.js
   ```

5. Report the generated paths for `output/resume.html` and `output/resume.pdf`, plus whether the PDF is exactly one A4 page.

## Generator

The script `scripts/generate_resume_pdf.js`:

- Reads `resume_content.json` from the current working directory.
- Falls back to `examples/resume_content.example.json` when no local content file exists.
- Uses `assets/resume_template.html` and `assets/resume_style.css` as the layout source.
- Uses Playwright to render and export the PDF.
- Writes `output/resume.html` and `output/resume.pdf` by default.
- Accepts `--output-name <basename>` to customize output filenames without changing the template.
- Tries compact layout classes in order, then warns if content still overflows one A4 page.

If the runtime cannot resolve Playwright, use a Node environment with Playwright available. Do not add internet resources, remote fonts, icon libraries, icon fonts, or external visual assets.

## Overflow Policy

If content does not fit one page, do not rewrite or delete content. The generator applies layout adjustments in this order:

1. Reduce section spacing slightly.
2. Reduce bullet spacing slightly.
3. Reduce line-height slightly.
4. Reduce body font size, never below 10.5px.
5. If still overflowing, print a warning naming the likely long section and suggest reducing summary length, EDF bullet count, bullet length, or skills line length.

## Fixed Layout Rules

- One A4 page, single column, no photo, no sidebar, no decorative borders.
- System fonts only: Arial, Helvetica, or Noto Sans.
- Black and dark gray text with subtle gray section rules.
- Name at top, contact row below with small inline SVG icons.
- Sections in this exact order: Professional Summary, Professional Experience, Education, Languages & Skills.
- Section titles use small inline SVG icons and horizontal rules.
- Experience entries use bold organization names on the left, date/location right-aligned, role title below, then compact bullets.
- Education entries use bold school names on the left, date/location right-aligned, then degree line below.
