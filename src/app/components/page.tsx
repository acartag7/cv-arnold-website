/**
 * Component Documentation System - Main Index
 * Comprehensive showcase of design system components
 */

'use client'

import React from 'react'
import Link from 'next/link'
import {
  Typography,
  Container,
  Section,
  Grid,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Button,
} from '@/components/ui'

interface ComponentInfo {
  name: string
  description: string
  path: string
  status: 'ready' | 'beta' | 'deprecated'
  category: string
  complexity: 'simple' | 'medium' | 'complex'
}

const components: ComponentInfo[] = [
  {
    name: 'Button',
    description: 'Interactive buttons with multiple variants and states',
    path: '/components/button',
    status: 'ready',
    category: 'Interactive',
    complexity: 'medium',
  },
  {
    name: 'Typography',
    description: 'Text components with fluid scaling and semantic variants',
    path: '/components/typography',
    status: 'ready',
    category: 'Content',
    complexity: 'simple',
  },
  {
    name: 'Card',
    description: 'Flexible containers with hover effects and content sections',
    path: '/components/card',
    status: 'ready',
    category: 'Layout',
    complexity: 'medium',
  },
  {
    name: 'Badge',
    description: 'Status indicators and tags with color variants',
    path: '/components/badge',
    status: 'ready',
    category: 'Display',
    complexity: 'simple',
  },
  {
    name: 'Grid',
    description: 'Responsive grid system with 8px alignment',
    path: '/components/grid',
    status: 'ready',
    category: 'Layout',
    complexity: 'medium',
  },
  {
    name: 'Container',
    description: 'Responsive containers with max-width constraints',
    path: '/components/container',
    status: 'ready',
    category: 'Layout',
    complexity: 'simple',
  },
]

const categories = Array.from(new Set(components.map(c => c.category)))

const getStatusVariant = (status: ComponentInfo['status']) => {
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

const getComplexityVariant = (complexity: ComponentInfo['complexity']) => {
  switch (complexity) {
    case 'simple':
      return 'success'
    case 'medium':
      return 'warning'
    case 'complex':
      return 'error'
    default:
      return 'neutral'
  }
}

export default function ComponentsPage() {
  return (
    <main>
      <Container>
        <Section className="py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <Typography variant="h1" className="mb-4">
              Design System Components
            </Typography>
            <Typography
              variant="body1"
              className="text-semantic-text-muted max-w-2xl mx-auto"
            >
              Comprehensive documentation and examples for all design system
              components. Each component includes usage guidelines, prop
              documentation, and interactive examples.
            </Typography>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
            <Card variant="outlined" className="text-center p-6">
              <Typography variant="h3" className="text-semantic-primary mb-2">
                {components.length}
              </Typography>
              <Typography
                variant="caption"
                className="text-semantic-text-muted"
              >
                Total Components
              </Typography>
            </Card>
            <Card variant="outlined" className="text-center p-6">
              <Typography variant="h3" className="text-semantic-primary mb-2">
                {categories.length}
              </Typography>
              <Typography
                variant="caption"
                className="text-semantic-text-muted"
              >
                Categories
              </Typography>
            </Card>
            <Card variant="outlined" className="text-center p-6">
              <Typography variant="h3" className="text-semantic-success mb-2">
                {components.filter(c => c.status === 'ready').length}
              </Typography>
              <Typography
                variant="caption"
                className="text-semantic-text-muted"
              >
                Ready Components
              </Typography>
            </Card>
            <Card variant="outlined" className="text-center p-6">
              <Typography variant="h3" className="text-semantic-warning mb-2">
                {components.filter(c => c.status === 'beta').length}
              </Typography>
              <Typography
                variant="caption"
                className="text-semantic-text-muted"
              >
                Beta Components
              </Typography>
            </Card>
          </div>

          {/* Components by Category */}
          {categories.map(category => (
            <div key={category} className="mb-12">
              <Typography variant="h2" className="mb-6">
                {category} Components
              </Typography>

              <Grid cols={1} mdCols={2} lgCols={3} gap={6}>
                {components
                  .filter(component => component.category === category)
                  .map(component => (
                    <Link key={component.name} href={component.path}>
                      <Card
                        variant="elevated"
                        hoverable
                        interactive
                        className="h-full transition-all duration-200 hover:scale-[1.02]"
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <Typography variant="h4" className="mb-2">
                              {component.name}
                            </Typography>
                            <div className="flex gap-2">
                              <Badge
                                variant={getStatusVariant(component.status)}
                                size="sm"
                              >
                                {component.status}
                              </Badge>
                              <Badge
                                variant={getComplexityVariant(
                                  component.complexity
                                )}
                                size="sm"
                              >
                                {component.complexity}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>

                        <CardBody>
                          <Typography
                            variant="body1"
                            className="text-semantic-text-muted"
                          >
                            {component.description}
                          </Typography>
                        </CardBody>
                      </Card>
                    </Link>
                  ))}
              </Grid>
            </div>
          ))}

          {/* Getting Started */}
          <Card variant="outlined" className="mt-12 p-8">
            <Typography variant="h3" className="mb-4">
              Getting Started
            </Typography>
            <Typography
              variant="body1"
              className="mb-6 text-semantic-text-muted"
            >
              All components are built with TypeScript, accessibility in mind,
              and follow our design token system. Each component page includes:
            </Typography>

            <Grid cols={1} mdCols={2} gap={6}>
              <div>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Badge variant="primary" size="sm">
                      ✓
                    </Badge>
                    <Typography variant="body1">
                      Live interactive examples
                    </Typography>
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge variant="primary" size="sm">
                      ✓
                    </Badge>
                    <Typography variant="body1">
                      Complete props documentation
                    </Typography>
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge variant="primary" size="sm">
                      ✓
                    </Badge>
                    <Typography variant="body1">
                      Copy-ready code snippets
                    </Typography>
                  </li>
                </ul>
              </div>
              <div>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Badge variant="secondary" size="sm">
                      ✓
                    </Badge>
                    <Typography variant="body1">
                      Usage guidelines and best practices
                    </Typography>
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge variant="secondary" size="sm">
                      ✓
                    </Badge>
                    <Typography variant="body1">
                      Theme and variant demonstrations
                    </Typography>
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge variant="secondary" size="sm">
                      ✓
                    </Badge>
                    <Typography variant="body1">
                      Responsive behavior examples
                    </Typography>
                  </li>
                </ul>
              </div>
            </Grid>

            <div className="mt-6 pt-6 border-t border-semantic-border-subtle">
              <Button variant="primary" size="lg">
                View All Components
              </Button>
              <Button variant="ghost" size="lg" className="ml-4">
                Design Tokens
              </Button>
            </div>
          </Card>
        </Section>
      </Container>
    </main>
  )
}
