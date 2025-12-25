export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { productIdea, detailLevel, language } = await request.json();

    if (!productIdea || productIdea.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Product idea is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const detailInstructions = {
      brief: 'Create a concise specification with main sections only (2-3 pages worth of content)',
      standard: 'Create a standard specification with all essential sections and reasonable detail (4-6 pages worth of content)',
      detailed: 'Create a comprehensive, detailed specification covering all aspects thoroughly (8-10 pages worth of content)'
    };

    const langInstructions = {
      ru: 'Write the entire specification in Russian language.',
      en: 'Write the entire specification in English language.'
    };

    const systemPrompt = `You are an expert technical writer and product manager. Your task is to generate professional technical specifications (Ð¢Ð) for software products.

${langInstructions[language] || langInstructions.ru}
${detailInstructions[detailLevel] || detailInstructions.standard}

Generate a well-structured technical specification with the following sections:

1. **Project Overview** - Brief description, goals, target audience
2. **Functional Requirements** - Core features and functionality
3. **Non-Functional Requirements** - Performance, security, scalability
4. **User Roles & Permissions** - Different user types and their access levels
5. **Technical Stack Recommendations** - Suggested technologies
6. **API Specifications** - Key endpoints and data structures (if applicable)
7. **Database Schema Overview** - Main entities and relationships
8. **UI/UX Guidelines** - Design principles and key screens
9. **Integration Requirements** - Third-party services and APIs
10. **Testing Requirements** - Test coverage and strategies
11. **Deployment & Infrastructure** - Hosting and deployment considerations
12. **Timeline & Milestones** - Suggested project phases
13. **Risks & Mitigations** - Potential challenges and solutions

Use clear formatting with headers, bullet points, and organized sections. Be specific and actionable.`;

    const userPrompt = `Generate a technical specification for the following product idea:

${productIdea}

Provide a professional, comprehensive technical specification document.`;

    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
    
    if (!ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8192,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ],
        system: systemPrompt
      }),
    });

    if (!anthropicResponse.ok) {
      const error = await anthropicResponse.text();
      console.error('Anthropic API error:', error);
      return new Response(JSON.stringify({ error: 'AI generation failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await anthropicResponse.json();
    const specification = result.content[0].text;

    return new Response(JSON.stringify({ specification }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}