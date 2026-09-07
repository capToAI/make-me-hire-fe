import { Injectable } from '@nestjs/common';

import { AtsMatchRank } from '../../models/ats-score-response.dto';

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
 * Standard industry skill and technology dictionary for ATS taxonomy matching.
 */
const COMMON_TECH_SKILLS = [
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
  'React',
  'Next.js',
  'Angular',
  'Vue.js',
  'Svelte',
  'Node.js',
  'NestJS',
  'Express',
  'Django',
  'Flask',
  'FastAPI',
  'Spring Boot',
  '.NET',
  'ASP.NET',
  'HTML5',
  'CSS3',
  'Tailwind CSS',
  'Bootstrap',
  'Sass',
  'Redux',
  'Zustand',
  'GraphQL',
  'REST API',
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'Redis',
  'SQLite',
  'Oracle',
  'SQL Server',
  'Elasticsearch',
  'Docker',
  'Kubernetes',
  'AWS',
  'Amazon Web Services',
  'Azure',
  'GCP',
  'Google Cloud',
  'CI/CD',
  'Git',
  'GitHub',
  'GitLab',
  'Jenkins',
  'Terraform',
  'Linux',
  'Microservices',
  'Serverless',
  'Kafka',
  'RabbitMQ',
  'Jest',
  'Mocha',
  'Cypress',
  'Playwright',
  'Selenium',
  'Agile',
  'Scrum',
  'DevOps',
  'System Design',
  'Architecture',
  'Unit Testing',
  'Integration Testing',
  'Cloud Computing',
];

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
   * Identifies technological and professional skills mentioned in the given text.
   */
  findSkills(text: string): string[] {
    const lower = ` ${text.toLowerCase()} `;
    const found: string[] = [];

    for (const skill of COMMON_TECH_SKILLS) {
      const hasSpecial = /[+#.]/.test(skill);
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = hasSpecial
        ? new RegExp(`(?:^|[^a-zA-Z0-9])${escaped}(?:$|[^a-zA-Z0-9])`, 'i')
        : new RegExp(`\\b${escaped}\\b`, 'i');

      if (pattern.test(lower)) {
        found.push(skill);
      }
    }

    return Array.from(new Set(found));
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
   */
  analyzeDeterministically(
    resumeText: string,
    jobDescription: string,
    metadata?: { name?: string; position?: string },
  ): DeterministicAtsResult {
    const resumeSkills = this.findSkills(resumeText);
    const jobSkills = this.findSkills(jobDescription);

    const resumeTokens = this.extractTokens(resumeText);
    const jobTokens = this.extractTokens(jobDescription);

    // Skill comparison
    const resumeSkillsLower = new Set(resumeSkills.map((s) => s.toLowerCase()));
    const matchedSkills = jobSkills.filter((s) => resumeSkillsLower.has(s.toLowerCase()));
    const missingSkills = jobSkills.filter((s) => !resumeSkillsLower.has(s.toLowerCase()));

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
    if (jobTokens.size > 0) {
      keywordWeight = (matchedTokens.length / jobTokens.size) * 30;
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

    // Format top matched and missing keywords (capitalized nicely)
    const matchedKeywords = Array.from(
      new Set([
        ...matchedSkills,
        ...matchedTokens
          .slice(0, 15)
          .map((t) => t.charAt(0).toUpperCase() + t.slice(1)),
      ]),
    ).slice(0, 20);

    const missingKeywords = Array.from(
      new Set([
        ...missingSkills,
        ...missingTokens
          .slice(0, 15)
          .map((t) => t.charAt(0).toUpperCase() + t.slice(1)),
      ]),
    ).slice(0, 15);

    // Dynamic strengths
    const strengths: string[] = [];
    if (matchedSkills.length > 0) {
      strengths.push(
        `Verified core competencies present in resume: ${matchedSkills.slice(0, 5).join(', ')}.`,
      );
    }
    if (matchedTokens.length > 10) {
      strengths.push(
        'High semantic density across domain terminology and technical responsibilities.',
      );
    }
    if (roleBonus >= 5) {
      strengths.push(
        `Target job title (${metadata?.position || 'role'}) aligns directly with the job description.`,
      );
    }
    if (strengths.length === 0) {
      strengths.push('Foundational professional background and relevant work experience present.');
    }

    // Dynamic improvements
    const improvements: string[] = [];
    if (missingSkills.length > 0) {
      improvements.push(
        `Incorporate missing high-priority skills if qualified: ${missingSkills.slice(0, 5).join(', ')}.`,
      );
    }
    if (missingTokens.length > 5) {
      improvements.push(
        'Increase contextual keywords from the job description in your summary and experience bullet points.',
      );
    }
    improvements.push(
      'Ensure work experience descriptions highlight measurable outcomes and metrics.',
    );

    // Dynamic recommendations
    const recommendations: string[] = [];
    if (missingSkills.length > 0) {
      recommendations.push(
        `Explicitly list ${missingSkills.slice(0, 3).join(', ')} in the Skills section if you have working knowledge.`,
      );
    }
    recommendations.push(
      'Tailor the professional summary to mirror the primary objectives stated in the job description.',
    );
    recommendations.push(
      'Align project technology stacks with the required tools specified by the employer.',
    );

    const summary =
      `Based on automated ATS parsing, the resume achieves a ${score}/100 (${rank}). ` +
      (matchedSkills.length > 0
        ? `It strongly matches ${matchedSkills.length} requested key skill(s). `
        : '') +
      (missingSkills.length > 0
        ? `Addressing ${missingSkills.length} missing skill requirement(s) could significantly boost your ranking.`
        : 'Resume demonstrates solid coverage for this target position.');

    return {
      score,
      rank,
      summary,
      matchedKeywords,
      missingKeywords,
      matchedSkills,
      missingSkills,
      strengths,
      improvements,
      recommendations,
    };
  }
}
