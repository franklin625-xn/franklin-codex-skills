# Resume Content Schema

Use this schema for `resume_content.json`. Preserve the user's finalized wording. Do not rewrite, polish, shorten, invent, or delete content unless explicitly asked.

## Top-level object

Required fields:

- `name`: string
- `contacts`: array of contact objects
- `summary`: string
- `experience`: array of experience objects
- `education`: array of education objects
- `skills`: object

No field is designed for a photo, sidebar, color theme, job description, or tailored content.

## Contacts

Each contact object requires:

- `type`: one of `email`, `phone`, `location`, `linkedin`
- `value`: string

Recommended order:

1. email
2. phone
3. location
4. linkedin

## Experience

Each experience object requires:

- `organization`: string
- `title`: string
- `date`: string
- `location`: string
- `bullets`: array of strings

Keep bullets compact enough for a one-page resume, but do not shorten them unless the user asks.

## Education

Each education object requires:

- `school`: string
- `degree`: string
- `date`: string
- `location`: string

## Skills

The `skills` object requires:

- `languages`: string
- `skills`: string

Use semicolon-separated phrases when the source content already uses compact skill lists.

## Example

```json
{
  "name": "Huidong Lin",
  "contacts": [
    {"type": "email", "value": "franklin625@163.com"},
    {"type": "phone", "value": "+86 159 0109 7325"},
    {"type": "location", "value": "Beijing, China"},
    {"type": "linkedin", "value": "huidong-lin"}
  ],
  "summary": "Professional summary text...",
  "experience": [
    {
      "organization": "Environmental Defense Fund",
      "title": "Specialist, Sustainable Trade",
      "date": "05/2023 - 05/2026",
      "location": "Beijing, China",
      "bullets": ["Bullet 1...", "Bullet 2..."]
    }
  ],
  "education": [
    {
      "school": "Peking University",
      "degree": "Master of International Public Policy; completed alongside full-time professional work",
      "date": "09/2023 - 06/2025",
      "location": "Beijing, China"
    }
  ],
  "skills": {
    "languages": "Mandarin Chinese native; English fluent",
    "skills": "Climate policy research; green trade; carbon markets; market intelligence; Microsoft Office Suite; Excel-based data analysis; Asana"
  }
}
```
