#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const { createRequire } = require("module");

const SKILL_DIR = path.resolve(__dirname, "..");
const TEMPLATE_PATH = path.join(SKILL_DIR, "assets", "resume_template.html");
const STYLE_PATH = path.join(SKILL_DIR, "assets", "resume_style.css");
const EXAMPLE_PATH = path.join(SKILL_DIR, "examples", "resume_content.example.json");

const DENSITY_CLASSES = [
  "",
  "compact-space",
  "compact-bullets",
  "compact-line-height",
  "compact-font"
];

const CONTACT_ICON_BY_TYPE = {
  email: "icon-email",
  phone: "icon-phone",
  location: "icon-location",
  linkedin: "icon-linkedin"
};

function parseArgs(argv) {
  const args = {
    outputName: "resume",
    contentPath: path.join(process.cwd(), "resume_content.json")
  };

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--output-name") {
      args.outputName = argv[index + 1];
      index += 1;
    } else if (arg === "--content") {
      args.contentPath = path.resolve(argv[index + 1]);
      index += 1;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!args.outputName) {
    throw new Error("--output-name requires a value.");
  }

  args.outputName = path.basename(args.outputName, path.extname(args.outputName))
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!args.outputName) {
    throw new Error("--output-name must contain at least one filename-safe character.");
  }

  return args;
}

function printHelp() {
  console.log(`Usage:
  node scripts/generate_resume_pdf.js [--output-name resume]

Behavior:
  Reads resume_content.json from the current working directory.
  Falls back to examples/resume_content.example.json if no local resume_content.json exists.
  Writes output/<name>.html and output/<name>.pdf.`);
}

function readJsonContent(contentPath) {
  const hasLocalContent = fs.existsSync(contentPath);
  const sourcePath = hasLocalContent ? contentPath : EXAMPLE_PATH;

  if (!hasLocalContent) {
    console.log(`No resume_content.json found in ${process.cwd()}. Using example content: ${EXAMPLE_PATH}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  } catch (error) {
    throw new Error(`Unable to read valid JSON from ${sourcePath}: ${error.message}`);
  }

  return { content: parsed, sourcePath, usedExample: !hasLocalContent };
}

function assertString(value, label, errors) {
  if (typeof value !== "string" || value.trim() === "") {
    errors.push(`${label} must be a non-empty string.`);
  }
}

function validateResumeContent(content) {
  const errors = [];

  if (!content || typeof content !== "object" || Array.isArray(content)) {
    throw new Error("resume_content.json must contain a JSON object.");
  }

  assertString(content.name, "name", errors);
  assertString(content.summary, "summary", errors);

  if (!Array.isArray(content.contacts) || content.contacts.length === 0) {
    errors.push("contacts must be a non-empty array.");
  } else {
    content.contacts.forEach((contact, index) => {
      const label = `contacts[${index}]`;
      if (!contact || typeof contact !== "object" || Array.isArray(contact)) {
        errors.push(`${label} must be an object.`);
        return;
      }
      if (!Object.prototype.hasOwnProperty.call(CONTACT_ICON_BY_TYPE, contact.type)) {
        errors.push(`${label}.type must be one of email, phone, location, linkedin.`);
      }
      assertString(contact.value, `${label}.value`, errors);
    });
  }

  if (!Array.isArray(content.experience) || content.experience.length === 0) {
    errors.push("experience must be a non-empty array.");
  } else {
    content.experience.forEach((entry, index) => {
      const label = `experience[${index}]`;
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        errors.push(`${label} must be an object.`);
        return;
      }
      assertString(entry.organization, `${label}.organization`, errors);
      assertString(entry.title, `${label}.title`, errors);
      assertString(entry.date, `${label}.date`, errors);
      assertString(entry.location, `${label}.location`, errors);
      if (!Array.isArray(entry.bullets) || entry.bullets.length === 0) {
        errors.push(`${label}.bullets must be a non-empty array.`);
      } else {
        entry.bullets.forEach((bullet, bulletIndex) => {
          assertString(bullet, `${label}.bullets[${bulletIndex}]`, errors);
        });
      }
    });
  }

  if (!Array.isArray(content.education) || content.education.length === 0) {
    errors.push("education must be a non-empty array.");
  } else {
    content.education.forEach((entry, index) => {
      const label = `education[${index}]`;
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        errors.push(`${label} must be an object.`);
        return;
      }
      assertString(entry.school, `${label}.school`, errors);
      assertString(entry.degree, `${label}.degree`, errors);
      assertString(entry.date, `${label}.date`, errors);
      assertString(entry.location, `${label}.location`, errors);
    });
  }

  if (!content.skills || typeof content.skills !== "object" || Array.isArray(content.skills)) {
    errors.push("skills must be an object.");
  } else {
    assertString(content.skills.languages, "skills.languages", errors);
    assertString(content.skills.skills, "skills.skills", errors);
  }

  if (errors.length > 0) {
    throw new Error(`resume_content.json validation failed:\n- ${errors.join("\n- ")}`);
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function iconUse(symbolId, className) {
  return `<svg class="${className}" aria-hidden="true"><use href="#${symbolId}"></use></svg>`;
}

function renderContacts(contacts) {
  return contacts.map((contact) => {
    const iconId = CONTACT_ICON_BY_TYPE[contact.type];
    return `        <span class="contact-item">${iconUse(iconId, "contact-icon")}<span>${escapeHtml(contact.value)}</span></span>`;
  }).join("\n");
}

function renderExperience(experience) {
  return experience.map((entry) => {
    const bullets = entry.bullets
      .map((bullet) => `          <li><span class="bullet-symbol">•</span><span>${escapeHtml(bullet)}</span></li>`)
      .join("\n");

    return `      <article class="entry">
        <div class="entry-head">
          <div class="entry-name">${escapeHtml(entry.organization)}</div>
          <div class="entry-meta">${escapeHtml(entry.date)} | ${escapeHtml(entry.location)}</div>
        </div>
        <div class="entry-title">${escapeHtml(entry.title)}</div>
        <ul>
${bullets}
        </ul>
      </article>`;
  }).join("\n");
}

function renderEducation(education) {
  return education.map((entry) => {
    return `      <article class="entry">
        <div class="entry-head">
          <div class="entry-name">${escapeHtml(entry.school)}</div>
          <div class="entry-meta">${escapeHtml(entry.date)} | ${escapeHtml(entry.location)}</div>
        </div>
        <div class="degree-line">${escapeHtml(entry.degree)}</div>
      </article>`;
  }).join("\n");
}

function renderHtml(content, densityClass) {
  const template = fs.readFileSync(TEMPLATE_PATH, "utf8");
  const css = fs.readFileSync(STYLE_PATH, "utf8");

  return template
    .replaceAll("{{DOCUMENT_TITLE}}", `${escapeHtml(content.name)} Resume`)
    .replaceAll("{{CSS}}", css)
    .replaceAll("{{DENSITY_CLASS}}", densityClass)
    .replaceAll("{{NAME}}", escapeHtml(content.name))
    .replaceAll("{{CONTACTS}}", renderContacts(content.contacts))
    .replaceAll("{{SUMMARY}}", escapeHtml(content.summary))
    .replaceAll("{{EXPERIENCE}}", renderExperience(content.experience))
    .replaceAll("{{EDUCATION}}", renderEducation(content.education))
    .replaceAll("{{LANGUAGES}}", escapeHtml(content.skills.languages))
    .replaceAll("{{SKILLS}}", escapeHtml(content.skills.skills));
}

function resolvePlaywright() {
  const candidates = [];
  if (process.env.NODE_PATH) {
    candidates.push(...process.env.NODE_PATH.split(path.delimiter).filter(Boolean));
  }
  candidates.push(path.join(os.homedir(), ".cache", "codex-runtimes", "codex-primary-runtime", "dependencies", "node", "node_modules"));

  try {
    return require("playwright");
  } catch {}

  for (const moduleDir of candidates) {
    try {
      const requireFromDir = createRequire(path.join(moduleDir, "package.json"));
      return requireFromDir("playwright");
    } catch {}
  }

  throw new Error("Playwright is required to export the PDF, but it could not be resolved. Run with a Node environment that has Playwright available.");
}

async function launchChromium(chromium) {
  const attempts = [
    { label: "bundled Playwright Chromium", options: { headless: true } },
    { label: "system Google Chrome", options: { headless: true, channel: "chrome" } },
    { label: "system Microsoft Edge", options: { headless: true, channel: "msedge" } }
  ];
  const errors = [];

  for (const attempt of attempts) {
    try {
      return await chromium.launch(attempt.options);
    } catch (error) {
      errors.push(`${attempt.label}: ${error.message.split("\n")[0]}`);
    }
  }

  throw new Error(`Unable to launch a Chromium browser for PDF export.\n- ${errors.join("\n- ")}`);
}

async function measurePage(page, html) {
  await page.setContent(html, { waitUntil: "load" });
  return page.evaluate(() => {
    const resumePage = document.querySelector("#resume-page");
    const pageBox = resumePage.getBoundingClientRect();
    const contentBottom = Array.from(resumePage.children).reduce((bottom, child) => {
      const childBox = child.getBoundingClientRect();
      return Math.max(bottom, childBox.bottom - pageBox.top);
    }, 0);
    const sections = Array.from(document.querySelectorAll(".resume-section")).map((section) => {
      const box = section.getBoundingClientRect();
      return {
        key: section.dataset.sectionKey,
        height: Math.round(box.height)
      };
    });
    const overflowPx = contentBottom - resumePage.clientHeight;
    return {
      fits: overflowPx <= 1,
      overflowPx: Math.max(0, Math.round(overflowPx)),
      sections
    };
  });
}

function countPdfPages(pdfBuffer) {
  const text = pdfBuffer.toString("latin1");
  return (text.match(/\/Type\s*\/Page\b/g) || []).length;
}

function likelyLongSection(content, measurement) {
  const sectionLabels = {
    summary: "Professional Summary",
    experience: "Professional Experience",
    education: "Education",
    skills: "Languages & Skills"
  };
  const tallest = [...(measurement.sections || [])].sort((a, b) => b.height - a.height)[0];
  const label = tallest ? sectionLabels[tallest.key] || tallest.key : "Professional Experience";

  const edf = content.experience.find((entry) => /environmental defense fund|edf/i.test(entry.organization));
  const edfBulletCount = edf ? edf.bullets.length : 0;
  const longestExperience = [...content.experience].sort((a, b) => {
    const aLength = a.bullets.join(" ").length;
    const bLength = b.bullets.join(" ").length;
    return bLength - aLength;
  })[0];

  return {
    label,
    edfBulletCount,
    longestExperience: longestExperience ? longestExperience.organization : ""
  };
}

async function main() {
  const args = parseArgs(process.argv);
  const { content, sourcePath } = readJsonContent(args.contentPath);
  validateResumeContent(content);

  const outputDir = path.join(process.cwd(), "output");
  fs.mkdirSync(outputDir, { recursive: true });
  const htmlPath = path.join(outputDir, `${args.outputName}.html`);
  const pdfPath = path.join(outputDir, `${args.outputName}.pdf`);

  const { chromium } = resolvePlaywright();
  const browser = await launchChromium(chromium);
  const page = await browser.newPage({
    viewport: { width: 794, height: 1123 },
    deviceScaleFactor: 1
  });

  let chosen = null;
  let finalMeasurement = null;

  for (const densityClass of DENSITY_CLASSES) {
    const html = renderHtml(content, densityClass);
    const measurement = await measurePage(page, html);
    finalMeasurement = measurement;
    chosen = { densityClass, html };
    if (measurement.fits) {
      break;
    }
  }

  fs.writeFileSync(htmlPath, chosen.html, "utf8");
  await page.setContent(chosen.html, { waitUntil: "load" });
  const pdfBuffer = await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" }
  });
  await browser.close();

  const pageCount = countPdfPages(pdfBuffer);
  const isExactlyOnePage = pageCount === 1;

  console.log(`Input: ${sourcePath}`);
  console.log(`HTML: ${htmlPath}`);
  console.log(`PDF: ${pdfPath}`);
  console.log(`Layout density: ${chosen.densityClass || "standard"}`);
  console.log(`PDF exactly one page: ${isExactlyOnePage ? "yes" : "no"} (${pageCount} page${pageCount === 1 ? "" : "s"})`);

  if (!finalMeasurement.fits || !isExactlyOnePage) {
    const likely = likelyLongSection(content, finalMeasurement);
    console.warn("");
    console.warn("WARNING: Content still appears to overflow the one-page A4 layout after all allowed layout adjustments.");
    console.warn(`Likely long section: ${likely.label}${likely.longestExperience ? ` (${likely.longestExperience})` : ""}.`);
    if (likely.edfBulletCount > 0) {
      console.warn(`Environmental Defense Fund bullet count: ${likely.edfBulletCount}.`);
    }
    console.warn("Suggested content reductions, only if the user approves content editing: summary length, EDF bullet count, bullet length, or skills line length.");
  }
}

main().catch((error) => {
  console.error(`ERROR: ${error.message}`);
  process.exit(1);
});
