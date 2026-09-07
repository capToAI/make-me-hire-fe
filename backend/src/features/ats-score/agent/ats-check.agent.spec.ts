import { Test, TestingModule } from '@nestjs/testing';

import { AtsCheckAgent } from './ats-check.agent';
import { AtsAnalyzerTool } from './tools/ats-analyzer.tool';

describe('AtsCheckAgent', () => {
  let agent: AtsCheckAgent;
  let tool: AtsAnalyzerTool;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AtsCheckAgent, AtsAnalyzerTool],
    }).compile();

    agent = module.get<AtsCheckAgent>(AtsCheckAgent);
    tool = module.get<AtsAnalyzerTool>(AtsAnalyzerTool);
  });

  it('should be defined', () => {
    expect(agent).toBeDefined();
    expect(tool).toBeDefined();
  });

  it('should use deterministic fallback and return structured ATS metrics when no API key is set', async () => {
    const originalKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    const resumeText = `
      Name: Jane Doe
      Title: Senior Full Stack Engineer
      Skills: TypeScript, React, Node.js, NestJS, PostgreSQL
      Experience: Built scalable microservices using TypeScript and NestJS.
    `;

    const jobDescription = `
      We are seeking a Senior Full Stack Engineer proficient in TypeScript, React, NestJS, and Docker.
      Must have experience designing relational databases with PostgreSQL and deploying containerized apps with Kubernetes.
    `;

    const result = await agent.analyzeResume(resumeText, jobDescription, {
      name: 'Jane Resume',
      position: 'Senior Full Stack Engineer',
    });

    expect(result).toBeDefined();
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(['Excellent Match', 'Strong Match', 'Good Match', 'Moderate Match', 'Low Match']).toContain(
      result.rank,
    );
    expect(result.summary).toBeTruthy();
    expect(Array.isArray(result.matchedKeywords)).toBe(true);
    expect(Array.isArray(result.missingKeywords)).toBe(true);
    expect(Array.isArray(result.matchedSkills)).toBe(true);
    expect(Array.isArray(result.missingSkills)).toBe(true);
    expect(result.matchedSkills).toContain('TypeScript');
    expect(result.matchedSkills).toContain('NestJS');
    expect(result.missingSkills).toContain('Docker');

    process.env.OPENAI_API_KEY = originalKey;
  });
});
