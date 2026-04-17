import { describe, it, expect } from 'vitest'
import { renderCVAsMarkdown } from '../render-cv-markdown'
import {
  SkillLevel,
  EmploymentType,
  CertificationStatus,
  AchievementCategory,
  LanguageProficiency,
  type CVData,
} from '@/types/cv'

function makeCV(overrides: Partial<CVData> = {}): CVData {
  return {
    version: '1.0.0',
    lastUpdated: '2026-04-17T00:00:00.000Z',
    personalInfo: {
      fullName: 'Arnold Cartagena',
      title: 'Senior Platform Engineer',
      email: 'arnold@example.com',
      location: { city: 'Bern', country: 'Switzerland', countryCode: 'CH' },
      website: 'https://example.com',
      social: {
        linkedin: 'https://linkedin.com/in/arnold',
        github: 'https://github.com/arnold',
      },
      summary: 'Building platforms and AI agents.',
      availability: {
        status: 'open_to_opportunities',
        message: 'Open to interesting work',
      },
    },
    experience: [
      {
        id: 'e1',
        company: 'Swiss Post',
        position: 'Tech Lead',
        type: EmploymentType.FULL_TIME,
        startDate: '2023-05-01',
        endDate: null,
        location: { city: 'Bern', country: 'Switzerland', remote: false },
        description: 'Led Kafka platform.',
        achievements: ['Shipped AI agent platform'],
        technologies: ['Kafka', 'AWS Bedrock'],
        order: 1,
      },
    ],
    skills: [
      {
        id: 's1',
        name: 'Cloud',
        description: 'Multi-cloud providers',
        skills: [
          { name: 'AWS', level: SkillLevel.EXPERT, yearsOfExperience: 6 },
          { name: 'GCP', level: SkillLevel.ADVANCED },
        ],
        order: 1,
      },
    ],
    education: [
      {
        id: 'edu1',
        institution: 'The Open University',
        degree: 'B.Sc.',
        field: 'Cybersecurity',
        startDate: '2019-09-01',
        endDate: null,
        order: 1,
      },
    ],
    certifications: [
      {
        id: 'c1',
        name: 'CKS',
        issuer: 'The Linux Foundation',
        issueDate: '2024-01-15',
        expirationDate: '2027-01-15',
        status: CertificationStatus.ACTIVE,
        credentialId: 'ABC-123',
        order: 1,
      },
    ],
    achievements: [
      {
        id: 'a1',
        title: 'Mind the GAP',
        category: AchievementCategory.PUBLICATION,
        date: '2026-02-18',
        issuer: 'arXiv',
        description: 'Paper on tool-call safety.',
        url: 'https://arxiv.org/abs/2602.16943',
        order: 1,
      },
    ],
    languages: [
      {
        name: 'Spanish',
        code: 'es',
        proficiency: LanguageProficiency.NATIVE,
        native: true,
      },
      { name: 'German', code: 'de', proficiency: LanguageProficiency.A2 },
    ],
    ...overrides,
  } as CVData
}

describe('renderCVAsMarkdown', () => {
  it('renders a full CV with all sections', () => {
    const md = renderCVAsMarkdown(makeCV())
    expect(md).toMatch(/^# Arnold Cartagena/)
    expect(md).toContain('> Senior Platform Engineer')
    expect(md).toContain('Location: Bern, Switzerland')
    expect(md).toContain('Email: arnold@example.com')
    expect(md).toContain('Website: https://example.com')
    expect(md).toContain('GitHub: https://github.com/arnold')
    expect(md).toContain('LinkedIn: https://linkedin.com/in/arnold')
    expect(md).toContain(
      'Availability: open to opportunities — Open to interesting work'
    )
    expect(md).toContain('CV last updated: Apr 2026')
    expect(md).toContain('## Summary')
    expect(md).toContain('Building platforms and AI agents.')
    expect(md).toContain('## Experience')
    expect(md).toContain('### Tech Lead — Swiss Post')
    expect(md).toContain('– Present')
    expect(md).toContain('Bern, Switzerland')
    expect(md).toContain('**Achievements:**')
    expect(md).toContain('- Shipped AI agent platform')
    expect(md).toContain('**Technologies:** Kafka, AWS Bedrock')
    expect(md).toContain('## Skills')
    expect(md).toContain('### Cloud')
    expect(md).toContain('Multi-cloud providers')
    expect(md).toContain('AWS (6y), GCP')
    expect(md).toContain('## Certifications')
    expect(md).toContain('**CKS** — The Linux Foundation')
    expect(md).toContain('expires')
    expect(md).toContain('ID ABC-123')
    expect(md).toContain('## Education')
    expect(md).toContain('### B.Sc. in Cybersecurity — The Open University')
    expect(md).toContain('## Achievements')
    expect(md).toContain('### Mind the GAP — arXiv')
    expect(md).toContain('Link: https://arxiv.org/abs/2602.16943')
    expect(md).toContain('## Languages')
    expect(md).toContain('**Spanish** — NATIVE (native)')
    expect(md).toContain('**German** — A2')
    expect(md.endsWith('\n')).toBe(true)
    expect(md).not.toMatch(/\n{3,}/)
  })

  it('handles remote work location', () => {
    const md = renderCVAsMarkdown(
      makeCV({
        experience: [
          {
            id: 'e1',
            company: 'VMware',
            position: 'MTS',
            type: EmploymentType.FULL_TIME,
            startDate: '2022-03-01',
            endDate: '2023-05-01',
            location: { remote: true },
            description: '',
            achievements: [],
            technologies: [],
            order: 1,
          },
        ],
      })
    )
    expect(md).toContain('· Remote')
    expect(md).not.toContain('**Achievements:**')
    expect(md).not.toContain('**Technologies:**')
  })

  it('includes twitter when present and includes expired cert status', () => {
    const md = renderCVAsMarkdown(
      makeCV({
        personalInfo: {
          ...makeCV().personalInfo,
          social: {
            linkedin: 'https://linkedin.com/in/arnold',
            github: 'https://github.com/arnold',
            twitter: 'https://twitter.com/arnold',
          },
        },
        certifications: [
          {
            id: 'c1',
            name: 'OldCert',
            issuer: 'SomeOrg',
            issueDate: '2020-01-01',
            expirationDate: null,
            status: CertificationStatus.EXPIRED,
            order: 1,
          },
        ],
      })
    )
    expect(md).toContain('X/Twitter: https://twitter.com/arnold')
    expect(md).toContain('[expired]')
    expect(md).not.toContain('expires')
    expect(md).not.toMatch(/ID /)
  })

  it('renders education with grade, description, highlights, and location', () => {
    const md = renderCVAsMarkdown(
      makeCV({
        education: [
          {
            id: 'edu1',
            institution: 'MIT',
            degree: 'M.Sc.',
            field: 'CS',
            startDate: '2015-09-01',
            endDate: '2017-06-01',
            grade: '4.0',
            location: { city: 'Cambridge', country: 'USA' },
            description: 'Thesis on agents.',
            highlights: ['Published paper', 'TA for ML course'],
            order: 1,
          },
        ],
      })
    )
    expect(md).toContain('### M.Sc. in CS — MIT')
    expect(md).toContain('· Cambridge, USA')
    expect(md).toContain('Grade: 4.0')
    expect(md).toContain('Thesis on agents.')
    expect(md).toContain('- Published paper')
    expect(md).toContain('- TA for ML course')
  })

  it('formats invalid dates as-is and omits optional sections when empty', () => {
    const md = renderCVAsMarkdown(
      makeCV({
        lastUpdated: 'not-a-date',
        personalInfo: {
          ...makeCV().personalInfo,
          website: undefined as unknown as string,
          summary: '',
          availability: { status: 'available' },
        },
        experience: [],
        skills: [],
        education: [],
        certifications: [],
        achievements: [],
        languages: [],
      })
    )
    expect(md).toContain('CV last updated: not-a-date')
    expect(md).toContain('Availability: available')
    expect(md).not.toContain('## Summary')
    expect(md).not.toContain('## Experience')
    expect(md).not.toContain('## Skills')
    expect(md).not.toContain('## Education')
    expect(md).not.toContain('## Certifications')
    expect(md).not.toContain('## Achievements')
    expect(md).not.toContain('## Languages')
    expect(md).not.toContain('Website:')
  })

  it('sorts items by order ascending', () => {
    const md = renderCVAsMarkdown(
      makeCV({
        experience: [
          {
            id: 'e1',
            company: 'B Corp',
            position: 'Role B',
            type: EmploymentType.FULL_TIME,
            startDate: '2020-01-01',
            endDate: null,
            location: { remote: true },
            description: '',
            achievements: [],
            technologies: [],
            order: 2,
          },
          {
            id: 'e2',
            company: 'A Corp',
            position: 'Role A',
            type: EmploymentType.FULL_TIME,
            startDate: '2022-01-01',
            endDate: null,
            location: { remote: true },
            description: '',
            achievements: [],
            technologies: [],
            order: 1,
          },
        ],
      })
    )
    const posA = md.indexOf('Role A — A Corp')
    const posB = md.indexOf('Role B — B Corp')
    expect(posA).toBeGreaterThan(-1)
    expect(posB).toBeGreaterThan(posA)
  })

  it('renders achievement without optional fields', () => {
    const md = renderCVAsMarkdown(
      makeCV({
        achievements: [
          {
            id: 'a1',
            title: 'Award',
            category: AchievementCategory.AWARD,
            date: '2024-06-01',
            description: '',
            order: 1,
          },
        ],
      })
    )
    expect(md).toContain('### Award\n')
    expect(md).not.toContain('Link:')
  })
})
