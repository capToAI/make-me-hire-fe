import { Test, TestingModule } from '@nestjs/testing';

import { SummaryRefinerAgent } from './summary-refiner.agent';

describe('SummaryRefinerAgent', () => {
  let agent: SummaryRefinerAgent;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SummaryRefinerAgent],
    }).compile();

    agent = module.get<SummaryRefinerAgent>(SummaryRefinerAgent);
  });

  it('should be defined', () => {
    expect(agent).toBeDefined();
  });

  describe('fallbackRefine', () => {
    it('should clean extra whitespace and capitalize first letter', () => {
      const input = '   software developer with    5 years of experience   ';
      const output = agent.fallbackRefine(input);
      expect(output).toBe('Software developer with 5 years of experience.');
    });

    it('should maintain terminal punctuation if already present', () => {
      const input = 'Experienced React and TypeScript engineer!';
      const output = agent.fallbackRefine(input);
      expect(output).toBe('Experienced React and TypeScript engineer!');
    });

    it('should return empty string for empty input', () => {
      const output = agent.fallbackRefine('   ');
      expect(output).toBe('');
    });
  });

  describe('refineSummary', () => {
    it('should use fallbackRefine when OPENAI_API_KEY is not set', async () => {
      const originalKey = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;

      const raw = 'marketing specialist with 3 years leading campaigns';
      const result = await agent.refineSummary(raw);

      expect(result).toBe('Marketing specialist with 3 years leading campaigns.');

      if (originalKey) {
        process.env.OPENAI_API_KEY = originalKey;
      }
    });
  });
});
