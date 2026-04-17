import type {
  CVData,
  Experience,
  SkillCategory,
  Education,
  Certification,
  Achievement,
  Language,
} from '@/types/cv'
import { CertificationStatus } from '@/types/cv'

function formatDate(iso: string | null | undefined): string {
  if (!iso) return 'Present'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
}

function dateRange(start: string, end: string | null): string {
  return `${formatDate(start)} – ${formatDate(end)}`
}

function byOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order)
}

function renderExperience(exp: Experience): string {
  const location = exp.location.remote
    ? 'Remote'
    : [exp.location.city, exp.location.country].filter(Boolean).join(', ')
  const lines: string[] = []
  lines.push(`### ${exp.position} — ${exp.company}`)
  lines.push(
    `${dateRange(exp.startDate, exp.endDate)}${location ? ` · ${location}` : ''}`
  )
  lines.push('')
  if (exp.description) {
    lines.push(exp.description.trim())
    lines.push('')
  }
  if (exp.achievements.length > 0) {
    lines.push('**Achievements:**')
    for (const a of exp.achievements) lines.push(`- ${a}`)
    lines.push('')
  }
  if (exp.technologies.length > 0) {
    lines.push(`**Technologies:** ${exp.technologies.join(', ')}`)
    lines.push('')
  }
  return lines.join('\n')
}

function renderSkills(categories: SkillCategory[]): string {
  const lines: string[] = []
  for (const cat of byOrder(categories)) {
    lines.push(`### ${cat.name}`)
    if (cat.description) lines.push(cat.description)
    const names = cat.skills.map(s => {
      const yrs = s.yearsOfExperience ? ` (${s.yearsOfExperience}y)` : ''
      return `${s.name}${yrs}`
    })
    lines.push(names.join(', '))
    lines.push('')
  }
  return lines.join('\n')
}

function renderEducation(edu: Education): string {
  const loc = edu.location
    ? ` · ${edu.location.city}, ${edu.location.country}`
    : ''
  const lines = [
    `### ${edu.degree}${edu.field ? ` in ${edu.field}` : ''} — ${edu.institution}`,
    `${dateRange(edu.startDate, edu.endDate)}${loc}`,
  ]
  if (edu.grade) lines.push(`Grade: ${edu.grade}`)
  if (edu.description) {
    lines.push('')
    lines.push(edu.description.trim())
  }
  if (edu.highlights && edu.highlights.length > 0) {
    lines.push('')
    for (const h of edu.highlights) lines.push(`- ${h}`)
  }
  lines.push('')
  return lines.join('\n')
}

function renderCertification(cert: Certification): string {
  const status =
    cert.status === CertificationStatus.ACTIVE ? '' : ` [${cert.status}]`
  const expiry = cert.expirationDate
    ? ` (expires ${formatDate(cert.expirationDate)})`
    : ''
  const id = cert.credentialId ? ` · ID ${cert.credentialId}` : ''
  return `- **${cert.name}** — ${cert.issuer}${status}, issued ${formatDate(cert.issueDate)}${expiry}${id}`
}

function renderAchievement(a: Achievement): string {
  const lines: string[] = []
  const issuer = a.issuer ? ` — ${a.issuer}` : ''
  lines.push(`### ${a.title}${issuer}`)
  lines.push(`${formatDate(a.date)} · ${a.category}`)
  if (a.description) {
    lines.push('')
    lines.push(a.description.trim())
  }
  if (a.url) {
    lines.push('')
    lines.push(`Link: ${a.url}`)
  }
  lines.push('')
  return lines.join('\n')
}

function renderLanguage(lang: Language): string {
  const native = lang.native ? ' (native)' : ''
  return `- **${lang.name}** — ${lang.proficiency.toUpperCase()}${native}`
}

export function renderCVAsMarkdown(cv: CVData): string {
  const p = cv.personalInfo
  const out: string[] = []

  out.push(`# ${p.fullName}`)
  out.push('')
  out.push(`> ${p.title}`)
  out.push('')
  out.push(`Location: ${p.location.city}, ${p.location.country}`)
  if (p.email) out.push(`Email: ${p.email}`)
  if (p.website) out.push(`Website: ${p.website}`)
  if (p.social.github) out.push(`GitHub: ${p.social.github}`)
  if (p.social.linkedin) out.push(`LinkedIn: ${p.social.linkedin}`)
  if (p.social.twitter) out.push(`X/Twitter: ${p.social.twitter}`)
  out.push('')
  out.push(
    `Availability: ${p.availability.status.replace(/_/g, ' ')}${p.availability.message ? ` — ${p.availability.message}` : ''}`
  )
  out.push('')
  out.push(`CV last updated: ${formatDate(cv.lastUpdated)}`)
  out.push('')

  if (p.summary) {
    out.push('## Summary')
    out.push('')
    out.push(p.summary.trim())
    out.push('')
  }

  if (cv.experience.length > 0) {
    out.push('## Experience')
    out.push('')
    for (const exp of byOrder(cv.experience)) {
      out.push(renderExperience(exp))
    }
  }

  if (cv.skills.length > 0) {
    out.push('## Skills')
    out.push('')
    out.push(renderSkills(cv.skills))
  }

  if (cv.certifications.length > 0) {
    out.push('## Certifications')
    out.push('')
    for (const c of byOrder(cv.certifications)) {
      out.push(renderCertification(c))
    }
    out.push('')
  }

  if (cv.education.length > 0) {
    out.push('## Education')
    out.push('')
    for (const e of byOrder(cv.education)) {
      out.push(renderEducation(e))
    }
  }

  if (cv.achievements.length > 0) {
    out.push('## Achievements')
    out.push('')
    for (const a of byOrder(cv.achievements)) {
      out.push(renderAchievement(a))
    }
  }

  if (cv.languages.length > 0) {
    out.push('## Languages')
    out.push('')
    for (const l of cv.languages) out.push(renderLanguage(l))
    out.push('')
  }

  return (
    out
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trimEnd() + '\n'
  )
}
