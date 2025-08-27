/**
 * Button Component Documentation
 */

'use client'

import React from 'react'
import { Button, IconButton } from '@/components/ui'
import { ComponentShowcase } from '@/components/docs/ComponentShowcase'

const examples = [
  {
    title: 'Variants',
    description: 'Different button variants for various use cases',
    code: `<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>`,
    component: (
      <div className="flex gap-4 flex-wrap">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
      </div>
    ),
  },
  {
    title: 'Sizes',
    description: 'Button sizes following the 8px grid system',
    code: `<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>`,
    component: (
      <div className="flex gap-4 items-center flex-wrap">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
    ),
  },
  {
    title: 'States',
    description: 'Different button states and interactions',
    code: `<Button>Normal</Button>
<Button loading>Loading</Button>
<Button disabled>Disabled</Button>`,
    component: (
      <div className="flex gap-4 flex-wrap">
        <Button>Normal</Button>
        <Button loading>Loading</Button>
        <Button disabled>Disabled</Button>
      </div>
    ),
  },
  {
    title: 'With Icons',
    description: 'Buttons with icons in different positions',
    code: `<Button icon="→" iconPosition="left">Next</Button>
<Button icon="←" iconPosition="right">Back</Button>
<IconButton icon="⚙" aria-label="Settings" />`,
    component: (
      <div className="flex gap-4 flex-wrap">
        <Button icon="→" iconPosition="left">
          Next
        </Button>
        <Button icon="←" iconPosition="right">
          Back
        </Button>
        <IconButton icon="⚙" aria-label="Settings" />
      </div>
    ),
  },
  {
    title: 'Full Width',
    description: 'Buttons that take full width of their container',
    code: `<Button fullWidth variant="primary">
  Full Width Button
</Button>`,
    component: (
      <div className="w-full max-w-md">
        <Button fullWidth variant="primary">
          Full Width Button
        </Button>
      </div>
    ),
  },
]

const props = [
  {
    name: 'variant',
    type: '"primary" | "secondary" | "ghost" | "danger"',
    default: '"primary"',
    description: 'Visual style variant of the button',
  },
  {
    name: 'size',
    type: '"sm" | "md" | "lg"',
    default: '"md"',
    description: 'Size of the button following 8px grid system',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Whether the button is disabled',
  },
  {
    name: 'loading',
    type: 'boolean',
    default: 'false',
    description: 'Shows loading spinner and disables interaction',
  },
  {
    name: 'icon',
    type: 'React.ReactNode',
    description: 'Icon to display in the button',
  },
  {
    name: 'iconPosition',
    type: '"left" | "right" | "only"',
    default: '"left"',
    description: 'Position of the icon relative to text',
  },
  {
    name: 'fullWidth',
    type: 'boolean',
    default: 'false',
    description: 'Whether button should take full width of container',
  },
  {
    name: 'rounded',
    type: 'boolean',
    default: 'false',
    description: 'Whether to use fully rounded corners',
  },
  {
    name: 'as',
    type: 'ElementType',
    default: '"button"',
    description: 'HTML element or component to render as',
  },
  {
    name: 'children',
    type: 'React.ReactNode',
    description: 'Button content (text, elements, etc.)',
  },
]

const guidelines = [
  'Use primary buttons for the main action on a page or section',
  'Use secondary buttons for supporting actions or when multiple buttons are needed',
  'Ghost buttons work well for less important actions or when you need a subtle appearance',
  'Danger buttons should only be used for destructive actions like delete or remove',
  'Always provide meaningful text or aria-label for icon-only buttons',
  'Use loading states for async operations to provide user feedback',
  'Maintain consistent button sizes within the same interface context',
  'Consider responsive sizing - smaller buttons on mobile, larger on desktop',
]

export default function ButtonDocumentation() {
  return (
    <ComponentShowcase
      title="Button"
      description="Interactive buttons with multiple variants, sizes, and states. Built with accessibility in mind and supporting polymorphic rendering."
      category="Interactive"
      status="ready"
      examples={examples}
      props={props}
      guidelines={guidelines}
    />
  )
}
