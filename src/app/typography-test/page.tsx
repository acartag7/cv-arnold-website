/**
 * Typography Test Page
 * Comprehensive showcase of the Typography component system
 */

'use client'

import {
  Typography,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Subtitle,
  Body,
  Caption,
  Overline,
  Container,
  Section,
  Stack,
} from '@/components/ui'

export default function TypographyTestPage() {
  return (
    <div className="min-h-screen py-16">
      <Container size="lg">
        <Stack gap={12}>
          <Section>
            <Heading1>Typography System Showcase</Heading1>
            <Subtitle className="mt-4">
              Comprehensive typography component with fluid scaling, responsive
              design, and semantic variants
            </Subtitle>
          </Section>

          <Section>
            <Heading2>Heading Variants</Heading2>
            <Stack gap={6} className="mt-6">
              <div>
                <Heading1>Heading 1 - Main Title</Heading1>
                <Caption className="mt-2 text-semantic-text-muted">
                  Size: 4xl (36px-64px), Weight: bold, Line Height: tight
                </Caption>
              </div>

              <div>
                <Heading2>Heading 2 - Section Title</Heading2>
                <Caption className="mt-2 text-semantic-text-muted">
                  Size: 3xl (30px-48px), Weight: bold, Line Height: tight
                </Caption>
              </div>

              <div>
                <Heading3>Heading 3 - Subsection Title</Heading3>
                <Caption className="mt-2 text-semantic-text-muted">
                  Size: 2xl (24px-32px), Weight: semibold, Line Height: snug
                </Caption>
              </div>

              <div>
                <Heading4>Heading 4 - Component Title</Heading4>
                <Caption className="mt-2 text-semantic-text-muted">
                  Size: xl (20px-24px), Weight: semibold, Line Height: snug
                </Caption>
              </div>

              <div>
                <Heading5>Heading 5 - Small Section</Heading5>
                <Caption className="mt-2 text-semantic-text-muted">
                  Size: lg (18px-20px), Weight: medium, Line Height: normal
                </Caption>
              </div>

              <div>
                <Heading6>Heading 6 - Micro Section</Heading6>
                <Caption className="mt-2 text-semantic-text-muted">
                  Size: base (16px), Weight: medium, Line Height: normal
                </Caption>
              </div>
            </Stack>
          </Section>

          <Section>
            <Heading2>Body Text Variants</Heading2>
            <Stack gap={6} className="mt-6">
              <div>
                <Subtitle variant="subtitle1">
                  Subtitle 1 - Large supporting text that provides additional
                  context and information.
                </Subtitle>
                <Caption className="mt-2 text-semantic-text-muted">
                  Size: lg (18px-20px), Weight: normal, Line Height: relaxed
                </Caption>
              </div>

              <div>
                <Subtitle variant="subtitle2">
                  Subtitle 2 - Regular supporting text for section descriptions
                  and introductions.
                </Subtitle>
                <Caption className="mt-2 text-semantic-text-muted">
                  Size: base (16px), Weight: normal, Line Height: relaxed
                </Caption>
              </div>

              <div>
                <Body variant="body1">
                  Body 1 - Primary body text for main content, articles, and
                  descriptions. This text should be highly readable and
                  comfortable for extended reading sessions. It uses optimal
                  line height and spacing for maximum readability.
                </Body>
                <Caption className="mt-2 text-semantic-text-muted">
                  Size: base (16px), Weight: normal, Line Height: relaxed
                </Caption>
              </div>

              <div>
                <Body variant="body2">
                  Body 2 - Secondary body text for supporting content, captions,
                  and less prominent text areas. Still maintains good
                  readability while being slightly smaller.
                </Body>
                <Caption className="mt-2 text-semantic-text-muted">
                  Size: sm (14px), Weight: normal, Line Height: normal
                </Caption>
              </div>
            </Stack>
          </Section>

          <Section>
            <Heading2>Utility Text Variants</Heading2>
            <Stack gap={4} className="mt-6">
              <div>
                <Caption>
                  Caption text - Used for image captions, form help text, and
                  secondary information
                </Caption>
                <Caption className="mt-1 text-semantic-text-muted">
                  Size: xs (12px), Weight: normal, Line Height: normal, Letter
                  Spacing: wide
                </Caption>
              </div>

              <div>
                <Overline>OVERLINE TEXT - LABELS AND CATEGORIES</Overline>
                <Caption className="mt-1 text-semantic-text-muted">
                  Size: xs (12px), Weight: medium, Line Height: normal, Letter
                  Spacing: wider, Transform: uppercase
                </Caption>
              </div>
            </Stack>
          </Section>

          <Section>
            <Heading2>Color Variants</Heading2>
            <Stack gap={4} className="mt-6">
              <Typography color="primary">Primary color text</Typography>
              <Typography color="secondary">Secondary color text</Typography>
              <Typography color="accent">Accent color text</Typography>
              <Typography color="muted">Muted color text</Typography>
              <Typography color="subtle">Subtle color text</Typography>
              <Typography color="success">Success color text</Typography>
              <Typography color="warning">Warning color text</Typography>
              <Typography color="error">Error color text</Typography>
            </Stack>
          </Section>

          <Section>
            <Heading2>Responsive Typography</Heading2>
            <Stack gap={6} className="mt-6">
              <div>
                <Typography
                  variant="h2"
                  size={{ base: 'lg', md: '2xl', lg: '4xl' }}
                >
                  Responsive Heading
                </Typography>
                <Caption className="mt-2 text-semantic-text-muted">
                  Size changes: lg (mobile) → 2xl (tablet) → 4xl (desktop)
                </Caption>
              </div>

              <div>
                <Typography
                  size={{ base: 'sm', md: 'base', lg: 'lg' }}
                  weight={{ base: 'normal', md: 'medium', lg: 'semibold' }}
                >
                  This text demonstrates responsive sizing and weight changes
                  across breakpoints.
                </Typography>
                <Caption className="mt-2 text-semantic-text-muted">
                  Size and weight both change responsively
                </Caption>
              </div>
            </Stack>
          </Section>

          <Section>
            <Heading2>Text Styling Options</Heading2>
            <Stack gap={4} className="mt-6">
              <Typography weight="light">Light weight text</Typography>
              <Typography weight="normal">Normal weight text</Typography>
              <Typography weight="medium">Medium weight text</Typography>
              <Typography weight="semibold">Semibold weight text</Typography>
              <Typography weight="bold">Bold weight text</Typography>
              <Typography weight="extrabold">Extrabold weight text</Typography>
              <Typography weight="black">Black weight text</Typography>
            </Stack>
          </Section>

          <Section>
            <Heading2>Text Alignment</Heading2>
            <Stack gap={4} className="mt-6">
              <Typography align="left">Left aligned text</Typography>
              <Typography align="center">Center aligned text</Typography>
              <Typography align="right">Right aligned text</Typography>
              <Typography align="justify">
                Justified text that spreads across the full width of the
                container, creating even spacing between words to align both
                left and right edges.
              </Typography>
            </Stack>
          </Section>

          <Section>
            <Heading2>Text Transform</Heading2>
            <Stack gap={4} className="mt-6">
              <Typography transform="none">Normal text case</Typography>
              <Typography transform="uppercase">Uppercase text</Typography>
              <Typography transform="lowercase">LOWERCASE TEXT</Typography>
              <Typography transform="capitalize">
                capitalize each word
              </Typography>
            </Stack>
          </Section>

          <Section>
            <Heading2>Text Overflow</Heading2>
            <Stack gap={4} className="mt-6">
              <div className="w-48">
                <Typography truncate>
                  This is a very long text that will be truncated when it
                  exceeds the container width
                </Typography>
                <Caption className="mt-1 text-semantic-text-muted">
                  Truncated with ellipsis
                </Caption>
              </div>

              <div className="w-64">
                <Typography maxLines={3}>
                  This is a longer text that demonstrates multi-line truncation.
                  It will show only the first three lines and hide the rest with
                  an ellipsis. This feature is useful for content previews and
                  cards where you want to limit the vertical space.
                </Typography>
                <Caption className="mt-1 text-semantic-text-muted">
                  Limited to 3 lines
                </Caption>
              </div>
            </Stack>
          </Section>

          <Section>
            <Heading2>Semantic HTML Elements</Heading2>
            <Stack gap={4} className="mt-6">
              <Typography as="h3" variant="h4">
                Heading with custom HTML tag
              </Typography>
              <Typography as="p" variant="body1">
                Paragraph with explicit p tag
              </Typography>
              <Typography as="span" variant="caption">
                Span with caption styling
              </Typography>
              <Typography as="div" variant="subtitle1">
                Div with subtitle styling
              </Typography>
            </Stack>
          </Section>

          <Section>
            <Heading2>Fluid Typography (Large Sizes)</Heading2>
            <Stack gap={6} className="mt-6">
              <div>
                <Typography size="2xl">2xl Size - Fluid scaling</Typography>
                <Caption className="mt-1 text-semantic-text-muted">
                  Uses CSS clamp() for smooth scaling
                </Caption>
              </div>

              <div>
                <Typography size="3xl">3xl Size - Fluid scaling</Typography>
                <Caption className="mt-1 text-semantic-text-muted">
                  Scales from 30px to 48px
                </Caption>
              </div>

              <div>
                <Typography size="4xl">4xl Size - Fluid scaling</Typography>
                <Caption className="mt-1 text-semantic-text-muted">
                  Scales from 36px to 64px
                </Caption>
              </div>

              <div>
                <Typography size="5xl">5xl Size - Fluid scaling</Typography>
                <Caption className="mt-1 text-semantic-text-muted">
                  Scales from 48px to 80px
                </Caption>
              </div>

              <div>
                <Typography size="6xl">6xl Size - Fluid scaling</Typography>
                <Caption className="mt-1 text-semantic-text-muted">
                  Scales from 60px to 96px
                </Caption>
              </div>
            </Stack>
          </Section>
        </Stack>
      </Container>
    </div>
  )
}
