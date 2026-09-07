import { Test, TestingModule } from '@nestjs/testing';
import { ResumeTailorAgent } from './resume-tailor.agent';
import { ResumeTailorTool } from './tools/resume-tailor.tool';
import { AtsAnalyzerTool } from './tools/ats-analyzer.tool';

describe('ResumeTailorAgent', () => {
  let agent: ResumeTailorAgent;
  let tailorTool: ResumeTailorTool;
  let analyzerTool: AtsAnalyzerTool;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResumeTailorAgent, ResumeTailorTool, AtsAnalyzerTool],
    }).compile();

    agent = module.get<ResumeTailorAgent>(ResumeTailorAgent);
    tailorTool = module.get<ResumeTailorTool>(ResumeTailorTool);
    analyzerTool = module.get<AtsAnalyzerTool>(AtsAnalyzerTool);
  });

  it('should be defined', () => {
    expect(agent).toBeDefined();
    expect(tailorTool).toBeDefined();
    expect(analyzerTool).toBeDefined();
  });

  it('should tailor resume deterministically when OPENAI_API_KEY is not set', async () => {
    const originalKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    const mockResumeState = {
      sectionOrder: ['basic-1', 'summary-1', 'skills-1', 'exp-1'],
      sections: {
        'basic-1': {
          id: 'basic-1',
          type: 'basic',
          title: 'Personal Info',
          visible: true,
          data: {
            name: 'Alex Johnson',
            jobTitle: 'Full Stack Developer',
            email: 'alex@example.com',
            location: 'San Francisco, CA',
          },
        },
        'summary-1': {
          id: 'summary-1',
          type: 'summary',
          title: 'Summary',
          visible: true,
          data: {
            text: 'Passionate developer building web apps with modern technologies.',
          },
        },
        'skills-1': {
          id: 'skills-1',
          type: 'skills',
          title: 'Skills',
          visible: true,
          data: {
            categoryLabel: 'Technical Skills',
            items: ['JavaScript', 'HTML5', 'CSS3', 'React'],
          },
        },
        'exp-1': {
          id: 'exp-1',
          type: 'experience',
          title: 'Work Experience',
          visible: true,
          data: {
            entries: [
              {
                id: 'exp-entry-1',
                company: 'Acme Corp',
                role: 'Frontend Developer',
                start: '2021',
                end: '2023',
                current: false,
                bullets: [
                  'Worked on dashboard UI components in React.',
                  'Collaborated with designers to deliver responsive designs.',
                ],
              },
            ],
          },
        },
      },
    };

    const jobDescription = `
      We are hiring a Senior React and TypeScript Engineer.
      Requirements:
      - Deep expertise in React and TypeScript.
      - Experience with Docker, Kubernetes, and AWS is preferred.
      - Strong REST API design experience.
    `;

    // 1. Initial tailoring without confirmed skills
    const result = await agent.tailorResume(
      mockResumeState,
      jobDescription,
      {
        matchedKeywords: ['React'],
        missingKeywords: ['TypeScript', 'Docker', 'Kubernetes', 'AWS'],
      },
      [], // no confirmed skills yet
    );

    expect(result).toBeDefined();
    expect(result.tailoredResumeData).toBeDefined();
    // Verify original resume is not mutated
    expect(mockResumeState.sections['skills-1'].data.items).not.toContain('Docker');

    // Verify suggested skills are identified and marked pending
    expect(result.suggestedSkills.length).toBeGreaterThan(0);
    const suggestedNames = result.suggestedSkills.map((s) => s.name);
    expect(suggestedNames).toContain('Docker');
    expect(suggestedNames).toContain('AWS');

    // Verify unconfirmed skills are NOT added to tailored resume
    const tailoredSkills =
      result.tailoredResumeData.sections['skills-1'].data.items;
    expect(tailoredSkills).not.toContain('Docker');
    expect(tailoredSkills).not.toContain('Kubernetes');

    // Verify changes are logged
    expect(result.changes).toBeDefined();
    expect(Array.isArray(result.changes.skills)).toBe(true);
    expect(Array.isArray(result.changes.experience)).toBe(true);

    // 2. Tailoring with user-confirmed skill "Docker"
    const resultWithConfirmed = await agent.tailorResume(
      mockResumeState,
      jobDescription,
      {
        matchedKeywords: ['React'],
        missingKeywords: ['TypeScript', 'Docker', 'Kubernetes', 'AWS'],
      },
      ['Docker'], // user confirmed Docker
    );

    const skillsWithConfirmed =
      resultWithConfirmed.tailoredResumeData.sections['skills-1'].data.items;
    expect(skillsWithConfirmed).toContain('Docker');
    // Unconfirmed skill Kubernetes still shouldn't be added
    expect(skillsWithConfirmed).not.toContain('Kubernetes');

    process.env.OPENAI_API_KEY = originalKey;
  });
});
