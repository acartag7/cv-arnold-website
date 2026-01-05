# Task 23: AI-Powered Content Enhancement - Implementation Plan

> **Referenced from:** task-16-implementation.md (Phase 6)
> **Status:** Planning
> **Last Updated:** 2026-01-04

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [AI Provider Abstraction](#ai-provider-abstraction)
4. [OpenRouter Integration](#openrouter-integration)
5. [PDF Import Feature](#pdf-import-feature)
6. [Inline Text Enhancement](#inline-text-enhancement)
7. [Achievement Generator](#achievement-generator)
8. [Skills Suggester](#skills-suggester)
9. [CV vs Job Description Analyzer](#cv-vs-job-description-analyzer)
10. [Multi-Job Comparison](#multi-job-comparison)
11. [Interview Preparation](#interview-preparation)
12. [ATS Score Estimator](#ats-score-estimator)
13. [Resume Translation](#resume-translation)
14. [System Prompts Reference](#system-prompts-reference)
15. [Free Tier Management](#free-tier-management)
16. [UI Components](#ui-components)
17. [Error Handling](#error-handling)
18. [Testing Strategy](#testing-strategy)

---

## Overview

### Goals

1. **Enhance CV Content** - AI-powered text improvement for summaries, descriptions, achievements
2. **Smart Extraction** - Import CV data from PDF uploads
3. **Job Market Intelligence** - Analyze CV against job descriptions
4. **Accessibility** - Use free AI models with graceful fallback to paid models

### Key Decisions

| Decision         | Choice                        | Why                                                  | Why NOT Alternatives                           |
| ---------------- | ----------------------------- | ---------------------------------------------------- | ---------------------------------------------- |
| Primary Provider | OpenRouter                    | Single API for multiple models, free tier available  | Direct API calls require multiple integrations |
| Architecture     | Abstracted Provider Interface | Swap providers without code changes                  | Hardcoded OpenRouter limits flexibility        |
| PDF Import       | Both Wizard + Admin           | Maximum flexibility, users can re-import             | Single location limits use cases               |
| UI Style         | Prominent (B) + Hybrid        | Primary fields get full buttons, secondary get icons | Full buttons everywhere causes clutter         |
| Error Handling   | Toast + Cached Fallback       | Good UX without complexity                           | Offline queue adds complexity                  |

---

## Architecture

### High-Level Design

```text
┌─────────────────────────────────────────────────────────────────┐
│                        Admin UI Layer                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────────┐ │
│  │ Enhance  │ │ Generate │ │ Analyze  │ │ Import PDF           │ │
│  │ Buttons  │ │ Achieve. │ │ Job Desc │ │ (Wizard + Admin)     │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────────┬───────────┘ │
└───────┼────────────┼────────────┼──────────────────┼─────────────┘
        │            │            │                  │
        ▼            ▼            ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI Service Layer                              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    AIService.ts                              │ │
│  │  - enhanceText(text, options)                               │ │
│  │  - generateAchievements(context)                            │ │
│  │  - suggestSkills(experiences)                               │ │
│  │  - analyzeJobMatch(cv, jobDescription)                      │ │
│  │  - extractFromPDF(pdfBuffer)                                │ │
│  │  - translateCV(cv, targetLanguage)                          │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                 AI Provider Abstraction                          │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              AIProviderInterface                             │ │
│  │  - complete(prompt, options): Promise<string>               │ │
│  │  - completeWithSchema(prompt, schema): Promise<T>           │ │
│  │  - getAvailableModels(): Model[]                            │ │
│  │  - checkQuota(): QuotaStatus                                │ │
│  └─────────────────────────────────────────────────────────────┘ │
│         ▲                    ▲                    ▲               │
│         │                    │                    │               │
│  ┌──────┴──────┐     ┌──────┴──────┐     ┌──────┴──────┐        │
│  │ OpenRouter  │     │ Workers AI  │     │   Custom    │        │
│  │  Provider   │     │  Provider   │     │  Provider   │        │
│  └─────────────┘     └─────────────┘     └─────────────┘        │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Model Selection & Fallback                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              ModelSelector.ts                                │ │
│  │  Priority: Free Models → Other Free → Paid (if configured)  │ │
│  │                                                              │ │
│  │  1. meta-llama/llama-3.2-3b-instruct:free                   │ │
│  │  2. google/gemma-2-9b-it:free                               │ │
│  │  3. mistralai/mistral-7b-instruct:free                      │ │
│  │  4. User's paid models (if API key has credits)             │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### File Structure

```text
src/
├── services/
│   └── ai/
│       ├── AIService.ts              # Main service facade
│       ├── AIProviderInterface.ts    # Provider abstraction
│       ├── providers/
│       │   ├── OpenRouterProvider.ts
│       │   ├── WorkersAIProvider.ts
│       │   └── index.ts
│       ├── ModelSelector.ts          # Fallback logic
│       ├── prompts/
│       │   ├── enhance.ts            # Text enhancement prompts
│       │   ├── achievements.ts       # Achievement generation
│       │   ├── skills.ts             # Skills suggestion
│       │   ├── jobMatch.ts           # Job analysis prompts
│       │   ├── pdfExtract.ts         # PDF to CV extraction
│       │   └── translate.ts          # Translation prompts
│       ├── schemas/
│       │   ├── enhanceResponse.ts    # Zod schemas for responses
│       │   ├── achievementsResponse.ts
│       │   ├── jobMatchResponse.ts
│       │   └── cvExtractResponse.ts
│       └── QuotaManager.ts           # Free tier tracking
├── components/
│   └── admin/
│       └── ai/
│           ├── EnhanceButton.tsx     # Inline enhancement
│           ├── AIActionBar.tsx       # Button row for textareas
│           ├── AISuggestionPanel.tsx # Suggestions display
│           ├── JobMatchAnalyzer.tsx  # Full analyzer UI
│           ├── PDFImporter.tsx       # PDF upload + preview
│           └── AILoadingState.tsx    # Consistent loading UI
└── app/
    └── admin/
        ├── ai-tools/
        │   └── page.tsx              # Dashboard AI hub
        └── job-match/
            └── page.tsx              # Job analyzer page
```

---

## AI Provider Abstraction

### Interface Definition

```typescript
// src/services/ai/AIProviderInterface.ts

export interface AIProviderConfig {
  apiKey: string
  baseUrl?: string
  defaultModel?: string
  maxRetries?: number
  timeout?: number
}

export interface CompletionOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
  stream?: boolean
}

export interface Model {
  id: string
  name: string
  provider: string
  isFree: boolean
  contextLength: number
  capabilities: ('text' | 'vision' | 'function_calling')[]
}

export interface QuotaStatus {
  remaining: number
  limit: number
  resetsAt: Date
  isExceeded: boolean
}

export interface AIProviderInterface {
  /**
   * Get provider name for identification
   */
  readonly name: string

  /**
   * Simple text completion
   */
  complete(prompt: string, options?: CompletionOptions): Promise<string>

  /**
   * Completion with structured output validated by Zod schema
   */
  completeWithSchema<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    options?: CompletionOptions
  ): Promise<T>

  /**
   * Stream completion for real-time UI updates
   */
  streamComplete(
    prompt: string,
    options?: CompletionOptions
  ): AsyncIterable<string>

  /**
   * Get list of available models
   */
  getAvailableModels(): Promise<Model[]>

  /**
   * Check current quota/rate limit status
   */
  checkQuota(): Promise<QuotaStatus>

  /**
   * Test if provider is configured and working
   */
  healthCheck(): Promise<boolean>
}
```

### Provider Factory

```typescript
// src/services/ai/providers/index.ts

import { AIProviderInterface, AIProviderConfig } from '../AIProviderInterface'
import { OpenRouterProvider } from './OpenRouterProvider'
import { WorkersAIProvider } from './WorkersAIProvider'

export type ProviderType = 'openrouter' | 'workers-ai' | 'custom'

export function createProvider(
  type: ProviderType,
  config: AIProviderConfig
): AIProviderInterface {
  switch (type) {
    case 'openrouter':
      return new OpenRouterProvider(config)
    case 'workers-ai':
      return new WorkersAIProvider(config)
    default:
      throw new Error(`Unknown provider type: ${type}`)
  }
}

// Get configured provider based on environment
export function getDefaultProvider(): AIProviderInterface {
  const openRouterKey = process.env.OPENROUTER_API_KEY
  const workersAIEnabled = process.env.WORKERS_AI_ENABLED === 'true'

  if (openRouterKey) {
    return new OpenRouterProvider({ apiKey: openRouterKey })
  }

  if (workersAIEnabled) {
    return new WorkersAIProvider({})
  }

  throw new Error(
    'No AI provider configured. Set OPENROUTER_API_KEY or enable WORKERS_AI.'
  )
}
```

---

## OpenRouter Integration

### Provider Implementation

````typescript
// src/services/ai/providers/OpenRouterProvider.ts

import { z } from 'zod'
import {
  AIProviderInterface,
  AIProviderConfig,
  CompletionOptions,
  Model,
  QuotaStatus,
} from '../AIProviderInterface'

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

// Free models available on OpenRouter
const FREE_MODELS: Model[] = [
  {
    id: 'meta-llama/llama-3.2-3b-instruct:free',
    name: 'Llama 3.2 3B Instruct (Free)',
    provider: 'meta-llama',
    isFree: true,
    contextLength: 131072,
    capabilities: ['text'],
  },
  {
    id: 'google/gemma-2-9b-it:free',
    name: 'Gemma 2 9B IT (Free)',
    provider: 'google',
    isFree: true,
    contextLength: 8192,
    capabilities: ['text'],
  },
  {
    id: 'mistralai/mistral-7b-instruct:free',
    name: 'Mistral 7B Instruct (Free)',
    provider: 'mistralai',
    isFree: true,
    contextLength: 32768,
    capabilities: ['text'],
  },
]

export class OpenRouterProvider implements AIProviderInterface {
  readonly name = 'openrouter'
  private config: AIProviderConfig
  private cachedModels: Model[] | null = null

  constructor(config: AIProviderConfig) {
    this.config = {
      baseUrl: OPENROUTER_BASE_URL,
      maxRetries: 3,
      timeout: 30000,
      ...config,
    }
  }

  async complete(prompt: string, options?: CompletionOptions): Promise<string> {
    const model =
      options?.model || this.config.defaultModel || FREE_MODELS[0].id

    const response = await this.makeRequest('/chat/completions', {
      model,
      messages: [
        ...(options?.systemPrompt
          ? [{ role: 'system', content: options.systemPrompt }]
          : []),
        { role: 'user', content: prompt },
      ],
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1024,
    })

    return response.choices[0].message.content
  }

  async completeWithSchema<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    options?: CompletionOptions
  ): Promise<T> {
    // Add JSON instruction to prompt
    const jsonPrompt = `${prompt}

IMPORTANT: Respond ONLY with valid JSON matching this structure. No markdown, no explanation, just JSON.`

    const response = await this.complete(jsonPrompt, {
      ...options,
      temperature: 0.3, // Lower temperature for structured output
    })

    // Parse and validate with Zod
    try {
      // Try to extract JSON from response (handle markdown code blocks)
      let jsonStr = response
      const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim()
      }

      const parsed = JSON.parse(jsonStr)
      return schema.parse(parsed)
    } catch (error) {
      throw new Error(`Failed to parse AI response as valid JSON: ${error}`)
    }
  }

  async *streamComplete(
    prompt: string,
    options?: CompletionOptions
  ): AsyncIterable<string> {
    const model =
      options?.model || this.config.defaultModel || FREE_MODELS[0].id

    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer':
          process.env.SITE_URL || 'https://cv.arnoldcartagena.com',
        'X-Title': 'CV Admin Portal',
      },
      body: JSON.stringify({
        model,
        messages: [
          ...(options?.systemPrompt
            ? [{ role: 'system', content: options.systemPrompt }]
            : []),
          { role: 'user', content: prompt },
        ],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 1024,
        stream: true,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') return

          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices?.[0]?.delta?.content
            if (content) yield content
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  }

  async getAvailableModels(): Promise<Model[]> {
    if (this.cachedModels) return this.cachedModels

    try {
      const response = await this.makeRequest('/models', {}, 'GET')

      // Map to our Model interface and include free models
      const allModels: Model[] = response.data.map((m: any) => ({
        id: m.id,
        name: m.name,
        provider: m.id.split('/')[0],
        isFree: m.id.endsWith(':free'),
        contextLength: m.context_length || 4096,
        capabilities: m.capabilities || ['text'],
      }))

      // Ensure free models are included
      this.cachedModels = [
        ...FREE_MODELS,
        ...allModels.filter(m => !FREE_MODELS.some(f => f.id === m.id)),
      ]

      return this.cachedModels
    } catch {
      // Fallback to known free models
      return FREE_MODELS
    }
  }

  async checkQuota(): Promise<QuotaStatus> {
    // OpenRouter doesn't have explicit quota API for free tier
    // We track locally in QuotaManager
    return {
      remaining: -1, // Unknown
      limit: -1,
      resetsAt: new Date(),
      isExceeded: false,
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.complete('Say "OK"', { maxTokens: 10 })
      return true
    } catch {
      return false
    }
  }

  private async makeRequest(
    endpoint: string,
    body: any,
    method: 'POST' | 'GET' = 'POST'
  ): Promise<any> {
    const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer':
          process.env.SITE_URL || 'https://cv.arnoldcartagena.com',
        'X-Title': 'CV Admin Portal',
      },
      ...(method === 'POST' ? { body: JSON.stringify(body) } : {}),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(
        `OpenRouter API error: ${response.status} - ${error.message || 'Unknown error'}`
      )
    }

    return response.json()
  }
}
````

### Environment Configuration

```bash
# .env.local

# OpenRouter (Primary)
OPENROUTER_API_KEY=sk-or-v1-xxxxx

# Workers AI (Fallback - enabled in Cloudflare)
WORKERS_AI_ENABLED=true

# Site URL for OpenRouter headers
SITE_URL=https://cv.arnoldcartagena.com

# Optional: User's own API key (BYOK)
# Set via admin UI, stored in KV
```

---

## PDF Import Feature

### PDF Import Overview

PDF Import allows users to upload an existing CV/resume and have AI extract
structured data into the CV schema.

**Locations:**

1. **Setup Wizard (Task 17)** - "Import from existing CV" option
2. **Admin Dashboard** - "Import from PDF" button in Quick Actions

### Flow Diagram

```text
┌─────────────────────────────────────────────────────────────────┐
│                        PDF Import Flow                           │
└─────────────────────────────────────────────────────────────────┘

User uploads PDF
       │
       ▼
┌──────────────┐
│ Validate PDF │ (size < 10MB, is valid PDF)
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Extract Text     │ (pdf-parse or pass to vision model)
│ from PDF         │
└──────┬───────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ Send to AI with CV Schema                │
│ "Extract CV data from this text..."      │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ Validate Response with Zod Schema        │
│ (CVDataSchema from Task 3.2)             │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ Show Preview to User                     │
│ - Side-by-side: PDF view | Extracted     │
│ - Highlight uncertain fields             │
│ - Allow inline edits                     │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ User Confirms Import                     │
│ ⚠️ "This will overwrite current data.   │
│    A backup will be created."            │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ Create Version Snapshot (R2)             │
│ (Uses HistoryService from Task 16.8)     │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ Save Extracted Data to KV                │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ Show Success Toast                       │
│ "CV imported! You can rollback from      │
│  History if needed."                     │
└──────────────────────────────────────────┘
```

### Implementation

```typescript
// src/services/ai/PDFExtractor.ts

import { z } from 'zod'
import { CVDataSchema } from '@/schemas/cv.schema'
import { AIService } from './AIService'
import { PDF_EXTRACT_SYSTEM_PROMPT } from './prompts/pdfExtract'

export interface PDFExtractionResult {
  success: boolean
  data?: z.infer<typeof CVDataSchema>
  confidence: number // 0-100
  warnings: string[] // Fields that couldn't be extracted
  rawText?: string // For debugging
}

export class PDFExtractor {
  private aiService: AIService

  constructor(aiService: AIService) {
    this.aiService = aiService
  }

  async extractFromPDF(pdfBuffer: ArrayBuffer): Promise<PDFExtractionResult> {
    // Step 1: Extract text from PDF
    const text = await this.extractText(pdfBuffer)

    if (!text || text.length < 100) {
      return {
        success: false,
        confidence: 0,
        warnings: ['Could not extract text from PDF. Try a different file.'],
        rawText: text,
      }
    }

    // Step 2: Send to AI for structured extraction
    const extractionPrompt = this.buildExtractionPrompt(text)

    try {
      const result = await this.aiService.completeWithSchema(
        extractionPrompt,
        CVDataSchema,
        {
          systemPrompt: PDF_EXTRACT_SYSTEM_PROMPT,
          temperature: 0.2, // Low temperature for accuracy
          maxTokens: 4096,
        }
      )

      // Step 3: Calculate confidence and warnings
      const { confidence, warnings } = this.assessExtraction(result)

      return {
        success: true,
        data: result,
        confidence,
        warnings,
        rawText: text,
      }
    } catch (error) {
      return {
        success: false,
        confidence: 0,
        warnings: [`AI extraction failed: ${error}`],
        rawText: text,
      }
    }
  }

  private async extractText(pdfBuffer: ArrayBuffer): Promise<string> {
    // Option 1: Use pdf-parse library
    // const pdfParse = await import('pdf-parse');
    // const data = await pdfParse(Buffer.from(pdfBuffer));
    // return data.text;

    // Option 2: Use vision-capable model (better for formatted PDFs)
    // Convert PDF to images and send to vision model

    // For now, using pdf-parse
    const pdfParse = (await import('pdf-parse')).default
    const data = await pdfParse(Buffer.from(pdfBuffer))
    return data.text
  }

  private buildExtractionPrompt(text: string): string {
    return `Extract CV/Resume data from the following text.

TEXT FROM PDF:
---
${text}
---

Extract all information you can find and structure it according to the schema.
If a field is not found in the text, use null or empty array as appropriate.
Be thorough - look for: name, title, contact info, summary, work experience,
education, skills, certifications, languages, and achievements.`
  }

  private assessExtraction(data: any): {
    confidence: number
    warnings: string[]
  } {
    const warnings: string[] = []
    let score = 100

    // Check required fields
    if (!data.personalInfo?.fullName) {
      warnings.push('Could not extract full name')
      score -= 20
    }
    if (!data.personalInfo?.title) {
      warnings.push('Could not extract professional title')
      score -= 10
    }
    if (!data.experience || data.experience.length === 0) {
      warnings.push('No work experience found')
      score -= 20
    }
    if (!data.skills || data.skills.length === 0) {
      warnings.push('No skills found')
      score -= 15
    }
    if (!data.personalInfo?.summary) {
      warnings.push('No professional summary found')
      score -= 10
    }

    return {
      confidence: Math.max(0, score),
      warnings,
    }
  }
}
```

### PDF Importer UI Component

```typescript
// src/components/admin/ai/PDFImporter.tsx

'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FileUp,
  AlertTriangle,
  CheckCircle,
  Loader2,
  RotateCcw
} from 'lucide-react';
import { usePDFExtraction } from '@/hooks/usePDFExtraction';
import { PDFPreview } from './PDFPreview';
import { CVDataPreview } from './CVDataPreview';

interface PDFImporterProps {
  onImportComplete: () => void;
  onCancel: () => void;
  isWizardMode?: boolean; // Different styling for setup wizard
}

export function PDFImporter({
  onImportComplete,
  onCancel,
  isWizardMode = false
}: PDFImporterProps) {
  const [file, setFile] = useState<File | null>(null);
  const {
    extract,
    confirm,
    result,
    isExtracting,
    isConfirming,
    error
  } = usePDFExtraction();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const pdfFile = acceptedFiles[0];
    if (pdfFile) {
      setFile(pdfFile);
      await extract(pdfFile);
    }
  }, [extract]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  const handleConfirm = async () => {
    if (result?.data) {
      await confirm(result.data);
      onImportComplete();
    }
  };

  // Step 1: Upload state
  if (!file || !result) {
    return (
      <div className="space-y-6">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
            transition-colors duration-200
            ${isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50'
            }
          `}
        >
          <input {...getInputProps()} />
          <FileUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium">
            {isDragActive ? 'Drop your CV here' : 'Drag & drop your CV (PDF)'}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            or click to browse (max 10MB)
          </p>
        </div>

        {isExtracting && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing your CV with AI...</span>
            </div>
            <Progress value={undefined} className="animate-pulse" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  // Step 2: Preview and confirm
  return (
    <div className="space-y-6">
      {/* Confidence indicator */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-1">
            <span>Extraction Confidence</span>
            <span className={
              result.confidence >= 80 ? 'text-green-600' :
              result.confidence >= 60 ? 'text-yellow-600' : 'text-red-600'
            }>
              {result.confidence}%
            </span>
          </div>
          <Progress value={result.confidence} />
        </div>
      </div>

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <Alert>
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            <p className="font-medium mb-2">Some fields need attention:</p>
            <ul className="list-disc pl-4 space-y-1">
              {result.warnings.map((warning, i) => (
                <li key={i} className="text-sm">{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Side-by-side preview */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="font-medium mb-3">Original PDF</h3>
          <PDFPreview file={file} />
        </Card>
        <Card className="p-4">
          <h3 className="font-medium mb-3">Extracted Data</h3>
          <CVDataPreview data={result.data} />
        </Card>
      </div>

      {/* Overwrite warning */}
      {!isWizardMode && (
        <Alert>
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            <strong>This will overwrite your current CV data.</strong>
            <br />
            A backup will be created automatically. You can restore it from
            History if needed.
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => { setFile(null); }}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Another File
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isConfirming || result.confidence < 30}
          >
            {isConfirming ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm Import
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

## Inline Text Enhancement

### Inline Enhancement Overview

Small AI action buttons appear below text fields (Summary, Job Descriptions) to improve content.

### Button Types

| Button      | Action                          | Icon | Description                                    |
| ----------- | ------------------------------- | ---- | ---------------------------------------------- |
| **Enhance** | Improve clarity and impact      | ✨   | Rewrites for better flow and stronger language |
| **Grammar** | Fix grammar and spelling        | 📝   | Corrects errors without changing meaning       |
| **Shorter** | Condense without losing meaning | 📏   | Reduces length by ~30%                         |
| **Expand**  | Add more detail                 | 📐   | Elaborates with relevant details               |

### UI Placement Strategy

| Field Type           | Style             | Example                                              |
| -------------------- | ----------------- | ---------------------------------------------------- |
| Professional Summary | Full button row   | `[✨ Enhance] [📝 Grammar] [📏 Shorter] [📐 Expand]` |
| Job Description      | Full button row   | Same as above                                        |
| Achievement items    | Icon-only buttons | `[✨] [📝]` (no Shorter/Expand)                      |
| Skill descriptions   | No AI buttons     | Too short for AI value                               |

### Component Implementation

```typescript
// src/components/admin/ai/AIActionBar.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  SpellCheck,
  Minimize2,
  Maximize2,
  Loader2,
  Check,
  X
} from 'lucide-react';
import { useAIEnhance } from '@/hooks/useAIEnhance';
import { cn } from '@/lib/utils';

type EnhanceAction = 'enhance' | 'grammar' | 'shorter' | 'expand';

interface AIActionBarProps {
  text: string;
  onApply: (newText: string) => void;
  variant?: 'full' | 'compact'; // full = buttons with labels, compact = icons only
  className?: string;
}

const actions: {
  id: EnhanceAction;
  label: string;
  icon: typeof Sparkles;
  description: string;
}[] = [
  {
    id: 'enhance',
    label: 'Enhance',
    icon: Sparkles,
    description: 'Improve clarity and impact'
  },
  {
    id: 'grammar',
    label: 'Grammar',
    icon: SpellCheck,
    description: 'Fix grammar and spelling'
  },
  {
    id: 'shorter',
    label: 'Shorter',
    icon: Minimize2,
    description: 'Condense without losing meaning'
  },
  {
    id: 'expand',
    label: 'Expand',
    icon: Maximize2,
    description: 'Add more detail and context'
  },
];

export function AIActionBar({
  text,
  onApply,
  variant = 'full',
  className
}: AIActionBarProps) {
  const [activeAction, setActiveAction] = useState<EnhanceAction | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const { enhance, isLoading, error } = useAIEnhance();

  const handleAction = async (action: EnhanceAction) => {
    if (!text.trim()) return;

    setActiveAction(action);
    setSuggestion(null);

    const result = await enhance(text, action);
    if (result) {
      setSuggestion(result);
    }
  };

  const handleApply = () => {
    if (suggestion) {
      onApply(suggestion);
      setSuggestion(null);
      setActiveAction(null);
    }
  };

  const handleReject = () => {
    setSuggestion(null);
    setActiveAction(null);
  };

  // Show suggestion preview
  if (suggestion) {
    return (
      <div className={cn('space-y-3 p-3 bg-muted/50 rounded-lg', className)}>
        <div className="text-sm">
          <span className="font-medium text-muted-foreground">AI Suggestion:</span>
        </div>
        <p className="text-sm border-l-2 border-primary pl-3">{suggestion}</p>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleApply}>
            <Check className="w-3 h-3 mr-1" />
            Apply
          </Button>
          <Button size="sm" variant="ghost" onClick={handleReject}>
            <X className="w-3 h-3 mr-1" />
            Dismiss
          </Button>
        </div>
      </div>
    );
  }

  // Action buttons
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {actions.map((action) => {
        const Icon = action.icon;
        const isActive = activeAction === action.id && isLoading;

        // Skip shorter/expand for compact variant
        if (variant === 'compact' && ['shorter', 'expand'].includes(action.id)) {
          return null;
        }

        return (
          <Button
            key={action.id}
            variant="ghost"
            size="sm"
            onClick={() => handleAction(action.id)}
            disabled={isLoading || !text.trim()}
            className="h-7 text-xs"
            title={action.description}
          >
            {isActive ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Icon className="w-3 h-3" />
            )}
            {variant === 'full' && (
              <span className="ml-1">{action.label}</span>
            )}
          </Button>
        );
      })}

      {error && (
        <span className="text-xs text-destructive">{error}</span>
      )}
    </div>
  );
}
```

### Hook Implementation

```typescript
// src/hooks/useAIEnhance.ts

import { useState } from 'react'
import { useAIService } from './useAIService'
import { toast } from 'sonner'

type EnhanceAction = 'enhance' | 'grammar' | 'shorter' | 'expand'

export function useAIEnhance() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const aiService = useAIService()

  const enhance = async (
    text: string,
    action: EnhanceAction
  ): Promise<string | null> => {
    if (!text.trim()) return null

    setIsLoading(true)
    setError(null)

    try {
      const result = await aiService.enhanceText(text, { action })
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Enhancement failed'
      setError(message)
      toast.error('AI Enhancement Failed', { description: message })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { enhance, isLoading, error }
}
```

---

## Achievement Generator

### Achievement Generator Overview

AI analyzes the Job Description field and generates relevant achievement
bullet points.

### Achievement Generator Implementation

```typescript
// src/services/ai/AchievementGenerator.ts

import { z } from 'zod'
import { AIService } from './AIService'
import { ACHIEVEMENT_GENERATOR_PROMPT } from './prompts/achievements'

const AchievementSuggestionSchema = z.object({
  achievements: z.array(
    z.object({
      text: z.string(),
      confidence: z.number().min(0).max(100),
      reasoning: z.string().optional(),
    })
  ),
})

export interface GeneratedAchievement {
  text: string
  confidence: number
  reasoning?: string
}

export class AchievementGenerator {
  private aiService: AIService

  constructor(aiService: AIService) {
    this.aiService = aiService
  }

  async generateFromDescription(
    jobTitle: string,
    company: string,
    description: string,
    existingAchievements: string[] = []
  ): Promise<GeneratedAchievement[]> {
    const prompt = this.buildPrompt(
      jobTitle,
      company,
      description,
      existingAchievements
    )

    const result = await this.aiService.completeWithSchema(
      prompt,
      AchievementSuggestionSchema,
      {
        systemPrompt: ACHIEVEMENT_GENERATOR_PROMPT,
        temperature: 0.7,
        maxTokens: 1024,
      }
    )

    return result.achievements
  }

  private buildPrompt(
    jobTitle: string,
    company: string,
    description: string,
    existingAchievements: string[]
  ): string {
    return `
Generate 3-5 achievement bullet points for this role:

JOB TITLE: ${jobTitle}
COMPANY: ${company}

JOB DESCRIPTION:
${description}

${
  existingAchievements.length > 0
    ? `
EXISTING ACHIEVEMENTS (don't duplicate these):
${existingAchievements.map(a => `- ${a}`).join('\n')}
`
    : ''
}

Generate achievements that:
1. Start with strong action verbs (Led, Architected, Delivered, etc.)
2. Include quantifiable results where possible (%, $, time saved)
3. Are specific to the role and company context
4. Sound professional and impactful
5. Are different from existing achievements
    `.trim()
  }
}
```

### Achievement Suggester UI Component

```typescript
// src/components/admin/ai/AchievementSuggester.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, Loader2, Plus } from 'lucide-react';
import { useAchievementGenerator } from '@/hooks/useAchievementGenerator';

interface AchievementSuggesterProps {
  jobTitle: string;
  company: string;
  description: string;
  existingAchievements: string[];
  onAddAchievements: (achievements: string[]) => void;
}

export function AchievementSuggester({
  jobTitle,
  company,
  description,
  existingAchievements,
  onAddAchievements,
}: AchievementSuggesterProps) {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const {
    generate,
    suggestions,
    isGenerating,
    error
  } = useAchievementGenerator();

  const handleGenerate = async () => {
    setSelectedIndices(new Set());
    await generate(jobTitle, company, description, existingAchievements);
  };

  const toggleSelection = (index: number) => {
    const newSet = new Set(selectedIndices);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedIndices(newSet);
  };

  const handleAddSelected = () => {
    const selected = Array.from(selectedIndices)
      .map(i => suggestions[i]?.text)
      .filter(Boolean);

    if (selected.length > 0) {
      onAddAchievements(selected);
      setSelectedIndices(new Set());
    }
  };

  // Show generate button if no suggestions yet
  if (!suggestions || suggestions.length === 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleGenerate}
        disabled={isGenerating || !description.trim()}
        className="w-full border-dashed"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating suggestions...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Suggest achievements based on description
          </>
        )}
      </Button>
    );
  }

  // Show suggestions
  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          AI Suggested Achievements
        </h4>
        <Button variant="ghost" size="sm" onClick={handleGenerate}>
          Regenerate
        </Button>
      </div>

      <div className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <label
            key={index}
            className="flex items-start gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer"
          >
            <Checkbox
              checked={selectedIndices.has(index)}
              onCheckedChange={() => toggleSelection(index)}
            />
            <div className="flex-1">
              <p className="text-sm">{suggestion.text}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Confidence: {suggestion.confidence}%
              </p>
            </div>
          </label>
        ))}
      </div>

      {selectedIndices.size > 0 && (
        <Button onClick={handleAddSelected} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add {selectedIndices.size} achievement{selectedIndices.size > 1 ? 's' : ''}
        </Button>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </Card>
  );
}
```

---

## Skills Suggester

### Skills Suggester Overview

AI analyzes all Experience entries to suggest skills that should be added to
the Skills section.

### Skills Suggester Flow

```text
Analyze all Experience entries
         │
         ▼
Extract technologies and skills mentioned
         │
         ▼
Compare with existing Skills section
         │
         ▼
Suggest missing skills with category recommendations
         │
         ▼
User selects which to add
         │
         ▼
Add to appropriate skill categories
```

### Skills Suggester Implementation

```typescript
// src/services/ai/SkillsSuggester.ts

import { z } from 'zod'
import { AIService } from './AIService'
import { Experience, SkillCategory } from '@/schemas/cv.schema'

const SkillSuggestionSchema = z.object({
  suggestions: z.array(
    z.object({
      skillName: z.string(),
      suggestedCategory: z.string(),
      proficiencyLevel: z.enum(['Expert', 'Advanced', 'Intermediate', 'Basic']),
      foundIn: z.array(z.string()), // Experience titles where mentioned
      confidence: z.number().min(0).max(100),
    })
  ),
})

export interface SkillSuggestion {
  skillName: string
  suggestedCategory: string
  proficiencyLevel: string
  foundIn: string[]
  confidence: number
}

export class SkillsSuggester {
  private aiService: AIService

  constructor(aiService: AIService) {
    this.aiService = aiService
  }

  async suggestFromExperiences(
    experiences: Experience[],
    existingSkills: SkillCategory[]
  ): Promise<SkillSuggestion[]> {
    // Build context from experiences
    const experienceContext = experiences.map(exp => ({
      title: exp.position,
      company: exp.company,
      description: exp.description,
      technologies: exp.technologies || [],
    }))

    // Get existing skill names to avoid duplicates
    const existingSkillNames = new Set(
      existingSkills.flatMap(cat => cat.skills.map(s => s.name.toLowerCase()))
    )

    const prompt = `
Analyze these work experiences and suggest skills that should be added to the CV:

EXPERIENCES:
${JSON.stringify(experienceContext, null, 2)}

EXISTING SKILLS (don't suggest these):
${Array.from(existingSkillNames).join(', ')}

EXISTING CATEGORIES:
${existingSkills.map(c => c.name).join(', ')}

For each suggested skill, provide:
1. The skill name
2. Which category it belongs to (use existing category if appropriate, or suggest new)
3. Estimated proficiency based on how often/deeply it appears
4. Which experiences mention this skill
    `.trim()

    const result = await this.aiService.completeWithSchema(
      prompt,
      SkillSuggestionSchema,
      {
        systemPrompt:
          `You are a CV skills analyzer. Extract technical and ` +
          `professional skills from work experience descriptions. Be thorough ` +
          `but avoid suggesting skills that already exist. Focus on specific, ` +
          `valuable skills rather than generic ones.`,
        temperature: 0.5,
      }
    )

    // Filter out any that somehow match existing skills
    return result.suggestions.filter(
      s => !existingSkillNames.has(s.skillName.toLowerCase())
    )
  }
}
```

---

## CV vs Job Description Analyzer

### Job Match Overview

The killer feature - paste a job description and get detailed analysis of how
well the CV matches.

### Job Match UI Design

```text
┌─────────────────────────────────────────────────────────────────────┐
│  CV vs Job Description Analyzer                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Paste Job Description                                        │   │
│  │                                                              │   │
│  │ We're looking for a Senior Platform Engineer with...        │   │
│  │ (supports markdown, plain text, or LinkedIn URL)            │   │
│  │                                                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│                                    [🔍 Analyze Match]               │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Match Score                                                        │
│  ████████████████████░░░░░░░░░░ 78%                                │
│  Strong Match - You're a good fit for this role                    │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ✅ STRENGTHS (What makes you a good fit)                          │
│  ─────────────────────────────────────────                         │
│  • Kubernetes experience (mentioned in 4 of your roles)            │
│  • Terraform expertise (matches "IaC" requirement)                 │
│  • Team leadership (Swiss Post role shows this clearly)            │
│  • CI/CD pipeline experience (GitLab CI, GitHub Actions)           │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ⚠️ GAPS (Areas to address)                                        │
│  ─────────────────────────────────────────                         │
│  │ Priority │ Gap                  │ Suggestion                   │ │
│  ├──────────┼─────────────────────┼─────────────────────────────│ │
│  │ HIGH     │ "Cost optimization" │ Add to Swiss Post entry     │ │
│  │ MEDIUM   │ "Python scripting"  │ Add to Skills section       │ │
│  │ LOW      │ "Go programming"    │ Consider if relevant        │ │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  💡 RECOMMENDATIONS                                                 │
│  ─────────────────────────────────────────                         │
│  Immediate (before applying):                                       │
│  • Add "cost optimization" achievement to Swiss Post               │
│  • Mention Python in DevOps Engineer description                   │
│                                                                     │
│  For interview:                                                     │
│  • Prepare story about Kafka migration (matches scale req)         │
│  • Be ready to discuss team leadership experience                  │
│                                                                     │
│  [📋 Copy Recommendations] [✏️ Apply Suggestions to CV]            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Job Match Implementation

```typescript
// src/services/ai/JobMatchAnalyzer.ts

import { z } from 'zod'
import { AIService } from './AIService'
import { CVData } from '@/schemas/cv.schema'
import { JOB_MATCH_SYSTEM_PROMPT } from './prompts/jobMatch'

const JobMatchResultSchema = z.object({
  matchScore: z.number().min(0).max(100),
  matchLevel: z.enum([
    'Excellent Match',
    'Strong Match',
    'Good Match',
    'Partial Match',
    'Weak Match',
  ]),
  summary: z.string(),

  strengths: z.array(
    z.object({
      area: z.string(),
      evidence: z.string(),
      relevantExperience: z.string().optional(),
    })
  ),

  gaps: z.array(
    z.object({
      requirement: z.string(),
      priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
      suggestion: z.string(),
      whereToAdd: z.string().optional(),
    })
  ),

  recommendations: z.object({
    immediate: z.array(z.string()),
    shortTerm: z.array(z.string()),
    forInterview: z.array(z.string()),
  }),

  keywordsAnalysis: z.object({
    matched: z.array(z.string()),
    missing: z.array(z.string()),
    atsScore: z.number().min(0).max(100),
  }),
})

export type JobMatchResult = z.infer<typeof JobMatchResultSchema>

export class JobMatchAnalyzer {
  private aiService: AIService

  constructor(aiService: AIService) {
    this.aiService = aiService
  }

  async analyze(cv: CVData, jobDescription: string): Promise<JobMatchResult> {
    const cvSummary = this.buildCVSummary(cv)

    const prompt = `
Analyze how well this CV matches the job description.

=== CV CONTENT ===
${cvSummary}

=== JOB DESCRIPTION ===
${jobDescription}

Provide a comprehensive analysis including:
1. Overall match score (0-100) and level
2. Key strengths with evidence from the CV
3. Gaps with priority levels and specific suggestions
4. Actionable recommendations (immediate, short-term, for interview)
5. Keywords analysis for ATS optimization
    `.trim()

    return this.aiService.completeWithSchema(prompt, JobMatchResultSchema, {
      systemPrompt: JOB_MATCH_SYSTEM_PROMPT,
      temperature: 0.4,
      maxTokens: 2048,
    })
  }

  private buildCVSummary(cv: CVData): string {
    const sections: string[] = []

    // Personal info
    sections.push(`
NAME: ${cv.personalInfo.fullName}
TITLE: ${cv.personalInfo.title}
SUMMARY: ${cv.personalInfo.summary || 'Not provided'}
    `)

    // Experience
    if (cv.experience?.length) {
      sections.push('\nEXPERIENCE:')
      cv.experience.forEach(exp => {
        sections.push(`
- ${exp.position} at ${exp.company} (${exp.startDate} - ${exp.endDate || 'Present'})
  ${exp.description}
  Technologies: ${exp.technologies?.join(', ') || 'Not specified'}
  Achievements: ${exp.achievements?.join('; ') || 'Not specified'}
        `)
      })
    }

    // Skills
    if (cv.skills?.length) {
      sections.push('\nSKILLS:')
      cv.skills.forEach(cat => {
        sections.push(
          `- ${cat.name}: ${cat.skills.map(s => `${s.name} (${s.proficiency})`).join(', ')}`
        )
      })
    }

    // Certifications
    if (cv.certifications?.length) {
      sections.push('\nCERTIFICATIONS:')
      cv.certifications.forEach(cert => {
        sections.push(`- ${cert.name} (${cert.issuer})`)
      })
    }

    // Education
    if (cv.education?.length) {
      sections.push('\nEDUCATION:')
      cv.education.forEach(edu => {
        sections.push(`- ${edu.degree} in ${edu.field} from ${edu.institution}`)
      })
    }

    return sections.join('\n')
  }
}
```

---

## Multi-Job Comparison

### Multi-Job Overview

Compare CV against multiple job descriptions to help with strategic job
targeting.

### Multi-Job UI Concept

```text
┌─────────────────────────────────────────────────────────────────────┐
│  Multi-Job Comparison                                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Analyzed Jobs (3)                                                  │
│                                                                     │
│  ┌─────────────┬─────────────┬─────────────┬───────────────────┐   │
│  │ Job         │ Match Score │ Key Gaps    │ Action           │   │
│  ├─────────────┼─────────────┼─────────────┼───────────────────┤   │
│  │ Sr Platform │ 78%         │ 2 gaps      │ [View] [Remove]  │   │
│  │ Eng @ Stripe│ ████████░░  │             │                  │   │
│  ├─────────────┼─────────────┼─────────────┼───────────────────┤   │
│  │ DevOps Lead │ 65%         │ 5 gaps      │ [View] [Remove]  │   │
│  │ @ Spotify   │ ██████░░░░  │             │                  │   │
│  ├─────────────┼─────────────┼─────────────┼───────────────────┤   │
│  │ SRE @ Google│ 82%         │ 1 gap       │ [View] [Remove]  │   │
│  │             │ █████████░  │             │                  │   │
│  └─────────────┴─────────────┴─────────────┴───────────────────┘   │
│                                                                     │
│  Common Gaps Across Jobs:                                           │
│  • "Cost optimization" mentioned in 2/3 jobs                       │
│  • "On-call experience" mentioned in 2/3 jobs                      │
│                                                                     │
│  Recommendation: Focus on adding cost optimization to your CV      │
│  before applying to any of these roles.                            │
│                                                                     │
│  [+ Add Another Job]                      [📊 Export Comparison]   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Interview Preparation

### Interview Prep Overview

Based on job match analysis, generate interview preparation tips.

### Output Structure

```typescript
interface InterviewPrep {
  expectedQuestions: {
    question: string
    preparationTip: string
    relevantExperience?: string // From CV
  }[]

  storiesToPrepare: {
    situation: string
    fromExperience: string // Which CV experience to draw from
    keyPoints: string[]
  }[]

  weakPointsToAddress: {
    gap: string
    howToAddress: string
    honestAnswer: string // What to say if asked directly
  }[]

  questionsToAsk: string[]
}
```

---

## ATS Score Estimator

### ATS Estimator Overview

Analyze how well the CV would perform in Applicant Tracking Systems.

### Analysis Areas

1. **Keyword matching** - Required skills present in CV
2. **Format compatibility** - Structure ATS can parse
3. **Contact info** - Email, phone, LinkedIn present
4. **Section headings** - Standard naming (Experience vs Work History)
5. **Date formatting** - Consistent, parseable dates

---

## Resume Translation

### Translation Overview

Translate the entire CV to another language while preserving professional tone.

### Supported Languages (Initial)

- Spanish
- German
- French
- Portuguese
- Italian

### Implementation Notes

- Translate section by section
- Preserve technical terms (Kubernetes, Terraform, etc.)
- Generate new JSON export with translated content
- Option to keep original + translation side by side

---

## System Prompts Reference

### PDF Extraction Prompt

```typescript
// src/services/ai/prompts/pdfExtract.ts

export const PDF_EXTRACT_SYSTEM_PROMPT = `
You are a CV/Resume data extraction specialist.
Your task is to extract structured information from CV text and convert it to
a specific JSON schema.

RULES:
1. Extract ALL information present - be thorough
2. Use null or empty arrays for missing fields
3. Normalize dates to YYYY-MM or "Present" format
4. Keep original language for content, only structure the data
5. Infer reasonable categorizations (e.g., skill categories)
6. If uncertain about a field, include it with your best interpretation

FIELD GUIDELINES:
- fullName: The person's full name as displayed
- title: Their professional title/role
- email: Extract email address
- phone: Extract phone number, normalize format
- location: City, Country format
- summary: Professional summary/objective
- experience: Each job as separate entry with dates, company, role, description
- skills: Group into categories (Technical, Soft Skills, Languages)
- education: Degrees, institutions, dates
- certifications: Professional certifications with issuer
- languages: Spoken languages with proficiency

OUTPUT: Valid JSON only, no explanations.`
```

### Text Enhancement Prompts

```typescript
// src/services/ai/prompts/enhance.ts

export const ENHANCE_PROMPTS = {
  enhance: `You are a professional CV writer. Improve the following text to be
more impactful and clear while maintaining accuracy. Use strong action verbs,
be specific, and highlight achievements.

Rules:
- Keep the same general meaning
- Make it sound professional
- Use active voice
- Remove filler words
- Keep similar length

Respond with ONLY the improved text, no explanations.`,

  grammar: `You are a grammar expert. Fix any grammar, spelling, or punctuation
errors in the following text. Do not change the meaning or style, only correct
errors.

Respond with ONLY the corrected text, no explanations.`,

  shorter: `You are an editor specializing in concise writing. Shorten the
following text by approximately 30% while keeping all important information.
Remove redundancy and unnecessary words.

Respond with ONLY the shortened text, no explanations.`,

  expand: `You are a professional CV writer. Expand the following text with
more detail and context. Add specific examples, metrics, or clarifications
where appropriate. Increase length by approximately 50%.

Respond with ONLY the expanded text, no explanations.`,
}
```

### Job Match Prompt

```typescript
// src/services/ai/prompts/jobMatch.ts

export const JOB_MATCH_SYSTEM_PROMPT = `You are an expert career advisor and
ATS (Applicant Tracking System) specialist. Your task is to analyze how well
a CV matches a job description.

ANALYSIS APPROACH:
1. Identify key requirements from the job description
2. Find evidence in the CV that matches each requirement
3. Identify gaps - requirements not addressed in the CV
4. Provide actionable, specific recommendations

SCORING GUIDELINES:
- 90-100: Excellent Match - Exceeds most requirements
- 75-89: Strong Match - Meets most requirements with minor gaps
- 60-74: Good Match - Meets core requirements, some gaps
- 45-59: Partial Match - Meets some requirements, significant gaps
- 0-44: Weak Match - Major requirements not met

GAP PRIORITY:
- HIGH: Core requirement for the role, frequently mentioned
- MEDIUM: Important but not essential, mentioned once or twice
- LOW: Nice-to-have, implied rather than stated

Be specific with suggestions - tell exactly what to add and where.

OUTPUT: Valid JSON matching the schema provided.`
```

### Achievement Generator Prompt

```typescript
// src/services/ai/prompts/achievements.ts

export const ACHIEVEMENT_GENERATOR_PROMPT = `You are an expert CV writer
specializing in achievement-focused bullet points. Your task is to generate
impactful achievement statements for a work experience entry.

ACHIEVEMENT FORMULA:
[Action Verb] + [Specific Task/Project] + [Quantifiable Result/Impact]

GUIDELINES:
1. Start with strong action verbs (Led, Architected, Implemented, Delivered, Optimized, Reduced, Increased)
2. Include metrics where possible (%, $, time, team size, scale)
3. Focus on IMPACT not just activities
4. Be specific to the role and company context
5. Make each achievement unique and substantial

BAD EXAMPLE: "Worked on cloud infrastructure"
GOOD EXAMPLE: "Architected multi-region AWS infrastructure supporting 10M daily users with 99.99% uptime"

OUTPUT: Array of achievement objects with text, confidence score, and brief reasoning.`
```

---

## Free Tier Management

### Quota Tracking

```typescript
// src/services/ai/QuotaManager.ts

import { kv } from '@/lib/kv'

interface QuotaEntry {
  count: number
  resetAt: number // Unix timestamp
}

const DAILY_FREE_LIMIT = 50 // Requests per day
const QUOTA_KEY_PREFIX = 'ai_quota:'

export class QuotaManager {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  async checkQuota(): Promise<{
    remaining: number
    limit: number
    canProceed: boolean
    resetsAt: Date
  }> {
    const key = `${QUOTA_KEY_PREFIX}${this.userId}`
    const entry = await kv.get<QuotaEntry>(key)

    const now = Date.now()
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date(todayStart)
    todayEnd.setDate(todayEnd.getDate() + 1)

    // If no entry or reset time passed, quota is full
    if (!entry || entry.resetAt < now) {
      return {
        remaining: DAILY_FREE_LIMIT,
        limit: DAILY_FREE_LIMIT,
        canProceed: true,
        resetsAt: todayEnd,
      }
    }

    const remaining = Math.max(0, DAILY_FREE_LIMIT - entry.count)

    return {
      remaining,
      limit: DAILY_FREE_LIMIT,
      canProceed: remaining > 0,
      resetsAt: new Date(entry.resetAt),
    }
  }

  async incrementUsage(): Promise<void> {
    const key = `${QUOTA_KEY_PREFIX}${this.userId}`
    const entry = await kv.get<QuotaEntry>(key)

    const now = Date.now()
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    if (!entry || entry.resetAt < now) {
      // Start new quota period
      await kv.set(key, {
        count: 1,
        resetAt: tomorrow.getTime(),
      })
    } else {
      // Increment existing
      await kv.set(key, {
        count: entry.count + 1,
        resetAt: entry.resetAt,
      })
    }
  }
}
```

### Model Fallback Logic

```typescript
// src/services/ai/ModelSelector.ts

import { Model } from './AIProviderInterface'

interface ModelPriority {
  model: Model
  priority: number // Lower = higher priority
}

export class ModelSelector {
  private models: ModelPriority[] = []
  private failedModels: Set<string> = new Set()

  constructor(availableModels: Model[], userPaidModels?: string[]) {
    // Priority order:
    // 1. Free models (in order of capability)
    // 2. User's paid models (if configured)

    const freeModels = availableModels
      .filter(m => m.isFree)
      .map((m, i) => ({ model: m, priority: i }))

    const paidModels = userPaidModels
      ? availableModels
          .filter(m => userPaidModels.includes(m.id))
          .map((m, i) => ({ model: m, priority: 100 + i }))
      : []

    this.models = [...freeModels, ...paidModels].sort(
      (a, b) => a.priority - b.priority
    )
  }

  getNextModel(): Model | null {
    const available = this.models.find(m => !this.failedModels.has(m.model.id))
    return available?.model || null
  }

  markFailed(modelId: string): void {
    this.failedModels.add(modelId)
  }

  resetFailures(): void {
    this.failedModels.clear()
  }

  hasMoreModels(): boolean {
    return this.models.some(m => !this.failedModels.has(m.model.id))
  }
}
```

---

## UI Components

### Consistent Button Styling

```typescript
// AI action buttons use these variants

// Primary AI action (e.g., main enhance button)
<Button variant="default" size="sm">
  <Sparkles className="w-4 h-4 mr-2" />
  Enhance with AI
</Button>

// Secondary AI actions (e.g., grammar, shorter)
<Button variant="ghost" size="sm">
  <SpellCheck className="w-4 h-4 mr-1" />
  Grammar
</Button>

// Compact/icon-only for repeated items
<Button variant="ghost" size="icon" className="h-7 w-7">
  <Sparkles className="w-3 h-3" />
</Button>
```

### Loading States

```typescript
// src/components/admin/ai/AILoadingState.tsx

export function AILoadingState({ message = 'AI is thinking...' }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>{message}</span>
    </div>
  );
}

// Streaming response display
export function AIStreamingResponse({ content }: { content: string }) {
  return (
    <div className="p-3 bg-muted/50 rounded-lg">
      <p className="text-sm whitespace-pre-wrap">
        {content}
        <span className="animate-pulse">▊</span>
      </p>
    </div>
  );
}
```

### Suggestion Preview

```typescript
// Before/After comparison for text enhancement
export function AIComparisonView({
  original,
  suggested,
  onApply,
  onReject
}: {
  original: string;
  suggested: string;
  onApply: () => void;
  onReject: () => void;
}) {
  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">
            Original
          </h4>
          <p className="text-sm p-3 bg-muted/30 rounded">{original}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-primary mb-2">
            AI Suggestion
          </h4>
          <p className="text-sm p-3 bg-primary/5 border-l-2 border-primary rounded">
            {suggested}
          </p>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onReject}>
          Dismiss
        </Button>
        <Button size="sm" onClick={onApply}>
          Apply Changes
        </Button>
      </div>
    </div>
  );
}
```

---

## Error Handling

### Strategy: Toast + Cached Fallback

```typescript
// src/services/ai/AIService.ts (error handling portion)

export class AIService {
  private cache: Map<string, { result: any; timestamp: number }> = new Map()
  private CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  async enhanceText(text: string, options: EnhanceOptions): Promise<string> {
    const cacheKey = this.getCacheKey('enhance', text, options)

    try {
      const result = await this.provider.complete(text, {
        systemPrompt: ENHANCE_PROMPTS[options.action],
      })

      // Cache successful result
      this.cache.set(cacheKey, { result, timestamp: Date.now() })

      return result
    } catch (error) {
      // Try cached result first
      const cached = this.cache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        toast.warning('Using cached suggestion', {
          description: 'AI service temporarily unavailable',
        })
        return cached.result
      }

      // No cache, show error
      toast.error('AI Enhancement Failed', {
        description: this.getErrorMessage(error),
      })

      throw error
    }
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return 'Rate limit exceeded. Try again in a few minutes.'
      }
      if (error.message.includes('401') || error.message.includes('403')) {
        return 'API key issue. Check your OpenRouter configuration.'
      }
      return error.message
    }
    return 'Unknown error occurred'
  }
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// __tests__/services/ai/AIService.test.ts

describe('AIService', () => {
  describe('enhanceText', () => {
    it('should enhance text with correct prompt', async () => {
      const mockProvider = createMockProvider()
      const service = new AIService(mockProvider)

      await service.enhanceText('test text', { action: 'enhance' })

      expect(mockProvider.complete).toHaveBeenCalledWith(
        'test text',
        expect.objectContaining({
          systemPrompt: expect.stringContaining('CV writer'),
        })
      )
    })

    it('should return cached result on failure', async () => {
      // ... test cache fallback
    })
  })
})

describe('PDFExtractor', () => {
  it('should extract CV data from PDF text', async () => {
    const extractor = new PDFExtractor(mockAIService)
    const result = await extractor.extractFromPDF(samplePDFBuffer)

    expect(result.success).toBe(true)
    expect(result.data.personalInfo.fullName).toBeDefined()
  })

  it('should calculate confidence based on extracted fields', async () => {
    // ... test confidence calculation
  })
})
```

### Integration Tests

```typescript
// __tests__/integration/ai.test.ts

describe('AI Integration', () => {
  it('should complete full enhancement flow', async () => {
    // Mock OpenRouter API
    server.use(
      rest.post(
        'https://openrouter.ai/api/v1/chat/completions',
        (req, res, ctx) => {
          return res(
            ctx.json({
              choices: [{ message: { content: 'Enhanced text' } }],
            })
          )
        }
      )
    )

    const result = await aiService.enhanceText('original', {
      action: 'enhance',
    })
    expect(result).toBe('Enhanced text')
  })
})
```

### E2E Tests

```typescript
// e2e/ai-features.spec.ts

test('should enhance summary text', async ({ page }) => {
  await page.goto('/admin/personal-info')

  // Fill summary
  await page.fill('[data-testid="summary-textarea"]', 'I work with computers')

  // Click enhance
  await page.click('[data-testid="ai-enhance-button"]')

  // Wait for suggestion
  await page.waitForSelector('[data-testid="ai-suggestion"]')

  // Apply
  await page.click('[data-testid="apply-suggestion"]')

  // Verify updated
  const summary = await page.inputValue('[data-testid="summary-textarea"]')
  expect(summary).not.toBe('I work with computers')
})
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)

- [ ] AI Provider Interface
- [ ] OpenRouter Provider implementation
- [ ] Quota Manager
- [ ] Basic AIService facade

### Phase 2: Core Features (Week 2)

- [ ] Inline text enhancement (enhance, grammar, shorter, expand)
- [ ] AIActionBar component
- [ ] Integration with Personal Info (summary)
- [ ] Integration with Experience (description)

### Phase 3: Smart Features (Week 3)

- [ ] Achievement Generator
- [ ] Skills Suggester
- [ ] Integration with Experience modal
- [ ] Integration with Skills page

### Phase 4: PDF Import (Week 4)

- [ ] PDF text extraction
- [ ] CV data extraction with AI
- [ ] PDFImporter component
- [ ] Integration with Setup Wizard
- [ ] Integration with Admin Dashboard

### Phase 5: Job Analysis (Week 5)

- [ ] Job Match Analyzer
- [ ] Job analyzer page
- [ ] Multi-job comparison
- [ ] ATS score estimator

### Phase 6: Advanced Features (Week 6)

- [ ] Interview preparation
- [ ] Resume translation
- [ ] Dashboard AI Hub
- [ ] BYOK (Bring Your Own Key) support

---

## Environment Variables

```bash
# Required
OPENROUTER_API_KEY=sk-or-v1-xxxxx

# Optional
WORKERS_AI_ENABLED=true
SITE_URL=https://cv.arnoldcartagena.com

# Quota settings
AI_DAILY_FREE_LIMIT=50

# Feature flags
AI_FEATURES_ENABLED=true
AI_PDF_IMPORT_ENABLED=true
AI_JOB_MATCH_ENABLED=true
```

---

## References

- [Task 16 Implementation Plan](./task-16-implementation.md)
- [Task 17 Setup Wizard](./task-17-implementation.md) (to be created)
- [CV Schema Documentation](./cms-schema-documentation.md)
- [OpenRouter API Docs](https://openrouter.ai/docs)
- [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/)
