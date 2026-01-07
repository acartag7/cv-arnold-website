/**
 * Tests for CertificationsSection utility functions
 *
 * Tests the category detection and Kubestronaut certification detection logic.
 */

import { describe, it, expect } from 'vitest'
import { getCategoryInfo, isKubestronautCert } from '../CertificationsSection'
import { CertificationStatus, type Certification } from '@/types/cv'

// Helper to create a minimal certification object for testing
function createCert(
  name: string,
  issuer: string = 'Test Issuer'
): Certification {
  return {
    id: 'test-id',
    name,
    issuer,
    issueDate: '2024-01-01',
    expirationDate: null,
    status: CertificationStatus.ACTIVE,
    order: 0,
  }
}

describe('getCategoryInfo', () => {
  describe('Kubernetes certifications', () => {
    it('detects CKA certification', () => {
      const result = getCategoryInfo(
        createCert('CKA - Certified Kubernetes Administrator')
      )
      expect(result).toEqual({ category: 'Kubernetes', color: 'bg-blue-500' })
    })

    it('detects CKAD certification', () => {
      const result = getCategoryInfo(
        createCert('CKAD - Certified Kubernetes Application Developer')
      )
      expect(result).toEqual({ category: 'Kubernetes', color: 'bg-blue-500' })
    })

    it('detects CKS certification', () => {
      const result = getCategoryInfo(
        createCert('CKS - Certified Kubernetes Security Specialist')
      )
      expect(result).toEqual({ category: 'Kubernetes', color: 'bg-blue-500' })
    })

    it('detects KCNA certification', () => {
      const result = getCategoryInfo(
        createCert('KCNA - Kubernetes and Cloud Native Associate')
      )
      expect(result).toEqual({ category: 'Kubernetes', color: 'bg-blue-500' })
    })

    it('detects KCSA certification', () => {
      const result = getCategoryInfo(
        createCert('KCSA - Kubernetes and Cloud Native Security Associate')
      )
      expect(result).toEqual({ category: 'Kubernetes', color: 'bg-blue-500' })
    })

    it('detects generic Kubernetes certification', () => {
      const result = getCategoryInfo(createCert('Kubernetes Fundamentals'))
      expect(result).toEqual({ category: 'Kubernetes', color: 'bg-blue-500' })
    })
  })

  describe('Infrastructure certifications', () => {
    it('detects Terraform certification', () => {
      const result = getCategoryInfo(
        createCert('HashiCorp Certified: Terraform Associate')
      )
      expect(result).toEqual({
        category: 'Infrastructure',
        color: 'bg-green-500',
      })
    })

    it('detects Infrastructure certification', () => {
      const result = getCategoryInfo(
        createCert('Infrastructure as Code Fundamentals')
      )
      expect(result).toEqual({
        category: 'Infrastructure',
        color: 'bg-green-500',
      })
    })
  })

  describe('GitOps certifications', () => {
    it('detects GitOps certification', () => {
      const result = getCategoryInfo(createCert('GitOps Fundamentals'))
      expect(result).toEqual({ category: 'GitOps', color: 'bg-purple-500' })
    })

    it('detects Argo certification', () => {
      const result = getCategoryInfo(createCert('Argo CD Certified'))
      expect(result).toEqual({ category: 'GitOps', color: 'bg-purple-500' })
    })
  })

  describe('CI/CD certifications', () => {
    it('detects Jenkins certification', () => {
      const result = getCategoryInfo(createCert('Jenkins Certified Engineer'))
      expect(result).toEqual({ category: 'CI/CD', color: 'bg-orange-500' })
    })

    it('detects CI/CD certification', () => {
      const result = getCategoryInfo(createCert('CI/CD Pipeline Expert'))
      expect(result).toEqual({ category: 'CI/CD', color: 'bg-orange-500' })
    })
  })

  describe('Cloud certifications', () => {
    it('detects AWS certification by name', () => {
      const result = getCategoryInfo(createCert('AWS Solutions Architect'))
      expect(result).toEqual({ category: 'Cloud', color: 'bg-cyan-500' })
    })

    it('detects Azure certification by name', () => {
      const result = getCategoryInfo(createCert('Azure Administrator'))
      expect(result).toEqual({ category: 'Cloud', color: 'bg-cyan-500' })
    })

    it('detects GCP certification by name', () => {
      const result = getCategoryInfo(
        createCert('GCP Professional Cloud Architect')
      )
      expect(result).toEqual({ category: 'Cloud', color: 'bg-cyan-500' })
    })

    it('detects cloud certification by generic name', () => {
      const result = getCategoryInfo(createCert('Cloud Practitioner'))
      expect(result).toEqual({ category: 'Cloud', color: 'bg-cyan-500' })
    })

    it('detects Microsoft certification by issuer', () => {
      const result = getCategoryInfo(
        createCert('Professional Developer', 'Microsoft')
      )
      expect(result).toEqual({ category: 'Cloud', color: 'bg-cyan-500' })
    })

    it('detects Amazon certification by issuer', () => {
      const result = getCategoryInfo(
        createCert('Database Specialist', 'Amazon Web Services')
      )
      expect(result).toEqual({ category: 'Cloud', color: 'bg-cyan-500' })
    })

    it('detects Google certification by issuer', () => {
      const result = getCategoryInfo(
        createCert('Data Engineer', 'Google Cloud')
      )
      expect(result).toEqual({ category: 'Cloud', color: 'bg-cyan-500' })
    })
  })

  describe('Security certifications', () => {
    it('detects security certification', () => {
      const result = getCategoryInfo(
        createCert('Certified Security Professional')
      )
      expect(result).toEqual({ category: 'Security', color: 'bg-red-500' })
    })

    it('does not classify Kubernetes Security as Security category', () => {
      // CKS should be Kubernetes, not Security
      const result = getCategoryInfo(
        createCert('Kubernetes Security Specialist')
      )
      expect(result).toEqual({ category: 'Kubernetes', color: 'bg-blue-500' })
    })
  })

  describe('Other certifications', () => {
    it('defaults to Other for unknown certifications', () => {
      const result = getCategoryInfo(createCert('Random Certification'))
      expect(result).toEqual({ category: 'Other', color: 'bg-slate-500' })
    })

    it('defaults to Other for project management certifications', () => {
      const result = getCategoryInfo(
        createCert('PMP - Project Management Professional')
      )
      expect(result).toEqual({ category: 'Other', color: 'bg-slate-500' })
    })
  })

  describe('case insensitivity', () => {
    it('handles uppercase names', () => {
      const result = getCategoryInfo(createCert('TERRAFORM ASSOCIATE'))
      expect(result.category).toBe('Infrastructure')
    })

    it('handles mixed case names', () => {
      const result = getCategoryInfo(createCert('Kubernetes Administrator'))
      expect(result.category).toBe('Kubernetes')
    })

    it('handles lowercase issuer', () => {
      const result = getCategoryInfo(
        createCert('Some Cert', 'microsoft corporation')
      )
      expect(result.category).toBe('Cloud')
    })
  })
})

describe('isKubestronautCert', () => {
  describe('Kubestronaut certifications (5 required)', () => {
    it('identifies CKA as Kubestronaut cert', () => {
      expect(
        isKubestronautCert(
          createCert('CKA - Certified Kubernetes Administrator')
        )
      ).toBe(true)
    })

    it('identifies CKAD as Kubestronaut cert', () => {
      expect(isKubestronautCert(createCert('CKAD'))).toBe(true)
    })

    it('identifies CKS as Kubestronaut cert', () => {
      expect(isKubestronautCert(createCert('CKS'))).toBe(true)
    })

    it('identifies KCNA as Kubestronaut cert', () => {
      expect(isKubestronautCert(createCert('KCNA'))).toBe(true)
    })

    it('identifies KCSA as Kubestronaut cert', () => {
      expect(isKubestronautCert(createCert('KCSA'))).toBe(true)
    })
  })

  describe('non-Kubestronaut certifications', () => {
    it('returns false for generic Kubernetes cert', () => {
      expect(isKubestronautCert(createCert('Kubernetes Fundamentals'))).toBe(
        false
      )
    })

    it('returns false for AWS cert', () => {
      expect(isKubestronautCert(createCert('AWS Solutions Architect'))).toBe(
        false
      )
    })

    it('returns false for Terraform cert', () => {
      expect(isKubestronautCert(createCert('Terraform Associate'))).toBe(false)
    })
  })

  describe('case insensitivity', () => {
    it('handles lowercase names', () => {
      expect(isKubestronautCert(createCert('cka'))).toBe(true)
    })

    it('handles mixed case names', () => {
      expect(isKubestronautCert(createCert('Cka Certified'))).toBe(true)
    })
  })
})
