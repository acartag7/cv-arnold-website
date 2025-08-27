/**
 * Card Component Documentation
 */

'use client'

import React from 'react'
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardMedia,
  Typography,
  Button,
  Badge,
} from '@/components/ui'
import { ComponentShowcase } from '@/components/docs/ComponentShowcase'

const examples = [
  {
    title: 'Variants',
    description: 'Different card variants for various visual styles',
    code: `<Card variant="elevated">
  <CardBody>
    <Typography variant="h4">Elevated Card</Typography>
    <Typography variant="body1">Default card with shadow</Typography>
  </CardBody>
</Card>

<Card variant="outlined">
  <CardBody>
    <Typography variant="h4">Outlined Card</Typography>
    <Typography variant="body1">Card with visible border</Typography>
  </CardBody>
</Card>

<Card variant="ghost">
  <CardBody>
    <Typography variant="h4">Ghost Card</Typography>
    <Typography variant="body1">Minimal card appearance</Typography>
  </CardBody>
</Card>`,
    component: (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <Card variant="elevated">
          <CardBody>
            <Typography variant="h4">Elevated Card</Typography>
            <Typography variant="body1" className="text-semantic-text-muted">
              Default card with shadow
            </Typography>
          </CardBody>
        </Card>
        <Card variant="outlined">
          <CardBody>
            <Typography variant="h4">Outlined Card</Typography>
            <Typography variant="body1" className="text-semantic-text-muted">
              Card with visible border
            </Typography>
          </CardBody>
        </Card>
        <Card variant="ghost">
          <CardBody>
            <Typography variant="h4">Ghost Card</Typography>
            <Typography variant="body1" className="text-semantic-text-muted">
              Minimal card appearance
            </Typography>
          </CardBody>
        </Card>
      </div>
    ),
  },
  {
    title: 'Card Sections',
    description: 'Cards with header, body, and footer sections',
    code: `<Card variant="elevated">
  <CardHeader>
    <Typography variant="h3">Card Title</Typography>
    <Typography variant="body1" className="text-semantic-text-muted">
      Card subtitle or description
    </Typography>
  </CardHeader>
  
  <CardBody>
    <Typography variant="body1">
      Main content area of the card. This can contain any components or content.
    </Typography>
  </CardBody>
  
  <CardFooter>
    <Button variant="primary">Action</Button>
    <Button variant="ghost">Cancel</Button>
  </CardFooter>
</Card>`,
    component: (
      <div className="w-full max-w-md">
        <Card variant="elevated">
          <CardHeader>
            <Typography variant="h3">Card Title</Typography>
            <Typography variant="body1" className="text-semantic-text-muted">
              Card subtitle or description
            </Typography>
          </CardHeader>

          <CardBody>
            <Typography variant="body1">
              Main content area of the card. This can contain any components or
              content.
            </Typography>
          </CardBody>

          <CardFooter>
            <Button variant="primary">Action</Button>
            <Button variant="ghost">Cancel</Button>
          </CardFooter>
        </Card>
      </div>
    ),
  },
  {
    title: 'Interactive Cards',
    description: 'Cards that can be clicked or interacted with',
    code: `<Card variant="elevated" interactive hoverable>
  <CardBody>
    <Typography variant="h4">Clickable Card</Typography>
    <Typography variant="body1" className="text-semantic-text-muted">
      This card responds to hover and click interactions
    </Typography>
  </CardBody>
</Card>`,
    component: (
      <div className="w-full max-w-md">
        <Card variant="elevated" interactive hoverable>
          <CardBody>
            <Typography variant="h4">Clickable Card</Typography>
            <Typography variant="body1" className="text-semantic-text-muted">
              This card responds to hover and click interactions
            </Typography>
          </CardBody>
        </Card>
      </div>
    ),
  },
  {
    title: 'Sizes',
    description: 'Different card sizes following the design system',
    code: `<Card size="sm">
  <CardBody>
    <Typography variant="h5">Small Card</Typography>
  </CardBody>
</Card>

<Card size="md">
  <CardBody>
    <Typography variant="h4">Medium Card</Typography>
  </CardBody>
</Card>

<Card size="lg">
  <CardBody>
    <Typography variant="h3">Large Card</Typography>
  </CardBody>
</Card>`,
    component: (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <Card size="sm">
          <CardBody>
            <Typography variant="h5">Small Card</Typography>
          </CardBody>
        </Card>
        <Card size="md">
          <CardBody>
            <Typography variant="h4">Medium Card</Typography>
          </CardBody>
        </Card>
        <Card size="lg">
          <CardBody>
            <Typography variant="h3">Large Card</Typography>
          </CardBody>
        </Card>
      </div>
    ),
  },
  {
    title: 'With Media',
    description: 'Cards with media content using CardMedia component',
    code: `<Card variant="elevated">
  <CardMedia aspectRatio="video">
    <div className="w-full h-full bg-gradient-to-br from-primary-400 to-secondary-600 flex items-center justify-center">
      <Typography variant="h4" className="text-white">Image Placeholder</Typography>
    </div>
  </CardMedia>
  
  <CardBody>
    <Typography variant="h4">Card with Media</Typography>
    <Typography variant="body1" className="text-semantic-text-muted">
      Media content appears above the card content
    </Typography>
  </CardBody>
  
  <CardFooter>
    <Badge variant="primary">Featured</Badge>
  </CardFooter>
</Card>`,
    component: (
      <div className="w-full max-w-md">
        <Card variant="elevated">
          <CardMedia aspectRatio="video">
            <div className="w-full h-full bg-gradient-to-br from-primary-400 to-secondary-600 flex items-center justify-center">
              <Typography variant="h4" className="text-white">
                Image Placeholder
              </Typography>
            </div>
          </CardMedia>

          <CardBody>
            <Typography variant="h4">Card with Media</Typography>
            <Typography variant="body1" className="text-semantic-text-muted">
              Media content appears above the card content
            </Typography>
          </CardBody>

          <CardFooter>
            <Badge variant="primary">Featured</Badge>
          </CardFooter>
        </Card>
      </div>
    ),
  },
]

const props = [
  {
    name: 'variant',
    type: '"elevated" | "outlined" | "ghost"',
    default: '"elevated"',
    description: 'Visual style variant of the card',
  },
  {
    name: 'size',
    type: '"sm" | "md" | "lg"',
    default: '"md"',
    description: 'Size of the card affecting padding and minimum height',
  },
  {
    name: 'interactive',
    type: 'boolean',
    default: 'false',
    description: 'Whether the card is interactive (clickable)',
  },
  {
    name: 'hoverable',
    type: 'boolean',
    default: 'true',
    description: 'Whether the card shows hover effects',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Whether the card is disabled (affects interactive cards)',
  },
  {
    name: 'padding',
    type: '"none" | "sm" | "md" | "lg"',
    description: 'Override default padding from size configuration',
  },
  {
    name: 'as',
    type: 'ElementType',
    default: '"div"',
    description: 'HTML element or component to render as',
  },
  {
    name: 'children',
    type: 'React.ReactNode',
    description: 'Card content (typically CardHeader, CardBody, CardFooter)',
  },
]

const guidelines = [
  'Use elevated cards for primary content that needs to stand out from the background',
  'Outlined cards work well when you need clear boundaries without heavy shadows',
  'Ghost cards are perfect for subtle groupings or secondary content areas',
  'Always structure content using CardHeader, CardBody, and CardFooter for consistency',
  'Use interactive cards for clickable content like navigation items or expandable sections',
  'CardMedia should maintain aspect ratios for consistent layouts',
  'Consider responsive card layouts - full width on mobile, grid on desktop',
  'Keep card content focused and avoid cramming too much information into a single card',
]

export default function CardDocumentation() {
  return (
    <ComponentShowcase
      title="Card"
      description="Flexible card containers with hover effects, multiple variants, and content sections. Perfect for organizing related content with consistent spacing and visual hierarchy."
      category="Layout"
      status="ready"
      examples={examples}
      props={props}
      guidelines={guidelines}
    />
  )
}
