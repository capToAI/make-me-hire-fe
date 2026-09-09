/**
 * Canonical Skill Alias Dictionary & Utility Functions.
 *
 * Normalizes common variations, acronyms, and phrasing differences
 * (e.g. "React" vs "React.js", "Node" vs "Node.js", "Postgres" vs "PostgreSQL")
 * so ATS scoring and tailoring treat synonyms as verified possessed skills,
 * automatically harmonizing phrasing without requesting unnecessary user confirmation.
 */

// Mapping of canonical skill group keys to lists of accepted interchangeable variations
export const CANONICAL_SKILL_GROUPS: Record<string, string[]> = {
  react: ['react', 'react.js', 'reactjs', 'react js'],
  node: ['node', 'node.js', 'nodejs', 'node js'],
  nextjs: ['next', 'next.js', 'nextjs', 'next js'],
  vue: ['vue', 'vue.js', 'vuejs', 'vue js'],
  angular: ['angular', 'angular.js', 'angularjs', 'angular js', 'angular 2+'],
  typescript: ['typescript', 'ts'],
  javascript: ['javascript', 'js', 'ecmascript', 'es6', 'es6+'],
  python: ['python', 'python3', 'python 3'],
  golang: ['golang', 'go lang', 'go'],
  csharp: ['c#', 'csharp', 'c sharp', '.net', 'dotnet'],
  cpp: ['c++', 'cpp'],
  postgres: ['postgres', 'postgresql', 'postgre sql'],
  mongo: ['mongo', 'mongodb', 'mongo db'],
  mysql: ['mysql', 'my sql'],
  redis: ['redis', 'redis cache'],
  aws: ['aws', 'amazon web services', 'amazon aws'],
  azure: ['azure', 'microsoft azure'],
  gcp: ['gcp', 'google cloud', 'google cloud platform'],
  docker: ['docker', 'containerization', 'docker containers'],
  kubernetes: ['kubernetes', 'k8s'],
  cicd: ['ci/cd', 'cicd', 'ci cd', 'continuous integration', 'continuous deployment'],
  rest: ['rest', 'restful', 'rest api', 'rest apis', 'restful api', 'restful apis'],
  graphql: ['graphql', 'gql'],
  tailwind: ['tailwind', 'tailwind css', 'tailwindcss'],
  bootstrap: ['bootstrap', 'bootstrap 5', 'bootstrap 4'],
  sass: ['sass', 'scss'],
  html: ['html', 'html5', 'html 5'],
  css: ['css', 'css3', 'css 3'],
  redux: ['redux', 'redux toolkit', 'rtk'],
  git: ['git', 'github', 'gitlab', 'version control', 'source control'],
  jest: ['jest', 'jest testing'],
  cypress: ['cypress', 'cypress.io'],
  playwright: ['playwright'],
  linux: ['linux', 'unix'],
  microservices: ['microservices', 'microservice architecture', 'micro services'],
  agile: ['agile', 'scrum', 'kanban'],
  kafka: ['kafka', 'apache kafka'],
  rabbitmq: ['rabbitmq', 'rabbit mq'],
  elasticsearch: ['elasticsearch', 'elastic search', 'elk stack'],
};

// Fast lookup table: normalized variant string -> canonical group id
const VARIANT_TO_CANONICAL = new Map<string, string>();

Object.entries(CANONICAL_SKILL_GROUPS).forEach(([canonicalKey, variants]) => {
  variants.forEach((variant) => {
    VARIANT_TO_CANONICAL.set(normalizeSkillString(variant), canonicalKey);
  });
});

/**
 * Normalizes a skill string for lookup (lowercased, trimmed, symbols standardized).
 */
export function normalizeSkillString(skill: string): string {
  if (!skill || typeof skill !== 'string') return '';
  return skill
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Resolves a skill name to its canonical identifier if recognized, or returns the normalized string.
 */
export function getCanonicalSkillId(skill: string): string {
  const norm = normalizeSkillString(skill);
  return VARIANT_TO_CANONICAL.get(norm) || norm;
}

/**
 * Checks if two skill names are equivalent (same canonical group or identical normalized text).
 */
export function areSkillsEquivalent(skillA: string, skillB: string): boolean {
  if (!skillA || !skillB) return false;
  const normA = normalizeSkillString(skillA);
  const normB = normalizeSkillString(skillB);
  if (normA === normB) return true;

  const canonicalA = VARIANT_TO_CANONICAL.get(normA);
  const canonicalB = VARIANT_TO_CANONICAL.get(normB);

  return Boolean(canonicalA && canonicalB && canonicalA === canonicalB);
}

/**
 * Determines whether a given job description skill is covered by any of the candidate's skills.
 * Returns true if exact match, synonym match, or substring match of an alias.
 */
export function isSkillCoveredByCandidate(
  targetSkill: string,
  candidateSkills: string[],
): boolean {
  if (!targetSkill || !Array.isArray(candidateSkills) || candidateSkills.length === 0) {
    return false;
  }

  const targetNorm = normalizeSkillString(targetSkill);
  const targetCanonical = getCanonicalSkillId(targetSkill);

  return candidateSkills.some((candidateSkill) => {
    const candidateNorm = normalizeSkillString(candidateSkill);
    if (candidateNorm === targetNorm) return true;

    const candidateCanonical = getCanonicalSkillId(candidateSkill);
    if (targetCanonical && candidateCanonical && targetCanonical === candidateCanonical) {
      return true;
    }

    return false;
  });
}

/**
 * Finds the matching original skill from a candidate list for a target JD skill if equivalent.
 */
export function findMatchingAliasInCandidateSkills(
  targetSkill: string,
  candidateSkills: string[],
): string | null {
  if (!targetSkill || !Array.isArray(candidateSkills)) return null;

  const targetNorm = normalizeSkillString(targetSkill);
  const targetCanonical = getCanonicalSkillId(targetSkill);

  for (const candidateSkill of candidateSkills) {
    const candidateNorm = normalizeSkillString(candidateSkill);
    if (candidateNorm === targetNorm) return candidateSkill;

    const candidateCanonical = getCanonicalSkillId(candidateSkill);
    if (targetCanonical && candidateCanonical && targetCanonical === candidateCanonical) {
      return candidateSkill;
    }
  }

  return null;
}
