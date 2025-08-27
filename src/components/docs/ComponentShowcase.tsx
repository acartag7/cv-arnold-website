/**
 * Component Documentation Showcase
 * Reusable component for displaying component examples and documentation
 */

'use client'

import React, { useState } from 'react'
import {
  Typography,
  Container,
  Section,
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
  Stack,
} from '@/components/ui'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

interface PropDoc {
  name: string
  type: string
  default?: string
  description: string
  required?: boolean
}

interface ExampleConfig {
  title: string
  description?: string
  code: string
  component: React.ReactNode
}

interface ComponentShowcaseProps {
  title: string
  description: string
  props: PropDoc[]
  examples: ExampleConfig[]
  guidelines?: string[]
  category: string
  status: 'ready' | 'beta' | 'deprecated'
}

export function ComponentShowcase({
  title,
  description,
  props,
  examples,
  guidelines = [],
  category,
  status,
}: ComponentShowcaseProps) {
  const [activeExample, setActiveExample] = useState(0)
  const [showCode, setShowCode] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ready':
        return 'success'
      case 'beta':
        return 'warning'
      case 'deprecated':
        return 'error'
      default:
        return 'neutral'
    }
  }

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  return (
    <main>
      <Container>
        <Section className="py-12">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <Typography variant="h1">{title}</Typography>
              <Badge variant={getStatusVariant(status)} size="lg">
                {status}
              </Badge>
              <Badge variant="neutral" size="lg">
                {category}
              </Badge>
            </div>
            <Typography
              variant="body1"
              className="text-semantic-text-muted max-w-3xl"
            >
              {description}
            </Typography>
          </div>

          {/* Live Examples */}
          <Card variant="elevated" className="mb-12">
            <CardHeader>
              <Typography variant="h3">Examples</Typography>
              <div className="flex gap-2 mt-4">
                {examples.map((example, index) => (
                  <Button
                    key={index}
                    variant={activeExample === index ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveExample(index)}
                  >
                    {example.title}
                  </Button>
                ))}
              </div>
            </CardHeader>

            <CardBody>
              {examples[activeExample] && (
                <div>
                  {examples[activeExample].description && (
                    <Typography
                      variant="body1"
                      className="mb-6 text-semantic-text-muted"
                    >
                      {examples[activeExample].description}
                    </Typography>
                  )}

                  {/* Component Preview */}
                  <div className="border border-semantic-border rounded-lg p-8 mb-6 bg-semantic-surface">
                    <div className="flex items-center justify-center min-h-32">
                      <ErrorBoundary
                        fallback={
                          <div className="text-center text-red-600">
                            <Typography variant="body2">
                              Example failed to render
                            </Typography>
                          </div>
                        }
                        showError={process.env.NODE_ENV === 'development'}
                      >
                        {examples[activeExample].component}
                      </ErrorBoundary>
                    </div>
                  </div>

                  {/* Code Toggle */}
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      variant="ghost"
                      onClick={() => setShowCode(!showCode)}
                    >
                      {showCode ? 'Hide Code' : 'Show Code'}
                    </Button>

                    {showCode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyCode(examples[activeExample]?.code || '')
                        }
                      >
                        {copiedCode ? 'Copied!' : 'Copy Code'}
                      </Button>
                    )}
                  </div>

                  {/* Code Display */}
                  {showCode && (
                    <Card
                      variant="outlined"
                      className="bg-semantic-surface-subtle"
                    >
                      <CardBody>
                        <pre className="text-sm overflow-x-auto">
                          <code className="text-semantic-text">
                            {examples[activeExample]?.code || ''}
                          </code>
                        </pre>
                      </CardBody>
                    </Card>
                  )}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Props Documentation */}
          <Card variant="elevated" className="mb-12">
            <CardHeader>
              <Typography variant="h3">Props</Typography>
            </CardHeader>
            <CardBody>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-semantic-border">
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-left py-3 px-4">Default</th>
                      <th className="text-left py-3 px-4">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {props.map((prop, index) => (
                      <tr
                        key={prop.name}
                        className={
                          index % 2 === 0 ? 'bg-semantic-surface-subtle' : ''
                        }
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono text-semantic-primary">
                              {prop.name}
                            </code>
                            {prop.required && (
                              <Badge variant="error" size="sm">
                                required
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <code className="text-sm font-mono text-semantic-text-muted">
                            {prop.type}
                          </code>
                        </td>
                        <td className="py-3 px-4">
                          {prop.default ? (
                            <code className="text-sm font-mono text-semantic-secondary">
                              {prop.default}
                            </code>
                          ) : (
                            <span className="text-semantic-text-disabled">
                              —
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Typography
                            variant="body1"
                            className="text-semantic-text-muted"
                          >
                            {prop.description}
                          </Typography>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>

          {/* Usage Guidelines */}
          {guidelines.length > 0 && (
            <Card variant="elevated">
              <CardHeader>
                <Typography variant="h3">Usage Guidelines</Typography>
              </CardHeader>
              <CardBody>
                <Stack gap={4}>
                  {guidelines.map((guideline, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Badge variant="primary" size="sm" className="mt-1">
                        {index + 1}
                      </Badge>
                      <Typography variant="body1">{guideline}</Typography>
                    </div>
                  ))}
                </Stack>
              </CardBody>
            </Card>
          )}
        </Section>
      </Container>
    </main>
  )
}
