import fs from 'node:fs/promises';
import * as cheerio from 'cheerio';

const SOURCE_URL = 'https://www.friendsofsap.ca/projects';
const OUTFILE = new URL('../src/data/projects.scraped.json', import.meta.url);

const sourceProjects = [
  { slug: 'food-forest', sourceTitle: 'Food Forest' },
  { slug: 'three-sisters-garden', sourceTitle: 'Three Sisters Garden', aliases: ['Three Sisters'] },
  { slug: 'hedgerow', sourceTitle: 'Hedgerow' },
  { slug: 'wildlife-enhancement', sourceTitle: 'Wildlife Enhancement' },
  { slug: 'wetland-restoration', sourceTitle: 'Wetland Restoration' },
  { slug: 'compost-and-biochar', sourceTitle: 'Compost & BioChar' },
  { slug: 'invasives', sourceTitle: 'Invasives' },
  { slug: 'farm-maintenance', sourceTitle: 'Farm Maintenance' },
  { slug: 'shade-sail-area', sourceTitle: 'Shade Sail Area' },
  { slug: 'community-gardens', sourceTitle: 'Community Gardens' },
  { slug: 'historic-barn', sourceTitle: 'Historic Barn' },
  { slug: 'gathering-place', sourceTitle: 'Gathering Place (Outdoor Classroom)' },
];

function clean(text = '') {
  return text
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function removeBoilerplate(text) {
  return clean(text)
    .replace(/Volunteer Now/gi, '')
    .replace(/Upcoming Events/gi, '')
    .replace(/Photo Gallery/gi, '')
    .replace(/Follow them on Facebook for regular updates\.?/gi, '')
    .replace(/The lead organization for this project is[^.]+\.?/gi, '')
    .trim();
}

function findFirstIndex(text, names, from = 0) {
  return names
    .map((name) => ({ name, index: text.indexOf(name, from) }))
    .filter((entry) => entry.index >= 0)
    .sort((a, b) => a.index - b.index)[0] || null;
}

function projectSections(pageText) {
  const result = [];
  let cursor = Math.max(0, pageText.indexOf('Food Forest'));

  sourceProjects.forEach((project, index) => {
    const names = [project.sourceTitle, ...(project.aliases || [])];
    const startMatch = findFirstIndex(pageText, names, cursor);
    if (!startMatch) {
      result.push({ ...project, rawText: '', found: false });
      return;
    }

    let end = pageText.length;
    const remainingNames = sourceProjects
      .slice(index + 1)
      .flatMap((next) => [next.sourceTitle, ...(next.aliases || [])]);

    remainingNames.forEach((name) => {
      const candidate = pageText.indexOf(name, startMatch.index + startMatch.name.length);
      if (candidate > startMatch.index && candidate < end) end = candidate;
    });

    const rawText = removeBoilerplate(pageText.slice(startMatch.index, end));
    result.push({ ...project, rawText, found: true });
    cursor = end;
  });

  return result;
}

function extractLead(text) {
  const matches = [];
  const patterns = [
    /Project Lead:\s*(.+?)(?=\s+(?:In the|The|Located|Volunteers|Engage|Ongoing|Community|Biochar|Compost|The barn|Coming Soon)|$)/i,
    /BioChar Lead:\s*(.+?)(?=\s+Compost Lead:|\s+Biochar|$)/i,
    /Compost Lead:\s*(.+?)(?=\s+Biochar|$)/i,
  ];

  patterns.forEach((pattern) => {
    const match = text.match(pattern);
    if (match?.[1]) matches.push(clean(match[1]));
  });

  return matches.join('; ');
}

function removeHeadingAndLead(text, project) {
  let output = text;
  [project.sourceTitle, ...(project.aliases || [])].forEach((name) => {
    output = output.replace(name, '');
  });
  return output
    .replace(/Project Lead:\s*.+?(?=\s+(?:In the|The|Located|Volunteers|Engage|Ongoing|Community|Biochar|Compost|The barn|Coming Soon)|$)/i, '')
    .replace(/BioChar Lead:\s*.+?(?=\s+Compost Lead:|\s+Biochar|$)/i, '')
    .replace(/Compost Lead:\s*.+?(?=\s+Biochar|$)/i, '')
    .trim();
}

function shortSummary(text, maxLength = 330) {
  const normalized = clean(text);
  if (normalized.length <= maxLength) return normalized;
  const excerpt = normalized.slice(0, maxLength);
  const sentence = Math.max(excerpt.lastIndexOf('.'), excerpt.lastIndexOf('!'), excerpt.lastIndexOf('?'));
  return `${(sentence > 120 ? excerpt.slice(0, sentence + 1) : excerpt).trim()}…`;
}

async function main() {
  const response = await fetch(SOURCE_URL, {
    headers: { 'user-agent': 'Friends-of-SAP-prototype-project-review/1.0' },
  });
  if (!response.ok) throw new Error(`Failed to fetch ${SOURCE_URL}: HTTP ${response.status}`);

  const html = await response.text();
  const $ = cheerio.load(html);
  const pageText = clean($('body').text());
  const sections = projectSections(pageText);

  const extracted = sections.map((project) => {
    const cleanedBody = removeHeadingAndLead(project.rawText, project);
    return {
      slug: project.slug,
      sourceTitle: project.sourceTitle,
      found: project.found,
      lead: extractLead(project.rawText),
      summaryDraft: shortSummary(cleanedBody),
      sourceText: cleanedBody,
      sourceUrl: SOURCE_URL,
      extractedAt: new Date().toISOString(),
    };
  });

  await fs.writeFile(OUTFILE, `${JSON.stringify(extracted, null, 2)}\n`);
  const foundCount = extracted.filter((project) => project.found).length;
  console.log(`Wrote ${extracted.length} project records (${foundCount} found) to ${OUTFILE.pathname}`);
  console.log('Review the output manually before changing src/data/projects.json.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
