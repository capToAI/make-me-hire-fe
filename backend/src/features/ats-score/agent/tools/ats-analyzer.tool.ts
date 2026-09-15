import { Injectable } from '@nestjs/common';

import { AtsMatchRank } from '../../models/ats-score-response.dto';
import { isSkillCoveredByCandidate } from '../../utils/skill-aliases';

export interface DeterministicAtsResult {
  score: number;
  rank: AtsMatchRank;
  summary: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  improvements: string[];
  recommendations: string[];
}

/**
 * Cross-industry standard skill and technology dictionary for baseline ATS taxonomy matching
 * across tech, finance, healthcare, legal, marketing, sales, and operations.
 */
const COMMON_CROSS_INDUSTRY_SKILLS = [
  // Tech & Software Development
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C#',
  'C++',
  'Go',
  'Golang',
  'Rust',
  'PHP',
  'Ruby',
  'Swift',
  'Kotlin',
  'SQL',
  'HTML5',
  'CSS3',
  'React',
  'Next.js',
  'Angular',
  'Vue.js',
  'Tailwind CSS',
  'Redux',
  'Node.js',
  'NestJS',
  'Express',
  'Django',
  'Spring Boot',
  'GraphQL',
  'REST API',
  'Microservices',
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'Redis',
  'Docker',
  'Kubernetes',
  'AWS',
  'Azure',
  'GCP',
  'CI/CD',
  'Git',
  'GitHub',
  'Linux',

  // Accounting, Finance & Banking
  'QuickBooks',
  'Tally',
  'GAAP',
  'IFRS',
  'Financial Modeling',
  'Accounts Payable',
  'Accounts Receivable',
  'Financial Reporting',
  'General Ledger',
  'Tax Preparation',
  'Auditing',
  'Internal Audit',
  'Balance Sheet',
  'P&L Management',
  'Bank Reconciliation',
  'Excel',
  'Advanced Excel',
  'SAP',
  'Oracle Financials',
  'Budgeting',
  'Forecasting',
  'Cost Accounting',
  'Payroll Management',

  // Healthcare, Nursing & Clinical
  'Patient Care',
  'Triage',
  'HIPAA Compliance',
  'Electronic Health Records',
  'EHR',
  'EMR',
  'Epic',
  'Cerner',
  'BLS',
  'Basic Life Support',
  'CPR',
  'ACLS',
  'Clinical Documentation',
  'Phlebotomy',
  'Patient Assessment',
  'Vital Signs',
  'Medication Administration',
  'Infection Control',
  'Patient Advocacy',

  // Sales, Digital Marketing & Advertising
  'Meta Ads',
  'Facebook Ads',
  'Google Ads',
  'Google Analytics',
  'Google Tag Manager',
  'SEO',
  'Search Engine Optimization',
  'SEM',
  'PPC',
  'Performance Marketing',
  'Social Media Marketing',
  'Content Strategy',
  'Email Marketing',
  'Lead Generation',
  'Copywriting',
  'HubSpot',
  'Salesforce',
  'CRM',
  'B2B Sales',
  'Cold Calling',
  'Sales Pipeline',
  'Canva',
  'Figma',
  'WordPress',
  'Shopify',

  // Legal, Governance & Compliance
  'Contract Negotiation',
  'Contract Drafting',
  'Litigation',
  'Legal Research',
  'Due Diligence',
  'Corporate Governance',
  'Intellectual Property',
  'Regulatory Compliance',
  'Risk Assessment',

  // Operations, Logistics & Management
  'Project Management',
  'Agile',
  'Scrum',
  'PMP',
  'Supply Chain Management',
  'Logistics',
  'Operations Management',
  'Vendor Management',
  'Stakeholder Management',
  'Six Sigma',
  'Lean Management',
  'Quality Assurance',
  'Process Improvement',
  'Team Leadership',
  'Customer Service',
];

const COMMON_TECH_SKILLS = COMMON_CROSS_INDUSTRY_SKILLS;

const STOP_WORDS = new Set([
  'about',
  'above',
  'after',
  'again',
  'against',
  'also',
  'among',
  'and',
  'apply',
  'are',
  'been',
  'before',
  'being',
  'below',
  'between',
  'both',
  'candidate',
  'could',
  'description',
  'each',
  'from',
  'have',
  'having',
  'into',
  'more',
  'most',
  'must',
  'need',
  'other',
  'our',
  'over',
  'please',
  'qualifications',
  'requirements',
  'responsibilities',
  'role',
  'should',
  'some',
  'such',
  'team',
  'than',
  'that',
  'the',
  'their',
  'them',
  'then',
  'there',
  'these',
  'they',
  'this',
  'those',
  'through',
  'under',
  'using',
  'very',
  'what',
  'when',
  'where',
  'which',
  'while',
  'will',
  'with',
  'work',
  'working',
  'would',
  'years',
]);

/**
 * Dedicated ATS tool for extracting keywords, computing skill coverage,
 * and performing deterministic heuristic matching when LLM analysis is unavailable.
 * Completely domain-agnostic for any industry.
 */
@Injectable()
export class AtsAnalyzerTool {
  /**
   * Normalizes text by removing non-alphanumeric characters (except dashes and dots)
   * and converting to lower-case.
   */
  normalizeText(text: string): string {
    return (text || '')
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Extracts distinct single-word and two-word keyword tokens from text.
   */
  extractTokens(text: string): Set<string> {
    const tokens = new Set<string>();
    const cleaned = this.normalizeText(text).toLowerCase();
    const words = cleaned
      .replace(/[^a-z0-9+#.-]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 1 && !STOP_WORDS.has(w));

    words.forEach((w) => tokens.add(w));
    return tokens;
  }

  /**
   * Formats skill titles consistently (preserving uppercase acronyms).
   */
  formatSkillTitle(term: string): string {
    const trimmed = term.trim();
    if (/^[A-Z0-9+#.-]+$/.test(trimmed)) return trimmed;
    return trimmed
      .split(/\s+/)
      .map((w) => (w.length <= 2 && !/[a-z]/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
      .join(' ');
  }

  /**
   * Evaluates whether an extracted string is a valid skill candidate.
   */
  isValidSkillCandidate(term: string): boolean {
    if (!term || typeof term !== 'string') return false;
    const clean = term.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '').trim();
    if (clean.length < 2 || clean.length > 50) return false;
    if (/^\d+$/.test(clean)) return false;

    const lower = clean.toLowerCase();
    if (STOP_WORDS.has(lower)) return false;

    const genericPhrases = [
      'experience with',
      'knowledge of',
      'proficiency in',
      'ability to',
      'responsible for',
      'understanding of',
      'working knowledge of',
      'proven track record',
      'years of experience',
      'bachelor',
      'master',
      'degree in',
      'high school',
      'strong communication',
      'problem solving',
      'team player',
      'fast paced',
      'self motivated',
      'interpersonal skills',
      'attention to detail',
      'work independently',
    ];

    if (genericPhrases.some((gp) => lower.startsWith(gp) || lower === gp)) {
      return false;
    }

    return true;
  }

  /**
   * Dynamically extracts required skills and qualifications from any job description.
   * Works across tech, healthcare, accounting, legal, sales, engineering, etc.
   */
  extractSkillsFromJobDescription(jobDescription: string): string[] {
    if (!jobDescription || !jobDescription.trim()) return [];

    const extracted = new Set<string>();
    const lines = jobDescription.split(/\r?\n/);

    const sectionHeaderRegex = /^(?:#+\s*)?(?:requirements|qualifications|required skills|skills|key competencies|what you(?:'ll)? need|what we(?:'re)? looking for|responsibilities|must have|profile|core competencies)[:\s]*$/i;
    const bulletRegex = /^[\s*•\-–—►*+]+(?:\d+[\.)]\s*)?(.*)$/;

    let inTargetSection = false;
    const targetSectionLines: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (sectionHeaderRegex.test(trimmed)) {
        inTargetSection = true;
        continue;
      } else if (inTargetSection && /^(?:#+\s*)?(?:about us|company|benefits|perks|compensation|how to apply|equal opportunity|salary)[:\s]*$/i.test(trimmed)) {
        inTargetSection = false;
      }

      if (inTargetSection) {
        targetSectionLines.push(trimmed);
      }
    }

    const candidateLines = targetSectionLines.length > 0 ? targetSectionLines : lines;

    for (const line of candidateLines) {
      const bulletMatch = line.match(bulletRegex);
      const textToScan = bulletMatch ? bulletMatch[1].trim() : line.trim();

      if (textToScan.length < 2 || textToScan.length > 120) continue;

      const parts = textToScan.split(/[,;/|]+/).map((p) => p.trim());
      for (const part of parts) {
        let cleaned = part
          .replace(/^[\s•\-–—*+]+/, '')
          .replace(/^(?:and|or|&)\s+/i, '')
          .replace(/^(?:strong\s+)?(?:working\s+)?(?:knowledge|expertise|experience|skills?)\s+(?:of|in|with)\s+/i, '')
          .replace(/^(?:proficient|proficiency)\s+(?:in|with)\s+/i, '')
          .replace(/^(?:ability|demonstrated\s+ability)\s+to\s+/i, '')
          .replace(/^(?:ensure\s+strict\s+compliance\s+with|compliance\s+with)\s+/i, '')
          .replace(/^(?:utilize|manage|prepare|lead|handle|maintain)\s+(?:full[- ]cycle\s+)?/i, '')
          .replace(/[.:]$/, '')
          .trim();
        if (this.isValidSkillCandidate(cleaned)) {
          extracted.add(this.formatSkillTitle(cleaned));
        }
      }
    }

    // Include cross-industry baseline dictionary matches
    const jdLower = ` ${jobDescription.toLowerCase()} `;
    for (const skill of COMMON_CROSS_INDUSTRY_SKILLS) {
      const hasSpecial = /[+#.]/.test(skill);
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = hasSpecial
        ? new RegExp(`(?:^|[^a-zA-Z0-9])${escaped}(?:$|[^a-zA-Z0-9])`, 'i')
        : new RegExp(`\\b${escaped}\\b`, 'i');

      if (pattern.test(jdLower)) {
        extracted.add(skill);
      }
    }

    // Normalize and deduplicate overlapping phrases (e.g. keep "QuickBooks" if both exist)
    const rawList = Array.from(extracted);
    const sortedByLength = [...rawList].sort((a, b) => a.length - b.length);
    const uniqueSkills: string[] = [];

    for (const skill of sortedByLength) {
      const lower = skill.toLowerCase();
      const redundant = uniqueSkills.some((existing) => {
        const exLower = existing.toLowerCase();
        return exLower === lower || (lower.includes(exLower) && exLower.length >= 4);
      });
      if (!redundant) {
        uniqueSkills.push(skill);
      }
    }

    return uniqueSkills.slice(0, 40);
  }

  /**
   * Extracts candidate skills dynamically from explicit list and resume text sections.
   */
  extractSkillsFromResume(resumeText: string, explicitSkills: string[] = []): string[] {
    const extracted = new Set<string>(
      (explicitSkills || []).map((s) => this.formatSkillTitle(s)).filter(Boolean),
    );

    const lines = (resumeText || '').split(/\r?\n/);
    let inSkillsSection = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (/^###\s*(?:skills|technical skills|core competencies|competencies|tools|technologies|certifications)/i.test(trimmed)) {
        inSkillsSection = true;
        continue;
      } else if (/^###\s*/.test(trimmed) && inSkillsSection) {
        inSkillsSection = false;
      }

      if (inSkillsSection && trimmed) {
        const parts = trimmed.split(/[,;|•\-–—]+/).map((p) => p.trim());
        for (const part of parts) {
          const cleaned = part
            .replace(/^[\s•\-–—*+]+/, '')
            .replace(/^(?:and|or|&)\s+/i, '')
            .replace(/[.:]$/, '')
            .trim();
          if (this.isValidSkillCandidate(cleaned)) {
            extracted.add(this.formatSkillTitle(cleaned));
          }
        }
      }
    }

    // Include cross-industry baseline matches in resume
    const resLower = ` ${(resumeText || '').toLowerCase()} `;
    for (const skill of COMMON_CROSS_INDUSTRY_SKILLS) {
      const hasSpecial = /[+#.]/.test(skill);
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = hasSpecial
        ? new RegExp(`(?:^|[^a-zA-Z0-9])${escaped}(?:$|[^a-zA-Z0-9])`, 'i')
        : new RegExp(`\\b${escaped}\\b`, 'i');

      if (pattern.test(resLower)) {
        extracted.add(skill);
      }
    }

    return Array.from(extracted);
  }

  /**
   * Backward-compatible skill extractor that operates dynamically on any text.
   */
  findSkills(text: string): string[] {
    return this.extractSkillsFromJobDescription(text);
  }

  /**
   * Determines the qualitative ATS match rank from a numeric score (0 to 100).
   */
  getRankFromScore(score: number): AtsMatchRank {
    if (score >= 85) return 'Excellent Match';
    if (score >= 70) return 'Strong Match';
    if (score >= 55) return 'Good Match';
    if (score >= 40) return 'Moderate Match';
    return 'Low Match';
  }

  /**
   * Performs deterministic ATS resume-to-job analysis without external network or LLM dependencies.
   * Completely domain-agnostic for any industry or profession.
   */
  analyzeDeterministically(
    resumeText: string,
    jobDescription: string,
    metadata?: { name?: string; position?: string },
    candidateExplicitSkills: string[] = [],
  ): DeterministicAtsResult {
    const resumeSkills = this.extractSkillsFromResume(resumeText, candidateExplicitSkills);
    const jobSkills = this.extractSkillsFromJobDescription(jobDescription);

    const resumeTokens = this.extractTokens(resumeText);
    const jobTokens = this.extractTokens(jobDescription);

    // Skill comparison with alias/synonym normalization
    const matchedSkills = jobSkills.filter((js) =>
      isSkillCoveredByCandidate(js, resumeSkills),
    );
    const missingSkills = jobSkills.filter(
      (js) => !isSkillCoveredByCandidate(js, resumeSkills),
    );

    // Keyword comparison
    const matchedTokens: string[] = [];
    const missingTokens: string[] = [];

    jobTokens.forEach((token) => {
      if (resumeTokens.has(token)) {
        matchedTokens.push(token);
      } else if (token.length > 2) {
        missingTokens.push(token);
      }
    });

    // Score calculation
    let skillWeight = 0;
    if (jobSkills.length > 0) {
      skillWeight = (matchedSkills.length / jobSkills.length) * 60;
    } else {
      skillWeight = 40;
    }

    let keywordWeight = 0;
    const targetTokenThreshold = Math.min(25, Math.max(5, Math.round(jobTokens.size * 0.35)));
    if (targetTokenThreshold > 0) {
      const keywordRatio = Math.min(1.0, matchedTokens.length / targetTokenThreshold);
      keywordWeight = keywordRatio * 30;
    } else {
      keywordWeight = 20;
    }

    // Role / Position title bonus
    let roleBonus = 0;
    const position = metadata?.position?.toLowerCase() || '';
    if (position && jobDescription.toLowerCase().includes(position)) {
      roleBonus = 10;
    } else if (position) {
      const positionTokens = position.split(/\s+/).filter((t) => t.length > 2);
      const matchCount = positionTokens.filter((t) => jobDescription.toLowerCase().includes(t)).length;
      if (positionTokens.length > 0) {
        roleBonus = Math.round((matchCount / positionTokens.length) * 10);
      }
    }

    const rawScore = Math.round(skillWeight + keywordWeight + roleBonus);
    const score = Math.max(10, Math.min(98, rawScore));
    const rank = this.getRankFromScore(score);

    // Format matched keywords (capitalized nicely)
    const matchedKeywords = Array.from(
      new Set([
        ...matchedSkills,
        ...matchedTokens.map((t) => t.charAt(0).toUpperCase() + t.slice(1)),
      ]),
    ).slice(0, 50);

    const matchedTokensLower = new Set([
      ...matchedSkills.map((s) => s.toLowerCase().trim()),
      ...matchedKeywords.map((k) => k.toLowerCase().trim()),
    ]);

    // Strictly exclude any matched skill or candidate possessed skill from missing lists
    const sanitizedMissingSkills = missingSkills.filter(
      (s) => !matchedTokensLower.has(s.toLowerCase().trim()) && !isSkillCoveredByCandidate(s, resumeSkills),
    );

    const rawMissingKeywords = Array.from(
      new Set([
        ...sanitizedMissingSkills,
        ...missingTokens.map((t) => t.charAt(0).toUpperCase() + t.slice(1)),
      ]),
    );

    const missingKeywords = rawMissingKeywords
      .filter((k) => !matchedTokensLower.has(k.toLowerCase().trim()) && !isSkillCoveredByCandidate(k, resumeSkills))
      .slice(0, 50);

    // Dynamic strengths
    const strengths: string[] = [];
    if (matchedSkills.length > 0) {
      strengths.push(
        `Verified core competencies present in resume: ${matchedSkills.slice(0, 5).join(', ')}.`,
      );
    }
    if (matchedTokens.length > 10) {
      strengths.push(
        'Strong alignment across domain terminology and professional responsibilities.',
      );
    }
    if (roleBonus >= 5) {
      strengths.push(
        `Target professional headline (${metadata?.position || 'role'}) aligns directly with the job description.`,
      );
    }
    if (strengths.length === 0) {
      strengths.push('Foundational professional background and relevant work experience present.');
    }

    // Dynamic improvements
    const improvements: string[] = [];
    if (sanitizedMissingSkills.length > 0) {
      improvements.push(
        `Incorporate missing high-priority skills if qualified: ${sanitizedMissingSkills.slice(0, 5).join(', ')}.`,
      );
    }
    if (missingTokens.length > 5) {
      improvements.push(
        'Incorporate contextual keywords and industry terminology from the job description into your summary and experience bullet points.',
      );
    }
    improvements.push(
      'Ensure work experience descriptions highlight measurable outcomes, achievements, and impact.',
    );

    // Dynamic recommendations
    const recommendations: string[] = [];
    if (sanitizedMissingSkills.length > 0) {
      recommendations.push(
        `Explicitly list ${sanitizedMissingSkills.slice(0, 3).join(', ')} in the Skills section if you have working knowledge.`,
      );
    }
    recommendations.push(
      'Tailor the professional summary to mirror the primary objectives stated in the job description.',
    );
    recommendations.push(
      'Align project and role achievements with the required competencies and tools specified by the employer.',
    );

    const summary =
      `Based on automated ATS parsing, the resume achieves a ${score}/100 (${rank}). ` +
      (matchedSkills.length > 0
        ? `It strongly matches ${matchedSkills.length} requested key competency/competencies. `
        : '') +
      (sanitizedMissingSkills.length > 0
        ? `Addressing ${sanitizedMissingSkills.length} missing skill requirement(s) could significantly boost your ranking.`
        : 'Resume demonstrates solid coverage for this target position.');

    return {
      score,
      rank,
      summary,
      matchedKeywords,
      missingKeywords,
      matchedSkills,
      missingSkills: sanitizedMissingSkills,
      strengths,
      improvements,
      recommendations,
    };
  }

  /**
   * Computes the authentic marginal ATS score impact (points) for a specific skill
   * based on the ATS scoring pillar weights and the skill's prominence in the job description.
   *
   * @param {string} skill - Target skill name.
   * @param {number} totalJobSkillsCount - Total number of skills required by the job.
   * @param {string} jobDescription - Full job description text.
   * @returns {number} Integer point contribution of this skill (typically 1 to 6 points).
   */
  calculateSkillMarginalImpact(
    skill: string,
    totalJobSkillsCount: number,
    jobDescription: string,
  ): number {
    if (!skill || !skill.trim()) return 1;

    // Total points allocated to skills pillar is 50 points out of 100
    const totalSkillPillarWeight = 50;
    const effectiveSkillCount = Math.max(5, Math.min(25, totalJobSkillsCount || 10));
    const basePointPerSkill = totalSkillPillarWeight / effectiveSkillCount;

    const jdLower = (jobDescription || '').toLowerCase();
    const skillLower = skill.toLowerCase().trim();

    // Check importance weighting from JD structure
    let multiplier = 1.0;

    // Split JD into sections if identifiable
    const requiredMatch = jdLower.match(/(?:required skills|key responsibilities|requirements|must have)([\s\S]*?)(?:preferred skills|nice to have|qualification|$)/i);
    const preferredMatch = jdLower.match(/(?:preferred skills|nice to have|bonus|good to have)([\s\S]*?)(?:qualification|experience|$)/i);

    if (requiredMatch && requiredMatch[1].includes(skillLower)) {
      multiplier = 1.35; // Core mandatory skill
    } else if (preferredMatch && preferredMatch[1].includes(skillLower)) {
      multiplier = 0.75; // Secondary / preferred skill
    }

    // Prominence frequency bonus
    const escaped = skillLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const occurrences = (jdLower.match(new RegExp(`\\b${escaped}\\b`, 'gi')) || []).length;
    if (occurrences >= 3) {
      multiplier += 0.2;
    }

    const calculated = Math.round(basePointPerSkill * multiplier);
    return Math.max(1, Math.min(6, calculated));
  }
}

