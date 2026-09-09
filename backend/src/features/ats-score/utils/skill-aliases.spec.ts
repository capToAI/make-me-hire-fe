import {
  areSkillsEquivalent,
  isSkillCoveredByCandidate,
  findMatchingAliasInCandidateSkills,
  getCanonicalSkillId,
} from './skill-aliases';

describe('Skill Aliases Utility', () => {
  describe('areSkillsEquivalent', () => {
    it('recognizes React and React.js as equivalent', () => {
      expect(areSkillsEquivalent('React', 'React.js')).toBe(true);
      expect(areSkillsEquivalent('reactjs', 'React')).toBe(true);
      expect(areSkillsEquivalent('React JS', 'react.js')).toBe(true);
    });

    it('recognizes Node, Node.js and NodeJS as equivalent', () => {
      expect(areSkillsEquivalent('Node', 'Node.js')).toBe(true);
      expect(areSkillsEquivalent('nodejs', 'node')).toBe(true);
    });

    it('recognizes TypeScript and TS as equivalent', () => {
      expect(areSkillsEquivalent('TypeScript', 'TS')).toBe(true);
    });

    it('recognizes Postgres and PostgreSQL as equivalent', () => {
      expect(areSkillsEquivalent('Postgres', 'PostgreSQL')).toBe(true);
    });

    it('recognizes AWS and Amazon Web Services as equivalent', () => {
      expect(areSkillsEquivalent('AWS', 'Amazon Web Services')).toBe(true);
    });

    it('does not equate genuinely different skills', () => {
      expect(areSkillsEquivalent('React', 'Angular')).toBe(false);
      expect(areSkillsEquivalent('Docker', 'Kubernetes')).toBe(false);
      expect(areSkillsEquivalent('Java', 'JavaScript')).toBe(false);
    });
  });

  describe('isSkillCoveredByCandidate', () => {
    const candidateSkills = ['React', 'TypeScript', 'Tailwind CSS', 'PostgreSQL'];

    it('returns true when candidate has alias of target skill', () => {
      expect(isSkillCoveredByCandidate('React.js', candidateSkills)).toBe(true);
      expect(isSkillCoveredByCandidate('TS', candidateSkills)).toBe(true);
      expect(isSkillCoveredByCandidate('Postgres', candidateSkills)).toBe(true);
      expect(isSkillCoveredByCandidate('Tailwind', candidateSkills)).toBe(true);
    });

    it('returns false when candidate does not have skill or alias', () => {
      expect(isSkillCoveredByCandidate('Docker', candidateSkills)).toBe(false);
      expect(isSkillCoveredByCandidate('AWS', candidateSkills)).toBe(false);
      expect(isSkillCoveredByCandidate('GraphQL', candidateSkills)).toBe(false);
    });
  });

  describe('findMatchingAliasInCandidateSkills', () => {
    const candidateSkills = ['React', 'TypeScript', 'PostgreSQL'];

    it('finds original skill for an alias', () => {
      expect(findMatchingAliasInCandidateSkills('React.js', candidateSkills)).toBe('React');
      expect(findMatchingAliasInCandidateSkills('Postgres', candidateSkills)).toBe('PostgreSQL');
      expect(findMatchingAliasInCandidateSkills('Docker', candidateSkills)).toBeNull();
    });
  });
});
