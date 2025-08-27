/**
 * Button Component Test Page
 * Comprehensive testing environment for the Button component system
 */

'use client'

import React, { useState } from 'react'
import {
  Button,
  PrimaryButton,
  SecondaryButton,
  GhostButton,
  DangerButton,
  IconButton,
  LinkButton,
  Container,
  Section,
  Typography,
  Stack,
  Grid,
} from '@/components/ui'
import type { ButtonVariant, ButtonSize } from '@/types/button'

// Example icons (using simple SVG icons for testing)
const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
)

const PauseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
)

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
  </svg>
)

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
)

const DeleteIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </svg>
)

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
  </svg>
)

export default function ButtonTestPage() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  )
  const [pressedStates, setPressedStates] = useState<Record<string, boolean>>(
    {}
  )

  const toggleLoading = (key: string) => {
    setLoadingStates(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const togglePressed = (key: string) => {
    setPressedStates(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const variants: ButtonVariant[] = ['primary', 'secondary', 'ghost', 'danger']
  const sizes: ButtonSize[] = ['sm', 'md', 'lg']

  return (
    <main className="min-h-screen bg-semantic-background py-12">
      <Container size="xl">
        <Stack gap={12}>
          {/* Header */}
          <Section className="text-center">
            <Typography variant="h1" className="mb-4">
              Button Component System
            </Typography>
            <Typography variant="subtitle1" color="muted">
              Comprehensive testing environment for all button variants, sizes,
              and states
            </Typography>
          </Section>

          {/* Basic Variants */}
          <Section>
            <Typography variant="h2" className="mb-6">
              Button Variants
            </Typography>
            <Stack gap={4}>
              <div className="flex flex-wrap gap-4">
                <PrimaryButton>Primary Button</PrimaryButton>
                <SecondaryButton>Secondary Button</SecondaryButton>
                <GhostButton>Ghost Button</GhostButton>
                <DangerButton>Danger Button</DangerButton>
              </div>

              <Typography variant="h3" className="mt-8 mb-4">
                With Icons
              </Typography>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" icon={<PlayIcon />}>
                  Play Video
                </Button>
                <Button
                  variant="secondary"
                  icon={<DownloadIcon />}
                  iconPosition="right"
                >
                  Download File
                </Button>
                <Button variant="ghost" icon={<EditIcon />}>
                  Edit Content
                </Button>
                <Button variant="danger" icon={<DeleteIcon />}>
                  Delete Item
                </Button>
              </div>
            </Stack>
          </Section>

          {/* Size Variations */}
          <Section>
            <Typography variant="h2" className="mb-6">
              Button Sizes
            </Typography>
            <Grid cols={1} mdCols={3} gap={6}>
              {sizes.map(size => (
                <Stack key={size} gap={4}>
                  <Typography variant="h3" className="capitalize">
                    {size.toUpperCase()} Size
                  </Typography>
                  <Stack gap={3}>
                    <Button variant="primary" size={size}>
                      {size.toUpperCase()} Button
                    </Button>
                    <Button
                      variant="secondary"
                      size={size}
                      icon={<HeartIcon />}
                    >
                      With Icon
                    </Button>
                    <Button
                      variant="ghost"
                      size={size}
                      icon={<DownloadIcon />}
                      iconPosition="right"
                    >
                      Icon Right
                    </Button>
                  </Stack>
                </Stack>
              ))}
            </Grid>
          </Section>

          {/* Icon Only Buttons */}
          <Section>
            <Typography variant="h2" className="mb-6">
              Icon-Only Buttons
            </Typography>
            <Stack gap={4}>
              <Typography variant="h3" className="mb-4">
                Standard Sizes
              </Typography>
              <div className="flex flex-wrap gap-4 items-center">
                <IconButton
                  variant="primary"
                  size="sm"
                  icon={<PlayIcon />}
                  aria-label="Play video"
                />
                <IconButton
                  variant="secondary"
                  size="md"
                  icon={<PauseIcon />}
                  aria-label="Pause video"
                />
                <IconButton
                  variant="ghost"
                  size="lg"
                  icon={<EditIcon />}
                  aria-label="Edit content"
                />
                <IconButton
                  variant="danger"
                  size="md"
                  icon={<DeleteIcon />}
                  aria-label="Delete item"
                />
              </div>

              <Typography variant="h3" className="mt-8 mb-4">
                Rounded Icons
              </Typography>
              <div className="flex flex-wrap gap-4 items-center">
                <IconButton
                  variant="primary"
                  size="sm"
                  icon={<PlayIcon />}
                  aria-label="Play video"
                  rounded
                />
                <IconButton
                  variant="secondary"
                  size="md"
                  icon={<PauseIcon />}
                  aria-label="Pause video"
                  rounded
                />
                <IconButton
                  variant="ghost"
                  size="lg"
                  icon={<EditIcon />}
                  aria-label="Edit content"
                  rounded
                />
              </div>
            </Stack>
          </Section>

          {/* Interactive States */}
          <Section>
            <Typography variant="h2" className="mb-6">
              Interactive States
            </Typography>
            <Grid cols={1} mdCols={2} gap={8}>
              <Stack gap={4}>
                <Typography variant="h3">Loading States</Typography>
                <div className="space-y-4">
                  {variants.map(variant => (
                    <div key={variant} className="flex gap-3 items-center">
                      <Button
                        variant={variant}
                        loading={loadingStates[variant] || false}
                        onClick={() => toggleLoading(variant)}
                        className="w-32"
                      >
                        {loadingStates[variant]
                          ? 'Loading...'
                          : 'Click to Load'}
                      </Button>
                      <Typography variant="caption" className="capitalize">
                        {variant}
                      </Typography>
                    </div>
                  ))}
                </div>
              </Stack>

              <Stack gap={4}>
                <Typography variant="h3">Disabled States</Typography>
                <div className="space-y-4">
                  {variants.map(variant => (
                    <div key={variant} className="flex gap-3 items-center">
                      <Button variant={variant} disabled className="w-32">
                        Disabled
                      </Button>
                      <Typography variant="caption" className="capitalize">
                        {variant}
                      </Typography>
                    </div>
                  ))}
                </div>
              </Stack>
            </Grid>
          </Section>

          {/* Toggle Buttons */}
          <Section>
            <Typography variant="h2" className="mb-6">
              Toggle Buttons (ARIA Pressed)
            </Typography>
            <div className="flex flex-wrap gap-4">
              {['like', 'bookmark', 'follow'].map(action => (
                <Button
                  key={action}
                  variant={pressedStates[action] ? 'primary' : 'ghost'}
                  icon={<HeartIcon />}
                  aria-pressed={pressedStates[action] || false}
                  onClick={() => togglePressed(action)}
                  className="capitalize"
                >
                  {pressedStates[action] ? `${action}d` : action}
                </Button>
              ))}
            </div>
          </Section>

          {/* Full Width Buttons */}
          <Section>
            <Typography variant="h2" className="mb-6">
              Full Width Buttons
            </Typography>
            <Stack gap={4} className="max-w-md">
              <Button variant="primary" fullWidth>
                Primary Full Width
              </Button>
              <Button variant="secondary" fullWidth icon={<DownloadIcon />}>
                Secondary with Icon
              </Button>
              <Button
                variant="ghost"
                fullWidth
                loading={loadingStates.fullWidth || false}
              >
                {loadingStates.fullWidth ? 'Processing...' : 'Ghost Full Width'}
              </Button>
              <button
                onClick={() => toggleLoading('fullWidth')}
                className="text-sm text-semantic-text-muted underline"
              >
                Toggle Loading State
              </button>
            </Stack>
          </Section>

          {/* Link Buttons */}
          <Section>
            <Typography variant="h2" className="mb-6">
              Link Buttons
            </Typography>
            <Stack gap={4}>
              <Typography variant="body1" color="muted">
                Buttons that render as anchor tags for navigation
              </Typography>
              <div className="flex flex-wrap gap-4">
                <LinkButton
                  href="#"
                  variant="primary"
                  onClick={e => e.preventDefault()}
                >
                  Primary Link
                </LinkButton>
                <LinkButton
                  href="#"
                  variant="secondary"
                  icon={<DownloadIcon />}
                  onClick={e => e.preventDefault()}
                >
                  Download Resource
                </LinkButton>
                <LinkButton
                  href="#"
                  variant="ghost"
                  onClick={e => e.preventDefault()}
                >
                  Ghost Link
                </LinkButton>
              </div>
            </Stack>
          </Section>

          {/* Custom Loading Icons */}
          <Section>
            <Typography variant="h2" className="mb-6">
              Custom Loading Icons
            </Typography>
            <div className="flex flex-wrap gap-4">
              <Button
                variant="primary"
                loading={loadingStates.custom1 || false}
                loadingIcon={<HeartIcon />}
                onClick={() => toggleLoading('custom1')}
              >
                {loadingStates.custom1 ? 'Favoriting...' : 'Add to Favorites'}
              </Button>
              <Button
                variant="secondary"
                loading={loadingStates.custom2 || false}
                loadingIcon={<DownloadIcon />}
                onClick={() => toggleLoading('custom2')}
              >
                {loadingStates.custom2 ? 'Downloading...' : 'Download'}
              </Button>
            </div>
          </Section>

          {/* Responsive Variants */}
          <Section>
            <Typography variant="h2" className="mb-6">
              Responsive Variants
            </Typography>
            <Stack gap={4}>
              <Typography variant="body1" color="muted">
                Buttons that change variant and size based on screen size
              </Typography>
              <div className="flex flex-wrap gap-4">
                <Button
                  variant={{ base: 'ghost', md: 'primary' }}
                  size={{ base: 'sm', md: 'md', lg: 'lg' }}
                >
                  Responsive Button
                </Button>
                <Button
                  variant={{ base: 'secondary', lg: 'primary' }}
                  size={{ base: 'md', lg: 'lg' }}
                  icon={<PlayIcon />}
                >
                  Adaptive Design
                </Button>
              </div>
            </Stack>
          </Section>

          {/* Accessibility Demo */}
          <Section>
            <Typography variant="h2" className="mb-6">
              Accessibility Features
            </Typography>
            <Grid cols={1} mdCols={2} gap={8}>
              <Stack gap={4}>
                <Typography variant="h3">ARIA Attributes</Typography>
                <Button
                  variant="primary"
                  aria-describedby="button-desc"
                  aria-controls="content-panel"
                  aria-expanded={pressedStates.accordion || false}
                  onClick={() => togglePressed('accordion')}
                >
                  Toggle Content Panel
                </Button>
                <Typography id="button-desc" variant="caption" color="muted">
                  This button controls the visibility of a content panel
                </Typography>
              </Stack>

              <Stack gap={4}>
                <Typography variant="h3">Keyboard Navigation</Typography>
                <Typography variant="body2" color="muted">
                  All buttons support keyboard navigation:
                </Typography>
                <ul className="text-sm text-semantic-text-muted space-y-1 list-disc list-inside">
                  <li>Tab to focus</li>
                  <li>Space or Enter to activate</li>
                  <li>Focus visible indicators</li>
                  <li>Screen reader support</li>
                </ul>
              </Stack>
            </Grid>
          </Section>

          {/* Performance Notes */}
          <Section>
            <Typography variant="h2" className="mb-6">
              Performance Features
            </Typography>
            <Grid cols={1} mdCols={2} gap={8}>
              <Stack gap={3}>
                <Typography variant="h3">Optimizations</Typography>
                <ul className="text-sm text-semantic-text-muted space-y-2 list-disc list-inside">
                  <li>Memoized class generation with caching</li>
                  <li>Responsive value resolution</li>
                  <li>Optimized re-renders</li>
                  <li>Lazy icon loading</li>
                  <li>CSS-in-JS performance patterns</li>
                </ul>
              </Stack>

              <Stack gap={3}>
                <Typography variant="h3">Development Features</Typography>
                <ul className="text-sm text-semantic-text-muted space-y-2 list-disc list-inside">
                  <li>Runtime prop validation</li>
                  <li>TypeScript strict mode</li>
                  <li>Comprehensive error handling</li>
                  <li>Development warnings</li>
                  <li>Class cache management</li>
                </ul>
              </Stack>
            </Grid>
          </Section>
        </Stack>
      </Container>
    </main>
  )
}
