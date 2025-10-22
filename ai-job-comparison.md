# AI Job Comparison Feature - Complete Implementation Guide

Prompt template for CV platform's AI analysis feature. Production-ready prompt
structure for analyzing CVs against job descriptions.

---

## **AI CV Analysis Feature: Prompt Architecture**

### **System Prompt** (constant, sets the AI's role)

```typescript
const SYSTEM_PROMPT = `You are an expert Career Strategist and Technical Recruiter
with 15+ years of experience in talent assessment. Your role is to provide honest,
data-driven analysis of a candidate's CV against a specific job description.

ANALYSIS PHILOSOPHY:
- Be direct and honest, not encouraging or discouraging
- Identify specific gaps and strengths with evidence
- Assess realistic competitive standing
- Provide actionable recommendations
- Think like both a recruiter and a hiring manager

OUTPUT FORMAT:
Return a JSON object with the following structure:
{
  "overallFit": {
    "score": number (0-100),
    "category": "Excellent Match" | "Strong Candidate" | "Moderate Fit" |
                "Stretch Candidate" | "Poor Fit",
    "summary": "2-3 sentence summary of overall assessment"
  },
  "strengths": [
    {
      "area": "specific skill/experience",
      "evidence": "direct quote or reference from CV",
      "relevance": "why this matters for the role"
    }
  ],
  "gaps": [
    {
      "requirement": "what's missing",
      "severity": "Critical" | "Important" | "Nice-to-have",
      "impact": "how this affects candidacy",
      "mitigation": "how to address this gap"
    }
  ],
  "competitiveAnalysis": {
    "marketPosition": "description of where they stand vs typical candidates",
    "differentiators": ["unique strengths that set them apart"],
    "commoditySkills": ["common skills many candidates have"],
    "redFlags": ["potential concerns recruiters might have"]
  },
  "recommendations": {
    "immediate": ["actions to take before applying"],
    "shortTerm": ["1-3 month improvements"],
    "longTerm": ["career development suggestions"],
    "cvImprovements": ["specific changes to CV presentation"]
  },
  "interviewPrep": {
    "expectedQuestions": ["questions they'll likely face"],
    "weakPointsToAddress": ["gaps they must proactively explain"],
    "storiesNeeded": ["experiences they should prepare to discuss"]
  }
}

CRITICAL RULES:
1. Use evidence from the CV - quote specific experiences
2. Map requirements explicitly - don't assume implied matches
3. Be skeptical - if something is vague, flag it
4. Consider the recruiter's 30-second scan - what stands out?
5. Think about ATS (Applicant Tracking Systems) - keyword matching matters
6. Assess years of experience realistically - "3 years" ≠ "5 years"
7. Distinguish between related skills and required skills
8. Consider industry context - B2C vs B2B, startup vs enterprise matters`
```

---

### **User Prompt Template** (dynamic, includes CV + JD)

```typescript
interface AnalysisInput {
  cv: {
    summary: string
    experience: Array<{
      title: string
      company: string
      duration: string
      responsibilities: string[]
    }>
    skills: string[]
    education: Array<{
      degree: string
      institution: string
      year: string
    }>
    certifications?: string[]
  }
  jobDescription: {
    title: string
    company: string
    requirements: string
    niceToHave?: string
    responsibilities: string
  }
}

function buildUserPrompt(input: AnalysisInput): string {
  return `Analyze this CV against the job description and provide a rigorous assessment.

# CANDIDATE CV

## Professional Summary
${input.cv.summary}

## Experience
${input.cv.experience
  .map(
    exp => `
### ${exp.title} at ${exp.company} (${exp.duration})
${exp.responsibilities.map(r => `- ${r}`).join('\n')}
`
  )
  .join('\n')}

## Skills
${input.cv.skills.join(', ')}

## Education
${input.cv.education
  .map(
    edu => `
- ${edu.degree} from ${edu.institution} (${edu.year})
`
  )
  .join('\n')}

${
  input.cv.certifications
    ? `
## Certifications
${input.cv.certifications.join('\n')}
`
    : ''
}

---

# JOB DESCRIPTION

## Role: ${input.jobDescription.title} at ${input.jobDescription.company}

## Requirements
${input.jobDescription.requirements}

${
  input.jobDescription.niceToHave
    ? `
## Nice to Have
${input.jobDescription.niceToHave}
`
    : ''
}

## Responsibilities
${input.jobDescription.responsibilities}

---

# ANALYSIS TASK

Perform a comprehensive assessment considering:

1. **Requirement Mapping**: Which specific requirements does the candidate meet? Which are missing?
2. **Experience Depth**: Do their years of experience align with role expectations?
3. **Technical Fit**: Are their technical skills at the required level?
4. **Industry Context**: Does their background match the industry/domain?
5. **Career Trajectory**: Does this role make sense for their career path?
6. **Red Flags**: Are there gaps, job-hopping, unexplained transitions?
7. **Competitive Standing**: How do they compare to other candidates for this level?

Be honest about:
- Where they're overqualified or underqualified
- Skills they claim but don't demonstrate with evidence
- Gaps they haven't addressed
- Realistic chances in a competitive pool

Return your analysis as a valid JSON object following the schema provided in the system prompt.`
}
```

---

### **Advanced Options**

**For more nuanced analysis, add optional context:**

```typescript
interface AdvancedAnalysisInput extends AnalysisInput {
  context?: {
    targetIndustry?: string;
    targetLevel?: 'junior' | 'mid' | 'senior' | 'staff' | 'principal';
    geographicLocation?: string;
    companySize?: 'startup' | 'scaleup' | 'enterprise';
    urgentGaps?: string[]; // User knows they're missing X, wants advice on it
  };
}

// Add to user prompt:
${input.context ? `
## Additional Context
- Target Industry: ${input.context.targetIndustry}
- Seniority Level: ${input.context.targetLevel}
- Location: ${input.context.geographicLocation}
- Company Size: ${input.context.companySize}
${input.context.urgentGaps ? `- Known Gaps to Address: ${input.context.urgentGaps.join(', ')}` : ''}
` : ''}
```

---

### **Response Parsing & Validation**

```typescript
import { z } from 'zod'

const AnalysisSchema = z.object({
  overallFit: z.object({
    score: z.number().min(0).max(100),
    category: z.enum([
      'Excellent Match',
      'Strong Candidate',
      'Moderate Fit',
      'Stretch Candidate',
      'Poor Fit',
    ]),
    summary: z.string().min(50).max(500),
  }),
  strengths: z.array(
    z.object({
      area: z.string(),
      evidence: z.string(),
      relevance: z.string(),
    })
  ),
  gaps: z.array(
    z.object({
      requirement: z.string(),
      severity: z.enum(['Critical', 'Important', 'Nice-to-have']),
      impact: z.string(),
      mitigation: z.string(),
    })
  ),
  competitiveAnalysis: z.object({
    marketPosition: z.string(),
    differentiators: z.array(z.string()),
    commoditySkills: z.array(z.string()),
    redFlags: z.array(z.string()),
  }),
  recommendations: z.object({
    immediate: z.array(z.string()),
    shortTerm: z.array(z.string()),
    longTerm: z.array(z.string()),
    cvImprovements: z.array(z.string()),
  }),
  interviewPrep: z.object({
    expectedQuestions: z.array(z.string()),
    weakPointsToAddress: z.array(z.string()),
    storiesNeeded: z.array(z.string()),
  }),
})

type CVAnalysis = z.infer<typeof AnalysisSchema>

async function analyzeCV(
  cv: AnalysisInput['cv'],
  jobDescription: AnalysisInput['jobDescription'],
  context?: AdvancedAnalysisInput['context']
): Promise<CVAnalysis> {
  const response = await fetch(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4-20250514', // or your chosen model
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: buildUserPrompt({ cv, jobDescription, context }),
          },
        ],
        response_format: { type: 'json_object' }, // Some models support this
      }),
    }
  )

  const data = await response.json()
  const rawAnalysis = JSON.parse(data.choices[0].message.content)

  // Validate with Zod
  return AnalysisSchema.parse(rawAnalysis)
}
```

---

### **UI/UX Considerations**

**Input Methods:**

1. **Paste Job Description**

   ```typescript
   // Simple textarea, extract key sections
   function parseJobDescription(text: string) {
     // Use AI to extract structure from freeform text
     // Or provide form fields for requirements, responsibilities
   }
   ```

2. **Job URL**

   ```typescript
   // Scrape job posting from LinkedIn, Indeed, company site
   async function fetchJobPosting(url: string) {
     // Use Cloudflare Workers to scrape
     // Or integrate with job board APIs
   }
   ```

3. **LinkedIn Job ID**

   ```typescript
   // Direct integration if possible
   ```

**Output Presentation:**

```typescript
// Visual score indicator
<ScoreCircle score={analysis.overallFit.score} />

// Expandable sections
<Accordion>
  <AccordionItem title="Strengths" badge={analysis.strengths.length}>
    {/* Render strengths with evidence */}
  </AccordionItem>
  <AccordionItem title="Gaps" badge={analysis.gaps.length} variant="warning">
    {/* Render gaps with severity indicators */}
  </AccordionItem>
</Accordion>

// Action-oriented recommendations
<ChecklistCard items={analysis.recommendations.immediate} />
```

---

### **Model Selection Strategy**

**For free/cheap tier (OpenRouter):**

```typescript
const MODEL_CONFIG = {
  // Fast, cheap, good enough for most
  basic: 'meta-llama/llama-3.2-3b-instruct:free',

  // Better reasoning, still free
  standard: 'google/gemma-2-9b-it:free',

  // Best results, small cost
  premium: 'anthropic/claude-sonnet-4-20250514',
}

// Adaptive selection based on CV complexity
function selectModel(cvLength: number, jdLength: number): string {
  const totalTokens = (cvLength + jdLength) / 4 // rough estimate

  if (totalTokens < 2000) return MODEL_CONFIG.basic
  if (totalTokens < 5000) return MODEL_CONFIG.standard
  return MODEL_CONFIG.premium
}
```

---

### **Advanced Features**

#### 1. Comparison Mode

```typescript
// Analyze against multiple JDs, show which is best fit
async function compareFit(
  cv: AnalysisInput['cv'],
  jobDescriptions: AnalysisInput['jobDescription'][]
): Promise<Array<CVAnalysis & { jobId: string }>> {
  // Parallel analysis
  const analyses = await Promise.all(
    jobDescriptions.map(jd => analyzeCV(cv, jd))
  )

  // Rank by fit score
  return analyses.sort((a, b) => b.overallFit.score - a.overallFit.score)
}
```

#### 2. CV Optimization Suggestions

```typescript
// Suggest CV rewrites to better match JD
async function optimizeCV(
  cv: AnalysisInput['cv'],
  analysis: CVAnalysis
): Promise<{
  revisedSections: Record<string, string>
  keywordsToAdd: string[]
  experienceReframes: Array<{ original: string; improved: string }>
}> {
  // Use analysis gaps to guide improvements
}
```

#### 3. ATS Keyword Analysis

```typescript
// Check if CV will pass Applicant Tracking Systems
function atsKeywordMatch(
  cv: AnalysisInput['cv'],
  jd: AnalysisInput['jobDescription']
) {
  // Extract keywords from JD
  // Check presence in CV
  // Return coverage score
}
```

---

### **Error Handling & Edge Cases**

```typescript
// Handle partial or malformed responses
function safeParseAnalysis(rawResponse: string): CVAnalysis | null {
  try {
    const parsed = JSON.parse(rawResponse)
    return AnalysisSchema.parse(parsed)
  } catch (error) {
    // Log to monitoring
    console.error('Failed to parse analysis', error)

    // Return graceful fallback
    return {
      overallFit: {
        score: 50,
        category: 'Moderate Fit',
        summary: 'Unable to complete full analysis. Please try again.',
      },
      // ... minimal valid structure
    }
  }
}

// Handle rate limits
async function analyzeWithRetry(input: AnalysisInput, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await analyzeCV(input.cv, input.jobDescription)
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        await sleep(2 ** i * 1000) // Exponential backoff
        continue
      }
      throw error
    }
  }
}
```

---

### **Privacy & Data Handling**

```typescript
// Don't store PII unnecessarily
interface AnalysisRecord {
  id: string
  userId: string
  jobTitle: string // Store metadata, not full JD
  analyzedAt: Date
  score: number
  // Don't store: actual CV content, company names
}

// Encrypt sensitive data in KV
async function storeAnalysis(analysis: CVAnalysis, metadata: AnalysisRecord) {
  const encrypted = await encrypt(analysis) // Use Web Crypto API
  await env.KV.put(
    `analysis:${metadata.id}`,
    encrypted,
    { expirationTtl: 60 * 60 * 24 * 30 } // 30 days
  )
}
```

---

## **Example Implementation in Your Platform**

```typescript
// /api/analyze-cv route in Cloudflare Workers

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    const { cvId, jobDescription } = await request.json()

    // Fetch CV from KV
    const cv = await env.KV.get(`cv:${cvId}`, 'json')

    // Run analysis
    const analysis = await analyzeCV(cv, jobDescription)

    // Store result
    const analysisId = crypto.randomUUID()
    await env.KV.put(`analysis:${analysisId}`, JSON.stringify(analysis), {
      expirationTtl: 60 * 60 * 24 * 30,
    })

    return Response.json({
      analysisId,
      analysis,
    })
  },
}
```
