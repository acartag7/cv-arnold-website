/**
 * Responsive System Test Page
 * Demonstrates the comprehensive responsive breakpoint system
 */

'use client'

import { Container, Stack, Flex } from '@/components/ui'
import {
  Show,
  Hide,
  ResponsiveText,
  ResponsiveHeading,
  ResponsiveParagraph,
} from '@/components/responsive'
import {
  useBreakpoint,
  useBreakpointValue,
  useBreakpointFlags,
  useMediaQuery,
} from '@/hooks/responsive'
import { BREAKPOINTS } from '@/types/responsive'

function BreakpointIndicator() {
  const { current } = useBreakpoint()
  const { isMobile, isTablet, isDesktop } = useBreakpointFlags()

  return (
    <div className="fixed top-4 right-4 bg-gray-900 text-white px-3 py-2 rounded-lg text-xs font-mono z-50">
      <div>Current: {current || 'mobile'}</div>
      <div>Mobile: {isMobile ? '✓' : '✗'}</div>
      <div>Tablet: {isTablet ? '✓' : '✗'}</div>
      <div>Desktop: {isDesktop ? '✓' : '✗'}</div>
    </div>
  )
}

function ResponsiveHooksDemo() {
  const { current } = useBreakpoint()
  const { matches: isLandscape } = useMediaQuery('(orientation: landscape)')

  const columns = useBreakpointValue({
    base: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
  })

  const padding = useBreakpointValue({
    base: '8px',
    md: '16px',
    lg: '24px',
  })

  const backgroundColor = useBreakpointValue({
    base: 'bg-red-100',
    sm: 'bg-yellow-100',
    md: 'bg-green-100',
    lg: 'bg-blue-100',
    xl: 'bg-purple-100',
  })

  return (
    <div className={`p-4 rounded-lg ${backgroundColor}`} style={{ padding }}>
      <h3 className="font-semibold mb-2">Responsive Hooks Demo</h3>
      <div className="text-sm space-y-1">
        <div>
          Current breakpoint: <strong>{current || 'mobile'}</strong>
        </div>
        <div>
          Columns: <strong>{columns}</strong>
        </div>
        <div>
          Padding: <strong>{padding}</strong>
        </div>
        <div>
          Orientation: <strong>{isLandscape ? 'Landscape' : 'Portrait'}</strong>
        </div>
      </div>
    </div>
  )
}

function VisibilityDemo() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Visibility Components</h3>

      <div className="grid gap-4">
        <Show above="md">
          <div className="bg-green-100 p-3 rounded">
            ✅ Visible on medium screens and above (md+)
          </div>
        </Show>

        <Show below="md">
          <div className="bg-blue-100 p-3 rounded">
            📱 Visible on small screens only (below md)
          </div>
        </Show>

        <Show only="lg">
          <div className="bg-purple-100 p-3 rounded">
            🖥️ Visible only on large screens (lg only)
          </div>
        </Show>

        <Hide above="lg">
          <div className="bg-orange-100 p-3 rounded">
            👋 Hidden on large screens and above (mobile + tablet)
          </div>
        </Hide>

        <Show between={['sm', 'lg']}>
          <div className="bg-pink-100 p-3 rounded">
            📊 Visible between small and large (sm to lg)
          </div>
        </Show>
      </div>
    </div>
  )
}

function ResponsiveTextDemo() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Responsive Typography</h3>

      <div className="space-y-4">
        <ResponsiveHeading level={1}>Responsive Main Heading</ResponsiveHeading>

        <ResponsiveHeading
          level={2}
          color={{
            base: 'text-gray-600',
            md: 'text-blue-600',
            lg: 'text-purple-600',
          }}
        >
          Heading with Responsive Colors
        </ResponsiveHeading>

        <ResponsiveText
          size={{
            base: '14px',
            md: '16px',
            lg: '18px',
            xl: '20px',
          }}
          weight={{ base: 400, lg: 500 }}
          color={{ base: 'text-gray-700', md: 'text-gray-800' }}
        >
          This text adapts its size, weight, and color based on screen size. Try
          resizing your browser window to see the changes!
        </ResponsiveText>

        <ResponsiveParagraph variant="large">
          Large paragraph variant that scales responsively across all
          breakpoints.
        </ResponsiveParagraph>

        <ResponsiveParagraph variant="small">
          Small paragraph variant for secondary content.
        </ResponsiveParagraph>
      </div>
    </div>
  )
}

function ResponsiveLayoutDemo() {
  const gridCols = useBreakpointValue({
    base: 1,
    sm: 2,
    md: 3,
    lg: 4,
  })

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Responsive Layout</h3>

      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}
      >
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="bg-gray-100 p-4 rounded text-center">
            Item {i + 1}
          </div>
        ))}
      </div>

      <div className="text-sm text-gray-600">
        Current grid columns: {gridCols}
      </div>
    </div>
  )
}

function BreakpointValuesDemo() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Defined Breakpoints</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Object.entries(BREAKPOINTS).map(([name, value]) => (
          <div key={name} className="bg-gray-50 p-3 rounded text-center">
            <div className="font-semibold text-lg">{name}</div>
            <div className="text-sm text-gray-600">{value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ResponsiveTestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <BreakpointIndicator />

      <Container className="py-8">
        <Stack gap={12}>
          {/* Header */}
          <div className="text-center">
            <ResponsiveHeading level={1}>
              Responsive System Test
            </ResponsiveHeading>
            <ResponsiveParagraph variant="large" className="mt-4">
              Comprehensive testing of the responsive breakpoint system
              including hooks, components, and utilities. Resize your browser to
              see responsive behavior.
            </ResponsiveParagraph>
          </div>

          {/* Hooks Demo */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Responsive Hooks</h2>
            <ResponsiveHooksDemo />
          </section>

          {/* Visibility Demo */}
          <section>
            <VisibilityDemo />
          </section>

          {/* Typography Demo */}
          <section>
            <ResponsiveTextDemo />
          </section>

          {/* Layout Demo */}
          <section>
            <ResponsiveLayoutDemo />
          </section>

          {/* Breakpoint Values */}
          <section>
            <BreakpointValuesDemo />
          </section>

          {/* Complex Example */}
          <section className="bg-white p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-6">
              Complex Responsive Example
            </h2>

            <div className="space-y-6">
              {/* Hero Section */}
              <div className="text-center">
                <ResponsiveHeading level={1} className="mb-4">
                  Welcome to Our Platform
                </ResponsiveHeading>

                <ResponsiveText
                  size={{ base: '16px', md: '18px', lg: '20px' }}
                  color={{ base: 'text-gray-600', md: 'text-gray-700' }}
                  className="max-w-2xl mx-auto"
                >
                  Experience the power of responsive design with our
                  comprehensive system that adapts to every screen size
                  seamlessly.
                </ResponsiveText>
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {[
                  { title: 'Mobile First', icon: '📱' },
                  { title: 'Performance Optimized', icon: '⚡' },
                  { title: 'SSR Compatible', icon: '🏢' },
                  { title: 'TypeScript Ready', icon: '🔷' },
                  { title: 'Accessibility Focused', icon: '♿' },
                  { title: 'Design Token Integrated', icon: '🎨' },
                ].map((feature, index) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-lg">
                    <div className="text-3xl mb-3">{feature.icon}</div>
                    <ResponsiveHeading level={3} className="mb-2">
                      {feature.title}
                    </ResponsiveHeading>
                    <ResponsiveParagraph variant="small">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Sed do eiusmod tempor incididunt ut labore.
                    </ResponsiveParagraph>
                  </div>
                ))}
              </div>

              {/* CTA Section */}
              <div className="text-center mt-12 p-6 bg-blue-50 rounded-lg">
                <ResponsiveHeading level={2} className="mb-4">
                  Ready to Get Started?
                </ResponsiveHeading>

                <Flex
                  justify="center"
                  gap={4}
                  className="mt-6 flex-col sm:flex-row"
                >
                  <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                    Get Started
                  </button>
                  <button className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors">
                    Learn More
                  </button>
                </Flex>
              </div>
            </div>
          </section>
        </Stack>
      </Container>
    </div>
  )
}
