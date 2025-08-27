/**
 * Badge Component Documentation
 */

'use client'

import React from 'react'
import { Badge, Typography, Button, Card, CardBody } from '@/components/ui'
import { ComponentShowcase } from '@/components/docs/ComponentShowcase'

const examples = [
  {
    title: 'Variants',
    description:
      'Different badge variants for various status types and meanings',
    code: `<Badge variant="primary">Primary</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="neutral">Neutral</Badge>
<Badge variant="accent">Accent</Badge>`,
    component: (
      <div className="flex gap-3 flex-wrap">
        <Badge variant="primary">Primary</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="error">Error</Badge>
        <Badge variant="neutral">Neutral</Badge>
        <Badge variant="accent">Accent</Badge>
      </div>
    ),
  },
  {
    title: 'Sizes',
    description: 'Badge sizes following the 8px grid system',
    code: `<Badge size="sm" variant="primary">Small</Badge>
<Badge size="md" variant="primary">Medium</Badge>
<Badge size="lg" variant="primary">Large</Badge>`,
    component: (
      <div className="flex gap-3 items-center flex-wrap">
        <Badge size="sm" variant="primary">
          Small
        </Badge>
        <Badge size="md" variant="primary">
          Medium
        </Badge>
        <Badge size="lg" variant="primary">
          Large
        </Badge>
      </div>
    ),
  },
  {
    title: 'With Icons',
    description: 'Badges with icons in different positions',
    code: `<Badge variant="success" icon="✓" iconPosition="left">
  Completed
</Badge>
<Badge variant="warning" icon="⚠" iconPosition="right">
  Warning
</Badge>
<Badge variant="error" icon="✕">
  Error
</Badge>`,
    component: (
      <div className="flex gap-3 flex-wrap">
        <Badge variant="success" icon="✓" iconPosition="left">
          Completed
        </Badge>
        <Badge variant="warning" icon="⚠" iconPosition="right">
          Warning
        </Badge>
        <Badge variant="error" icon="✕">
          Error
        </Badge>
      </div>
    ),
  },
  {
    title: 'Interactive',
    description: 'Badges that can be clicked or interacted with',
    code: `<Badge variant="primary" interactive>
  Clickable Badge
</Badge>
<Badge variant="secondary" as="a" href="#" interactive>
  Link Badge
</Badge>
<Badge variant="neutral" as="button" interactive>
  Button Badge
</Badge>`,
    component: (
      <div className="flex gap-3 flex-wrap">
        <Badge variant="primary" interactive>
          Clickable Badge
        </Badge>
        <Badge variant="secondary" as="a" href="#" interactive>
          Link Badge
        </Badge>
        <Badge variant="neutral" as="button" interactive>
          Button Badge
        </Badge>
      </div>
    ),
  },
  {
    title: 'Rounded',
    description: 'Badges with fully rounded corners',
    code: `<Badge variant="primary" rounded>99+</Badge>
<Badge variant="success" rounded icon="✓" />
<Badge variant="error" rounded>!</Badge>`,
    component: (
      <div className="flex gap-3 items-center flex-wrap">
        <Badge variant="primary" rounded>
          99+
        </Badge>
        <Badge variant="success" rounded icon="✓" />
        <Badge variant="error" rounded>
          !
        </Badge>
      </div>
    ),
  },
  {
    title: 'In Context',
    description: 'Examples of badges used within other components',
    code: `<Card variant="outlined">
  <CardBody>
    <div className="flex items-center justify-between">
      <Typography variant="h4">Task Item</Typography>
      <Badge variant="success">Completed</Badge>
    </div>
    <Typography variant="body" className="text-semantic-text-muted mt-2">
      This is a sample task with a status badge
    </Typography>
  </CardBody>
</Card>

<Button variant="ghost">
  Notifications <Badge variant="error" size="sm">3</Badge>
</Button>`,
    component: (
      <div className="space-y-4 w-full max-w-md">
        <Card variant="outlined">
          <CardBody>
            <div className="flex items-center justify-between">
              <Typography variant="h4">Task Item</Typography>
              <Badge variant="success">Completed</Badge>
            </div>
            <Typography
              variant="body1"
              className="text-semantic-text-muted mt-2"
            >
              This is a sample task with a status badge
            </Typography>
          </CardBody>
        </Card>

        <div className="flex justify-center">
          <Button variant="ghost" className="relative">
            Notifications
            <Badge variant="error" size="sm" className="ml-2">
              3
            </Badge>
          </Button>
        </div>
      </div>
    ),
  },
]

const props = [
  {
    name: 'variant',
    type: '"primary" | "secondary" | "success" | "warning" | "error" | "neutral" | "accent"',
    default: '"neutral"',
    description: 'Visual style variant determining color scheme',
  },
  {
    name: 'size',
    type: '"sm" | "md" | "lg"',
    default: '"md"',
    description: 'Size of the badge following 8px grid system',
  },
  {
    name: 'interactive',
    type: 'boolean',
    default: 'false',
    description: 'Whether the badge is interactive (clickable)',
  },
  {
    name: 'rounded',
    type: 'boolean',
    default: 'false',
    description: 'Whether to use fully rounded corners (pill shape)',
  },
  {
    name: 'icon',
    type: 'React.ReactNode',
    description: 'Icon to display in the badge',
  },
  {
    name: 'iconPosition',
    type: '"left" | "right"',
    default: '"left"',
    description: 'Position of the icon relative to text',
  },
  {
    name: 'as',
    type: 'ElementType',
    default: '"span"',
    description: 'HTML element or component to render as',
  },
  {
    name: 'children',
    type: 'React.ReactNode',
    description: 'Badge content (text, numbers, etc.)',
  },
]

const guidelines = [
  'Use success badges for positive status like completed, active, or approved',
  'Warning badges indicate attention needed but not critical issues',
  'Error badges should be reserved for critical issues, failures, or destructive actions',
  'Primary and secondary badges work well for general categorization and labels',
  'Neutral badges are perfect for non-status information like categories or counts',
  'Keep badge text concise - prefer short words or numbers over long descriptions',
  'Use rounded badges for numeric indicators like notification counts',
  'Interactive badges should have clear hover states and proper focus management',
  'Consider badge placement carefully - they should complement, not overwhelm the content',
]

export default function BadgeDocumentation() {
  return (
    <ComponentShowcase
      title="Badge"
      description="Status indicators and labels with multiple color variants and sizes. Perfect for showing status, categories, counts, and other metadata."
      category="Display"
      status="ready"
      examples={examples}
      props={props}
      guidelines={guidelines}
    />
  )
}
