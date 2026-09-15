/**
 * Dynamic Skill Alias & Equivalence Utility.
 *
 * Algorithmically normalizes common spelling variations, punctuation differences,
 * common suffixes (e.g. "React" vs "React.js", "Node" vs "NodeJS"),
 * prefixes (e.g. "Postgres" vs "PostgreSQL"), and cross-industry acronyms
 * (e.g. "AWS" vs "Amazon Web Services", "GAAP" vs "Generally Accepted Accounting Principles",
 * "BLS" vs "Basic Life Support", "SEO" vs "Search Engine Optimization").
 *
 * Fully dynamic and domain-agnostic with ZERO hardcoded dictionary maintenance.
 */

/**
 * Normalizes a skill string for comparison (lowercased, trimmed, whitespace collapsed).
 */
export function normalizeSkillString(skill: string): string {
  if (!skill || typeof skill !== 'string') return '';
  return skill
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Strips formatting noise and common domain suffixes (e.g. .js, js, css, api, sql)
 * to compute a stemmed canonical root without maintaining static lists.
 */
export function getStemmedSkill(skill: string): string {
  if (!skill || typeof skill !== 'string') return '';
  let clean = skill
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9+#]/g, '');

  // Guard distinct isolated words from stem collisions (e.g. Java vs JavaScript, Go vs Django)
  const strictIsolated = new Set(['java', 'javascript', 'go', 'c', 'c++', 'c#', 'r', 'rust']);
  if (strictIsolated.has(clean)) {
    return clean;
  }

  // Strip common tool suffixes
  clean = clean
    .replace(/(?:js|css|apis?|sql|framework)$/i, '')
    .replace(/\s*(?:v?\d+(?:\.\d+)?|\d+\+?)$/i, '') // strip trailing version numbers like 2+, 3.0
    .trim();

  return clean || normalizeSkillString(skill);
}

/**
 * Generates an acronym from a multi-word phrase by extracting the first letter
 * of each significant word (e.g. "Amazon Web Services" -> "aws", "Basic Life Support" -> "bls").
 */
export function generateAcronym(multiWordPhrase: string): string {
  if (!multiWordPhrase || typeof multiWordPhrase !== 'string') return '';

  const stopWords = new Set(['and', 'or', '&', 'of', 'the', 'for', 'in', 'to', 'with', 'on']);
  const words = multiWordPhrase
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0 && !stopWords.has(w));

  if (words.length <= 1) return '';
  return words.map((w) => w[0]).join('');
}

/**
 * Resolves a skill name to its canonical identifier dynamically.
 */
export function getCanonicalSkillId(skill: string): string {
  return getStemmedSkill(skill);
}

/**
 * Helper to determine if a multi-word or compound skill phrase cleanly contains another
 * without false positives on distinct short words (e.g. Java vs JavaScript).
 */
function isPhraseContainedSafely(phraseA: string, phraseB: string): boolean {
  if (!phraseA || !phraseB) return false;
  const a = phraseA.toLowerCase().trim();
  const b = phraseB.toLowerCase().trim();
  if (a === b) return true;
  if (a.length < 3 || b.length < 3) return false;

  const strictIsolated = new Set(['java', 'javascript', 'go', 'c', 'c++', 'c#', 'r', 'rust']);
  if (strictIsolated.has(a) || strictIsolated.has(b)) {
    return false;
  }

  const shorter = a.length <= b.length ? a : b;
  const longer = a.length <= b.length ? b : a;

  const escaped = shorter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const boundaryRegex = new RegExp(`(?:^|[^a-zA-Z0-9])${escaped}(?:$|[^a-zA-Z0-9])`, 'i');
  return boundaryRegex.test(longer);
}

/**
 * Checks if two skill names are equivalent dynamically through:
 * 1. Normalized text equality
 * 2. Stemmed root equality (React.js == React, Tailwind CSS == Tailwind)
 * 3. Dynamic acronym matching (AWS == Amazon Web Services, GAAP == Generally Accepted Accounting Principles)
 * 4. Safe word-boundary phrase containment
 */
export function areSkillsEquivalent(skillA: string, skillB: string): boolean {
  if (!skillA || !skillB) return false;

  const normA = normalizeSkillString(skillA);
  const normB = normalizeSkillString(skillB);
  if (normA === normB) return true;

  // Guard distinct isolated words (e.g. Java != JavaScript, React != Angular)
  const strictIsolated = new Set(['java', 'javascript', 'go', 'c', 'c++', 'c#', 'r', 'rust']);
  if ((strictIsolated.has(normA) || strictIsolated.has(normB)) && normA !== normB) {
    return false;
  }

  // 1. Stemmed comparison (React.js vs React, Node.js vs NodeJS vs Node)
  const stemA = getStemmedSkill(skillA);
  const stemB = getStemmedSkill(skillB);
  if (stemA && stemB && stemA === stemB) return true;

  // 2. Dynamic Acronym matching
  const shorter = normA.length <= normB.length ? normA : normB;
  const longer = normA.length <= normB.length ? normB : normA;

  const cleanShorter = shorter.replace(/[^a-z0-9]/g, '');
  if (cleanShorter.length >= 2 && cleanShorter.length <= 5) {
    const generated = generateAcronym(longer);
    if (generated && cleanShorter === generated) {
      return true;
    }
  }

  // Common single-word abbreviation fast-paths (e.g. TypeScript <-> TS, Postgres <-> PostgreSQL)
  if ((cleanShorter === 'ts' && longer === 'typescript') || (cleanShorter === 'js' && longer === 'javascript')) {
    return true;
  }
  if (longer.startsWith(shorter) && shorter.length >= 5) {
    // e.g. postgresql starts with postgres
    return true;
  }

  // 3. Word-boundary containment (e.g. "Advanced Excel" contains "Excel")
  if (isPhraseContainedSafely(normA, normB)) {
    return true;
  }

  return false;
}

/**
 * Determines whether a given job description skill is covered by any of the candidate's skills.
 * Evaluates dynamic equivalence across exact, stemmed, acronym, or phrase containment matches.
 */
export function isSkillCoveredByCandidate(
  targetSkill: string,
  candidateSkills: string[],
): boolean {
  if (!targetSkill || !Array.isArray(candidateSkills) || candidateSkills.length === 0) {
    return false;
  }

  return candidateSkills.some((candidateSkill) =>
    areSkillsEquivalent(targetSkill, candidateSkill),
  );
}

/**
 * Finds the matching original skill from a candidate list for a target JD skill if equivalent.
 */
export function findMatchingAliasInCandidateSkills(
  targetSkill: string,
  candidateSkills: string[],
): string | null {
  if (!targetSkill || !Array.isArray(candidateSkills)) return null;

  for (const candidateSkill of candidateSkills) {
    if (areSkillsEquivalent(targetSkill, candidateSkill)) {
      return candidateSkill;
    }
  }

  return null;
}
