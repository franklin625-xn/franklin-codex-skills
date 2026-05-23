# Franklin Resume PDF

Reusable Codex skill for exporting Franklin's finalized English resume content as a fixed-layout one-page A4 PDF.

## How to use

Use the skill with a finalized English resume draft or a structured `resume_content.json` file. The skill is for faithful conversion, validation, and PDF export only. It does not tailor, rewrite, polish, shorten, invent, or delete resume content unless explicitly asked.

## Where to put `resume_content.json`

Place `resume_content.json` in the directory where you run the generator. The script reads that file from the current working directory.

If `resume_content.json` is not present, the script uses `examples/resume_content.example.json` and prints a clear fallback message.

## How to run the PDF generator

From the directory that contains your `resume_content.json`, run:

```bash
node /path/to/franklin-resume-pdf/scripts/generate_resume_pdf.js
```

The generator writes:

- `output/resume.html`
- `output/resume.pdf`

It also reports whether the PDF is exactly one page.

## Regenerate after content changes

Edit `resume_content.json`, then run the same generator command again. The script overwrites the HTML and PDF in `output/`.

## If content overflows

The script first tries compact layout adjustments without changing content. If the resume still does not fit one A4 page, reduce one or more of:

- summary length
- EDF bullet count
- bullet length
- skills line length

Do not modify the template just to force oversized content onto the page.

## Customize the output filename

Use `--output-name` with a basename:

```bash
node /path/to/franklin-resume-pdf/scripts/generate_resume_pdf.js --output-name huidong-lin-resume
```

This writes:

- `output/huidong-lin-resume.html`
- `output/huidong-lin-resume.pdf`

The template and style files remain unchanged.
