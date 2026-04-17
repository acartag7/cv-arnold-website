export const revalidate = 3600

const BODY = `# Arnold Cartagena

> Senior platform engineer building production AI agents. Founder of Edictum — runtime governance that enforces deterministic contracts on every tool call an agent makes, outside the LLM.

Based in Bern, Switzerland. Focused on runtime governance, tool-call safety, and platform engineering for AI agents.

## Primary

- [CV (full text)](https://cv.arnoldcartagena.com/llms-full.txt): Complete work history, skills, education, certifications, and achievements in markdown.
- [CV (rendered)](https://cv.arnoldcartagena.com/): Human-readable CV website.

## Edictum

- [edictum](https://github.com/edictum-ai/edictum): Python SDK — runtime contract enforcement for AI agents. MIT. PyPI \`edictum\`. 8 framework adapters, zero runtime deps.
- [edictum-ts](https://github.com/edictum-ai/edictum-ts): TypeScript SDK monorepo. MIT. npm \`@edictum/core\`.
- [edictum-go](https://github.com/edictum-ai/edictum-go): Go SDK and \`edictum gate\` CLI. MIT.
- [edictum-openclaw](https://github.com/edictum-ai/edictum-openclaw): OpenClaw plugin and adapter.
- [edictum-schemas](https://github.com/edictum-ai/edictum-schemas): Shared JSON Schema and cross-SDK conformance fixtures.
- [edictum.ai](https://edictum.ai): Hosted platform — approvals, audit feeds, fleet monitoring.
- [docs.edictum.ai](https://docs.edictum.ai): Documentation.

## Research & related projects

- [gap-benchmark](https://github.com/acartag7/gap-benchmark): Benchmark measuring text-safety vs tool-call-safety divergence in AI models across regulated domains.
- [ai-monoculture](https://github.com/acartag7/ai-monoculture): Measuring architectural convergence in AI coding assistants — 144 completions across 6 frontier models.
- [handoff-guard](https://github.com/acartag7/handoff-guard) and [handoff-guard-ts](https://github.com/acartag7/handoff-guard-ts): Validation for LLM agents that retries with feedback.
- [Mind the GAP (paper)](https://arxiv.org/abs/2602.16943): Text safety does not transfer to tool-call safety.

## Profiles

- [GitHub](https://github.com/acartag7)
- [LinkedIn](https://linkedin.com/in/arnold-cartagena)
`

export async function GET() {
  return new Response(BODY, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
