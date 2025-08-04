import { Container, Grid, Section, Stack, Flex } from '@/components/ui'

export default function LayoutTestPage() {
  return (
    <div className="min-h-screen">
      {/* Container Test */}
      <Section spacing="lg" background="muted">
        <Container size="lg">
          <Stack gap={6}>
            <h1 className="text-3xl font-bold text-center">
              Layout System Test Page
            </h1>
            <p className="text-center text-foreground-muted">
              Testing all layout components: Container, Grid, Section, Stack,
              and Flex
            </p>
          </Stack>
        </Container>
      </Section>

      {/* Container Sizes Test */}
      <Section spacing="lg">
        <Stack gap={8}>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Container Sizes</h2>
          </div>

          <Container size="sm" className="bg-accent-subtle p-4 rounded">
            <p className="text-center">Small Container (max-w-screen-sm)</p>
          </Container>

          <Container size="md" className="bg-accent-subtle p-4 rounded">
            <p className="text-center">Medium Container (max-w-screen-md)</p>
          </Container>

          <Container size="lg" className="bg-accent-subtle p-4 rounded">
            <p className="text-center">Large Container (max-w-screen-lg)</p>
          </Container>

          <Container size="xl" className="bg-accent-subtle p-4 rounded">
            <p className="text-center">
              Extra Large Container (max-w-screen-xl)
            </p>
          </Container>
        </Stack>
      </Section>

      {/* Grid Test */}
      <Section spacing="lg" background="muted">
        <Container>
          <Stack gap={6}>
            <h2 className="text-2xl font-bold text-center">Grid System</h2>

            <div>
              <h3 className="text-lg font-semibold mb-4">
                Responsive Grid (1 → 2 → 3 columns)
              </h3>
              <Grid cols={1} mdCols={2} lgCols={3} gap={4}>
                {[1, 2, 3, 4, 5, 6].map(item => (
                  <div key={item} className="bg-background p-4 rounded border">
                    <p className="text-center">Grid Item {item}</p>
                  </div>
                ))}
              </Grid>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">4-Column Grid</h3>
              <Grid cols={2} lgCols={4} gap={4}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(item => (
                  <div key={item} className="bg-background p-4 rounded border">
                    <p className="text-center">Item {item}</p>
                  </div>
                ))}
              </Grid>
            </div>
          </Stack>
        </Container>
      </Section>

      {/* Stack Test */}
      <Section spacing="lg">
        <Container>
          <Stack gap={6}>
            <h2 className="text-2xl font-bold text-center">Stack Component</h2>

            <div className="bg-background-muted p-6 rounded">
              <h3 className="text-lg font-semibold mb-4">
                Vertical Stack with Different Gaps
              </h3>
              <Flex direction="row" gap={8} wrap className="justify-center">
                <div className="bg-background p-4 rounded border">
                  <h4 className="font-semibold mb-2">Gap 2 (8px)</h4>
                  <Stack gap={2}>
                    <div className="bg-accent-subtle p-2 rounded">Item 1</div>
                    <div className="bg-accent-subtle p-2 rounded">Item 2</div>
                    <div className="bg-accent-subtle p-2 rounded">Item 3</div>
                  </Stack>
                </div>

                <div className="bg-background p-4 rounded border">
                  <h4 className="font-semibold mb-2">Gap 4 (16px)</h4>
                  <Stack gap={4}>
                    <div className="bg-accent-subtle p-2 rounded">Item 1</div>
                    <div className="bg-accent-subtle p-2 rounded">Item 2</div>
                    <div className="bg-accent-subtle p-2 rounded">Item 3</div>
                  </Stack>
                </div>

                <div className="bg-background p-4 rounded border">
                  <h4 className="font-semibold mb-2">Gap 8 (32px)</h4>
                  <Stack gap={8}>
                    <div className="bg-accent-subtle p-2 rounded">Item 1</div>
                    <div className="bg-accent-subtle p-2 rounded">Item 2</div>
                    <div className="bg-accent-subtle p-2 rounded">Item 3</div>
                  </Stack>
                </div>
              </Flex>
            </div>
          </Stack>
        </Container>
      </Section>

      {/* Flex Test */}
      <Section spacing="lg" background="muted">
        <Container>
          <Stack gap={6}>
            <h2 className="text-2xl font-bold text-center">Flex Component</h2>

            <div>
              <h3 className="text-lg font-semibold mb-4">
                Horizontal Flex Layouts
              </h3>
              <Stack gap={4}>
                <div className="bg-background p-4 rounded">
                  <h4 className="font-semibold mb-2">justify-start</h4>
                  <Flex
                    justify="start"
                    gap={2}
                    className="bg-background-muted p-2 rounded"
                  >
                    <div className="bg-accent-subtle px-3 py-1 rounded">
                      Item 1
                    </div>
                    <div className="bg-accent-subtle px-3 py-1 rounded">
                      Item 2
                    </div>
                    <div className="bg-accent-subtle px-3 py-1 rounded">
                      Item 3
                    </div>
                  </Flex>
                </div>

                <div className="bg-background p-4 rounded">
                  <h4 className="font-semibold mb-2">justify-center</h4>
                  <Flex
                    justify="center"
                    gap={2}
                    className="bg-background-muted p-2 rounded"
                  >
                    <div className="bg-accent-subtle px-3 py-1 rounded">
                      Item 1
                    </div>
                    <div className="bg-accent-subtle px-3 py-1 rounded">
                      Item 2
                    </div>
                    <div className="bg-accent-subtle px-3 py-1 rounded">
                      Item 3
                    </div>
                  </Flex>
                </div>

                <div className="bg-background p-4 rounded">
                  <h4 className="font-semibold mb-2">justify-between</h4>
                  <Flex
                    justify="between"
                    gap={2}
                    className="bg-background-muted p-2 rounded"
                  >
                    <div className="bg-accent-subtle px-3 py-1 rounded">
                      Item 1
                    </div>
                    <div className="bg-accent-subtle px-3 py-1 rounded">
                      Item 2
                    </div>
                    <div className="bg-accent-subtle px-3 py-1 rounded">
                      Item 3
                    </div>
                  </Flex>
                </div>
              </Stack>
            </div>
          </Stack>
        </Container>
      </Section>

      {/* Section Background Test */}
      <Section spacing="lg" background="accent">
        <Container>
          <Stack gap={4} align="center">
            <h2 className="text-2xl font-bold">
              Section with Accent Background
            </h2>
            <p>This section demonstrates the accent background variant</p>
          </Stack>
        </Container>
      </Section>

      {/* Real-world Example */}
      <Section spacing="xl">
        <Container>
          <Stack gap={8}>
            <h2 className="text-2xl font-bold text-center">
              Real-world Example: Card Layout
            </h2>

            <Grid cols={1} mdCols={2} lgCols={3} gap={6}>
              {[
                {
                  title: 'Feature 1',
                  description:
                    'Description of feature 1 with some longer text to show layout',
                },
                { title: 'Feature 2', description: 'Description of feature 2' },
                { title: 'Feature 3', description: 'Description of feature 3' },
                { title: 'Feature 4', description: 'Description of feature 4' },
                { title: 'Feature 5', description: 'Description of feature 5' },
                { title: 'Feature 6', description: 'Description of feature 6' },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-background p-6 rounded-lg border border-border shadow-sm"
                >
                  <Stack gap={3}>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="text-foreground-muted">
                      {feature.description}
                    </p>
                    <Flex justify="between" align="center" className="mt-4">
                      <span className="text-sm text-accent">Learn more</span>
                      <div className="w-2 h-2 bg-accent rounded-full"></div>
                    </Flex>
                  </Stack>
                </div>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Section>
    </div>
  )
}
