import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    'whitepaper',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/installation',
        'getting-started/quickstart',
        'getting-started/concepts',
        'getting-started/llm-configuration',
      ],
    },
    {
      type: 'category',
      label: 'Verification Engines',
      items: [
        'engines/overview',
        'engines/math',
        'engines/logic',
        'engines/code',
        'engines/sql',
        'engines/reasoning',
      ],
    },
    {
      type: 'category',
      label: 'SDKs',
      items: [
        'sdks/overview',
        'sdks/python',
        'sdks/typescript',
        'sdks/go',
        'sdks/rust',
      ],
    },
    {
      type: 'category',
      label: 'Integration Guide',
      items: [
        'integration/getting-started',
        'integration/common-pitfalls',
        'integration/testing',
        'integration/production',
        'integration/monitoring',
        'integration/troubleshooting',
      ],
    },
    'faq',
    'support',
    'troubleshooting',
    'architecture',
    {
      type: 'category',
      label: 'Framework Integrations',
      items: [
        'integrations/langchain',
        'integrations/llamaindex',
        'integrations/crewai',
      ],
    },
    {
      type: 'category',
      label: 'Protocol Specifications',
      items: [
        'specs/overview',
        'specs/qwed-spec',
        'specs/attestation',
        'specs/agent',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api/overview',
        'api/endpoints',
        'api/authentication',
        'api/dsl-reference',
        'api/errors',
        'api/rate-limits',
      ],
    },
    {
      type: 'category',
      label: 'Advanced',
      items: [
        'advanced/attestations',
        'advanced/agent-verification',
        'advanced/self-hosting',
        'advanced/pii-masking',
        'advanced/cli',
        'advanced/ollama',
        'advanced/qwed-local',
        'advanced/compliance',
        'advanced/security-hardening',
        'advanced/comparison',
        'advanced/deployment',
        'advanced/neurosymbolic',
        'advanced/integration-guide',
        'advanced/design',
        'advanced/performance-benchmarks',
        'advanced/specification-guide',
        'advanced/symbolic-limits',
        'advanced/why-cloud-llms',
        'advanced/github-action',
        'advanced/github-app',
        'advanced/contributor-onboarding',
        'advanced/integration-overview',
      ],
    },
    {
      type: 'category',
      label: '🛒 QWED-UCP',
      link: {
        type: 'doc',
        id: 'ucp/overview',
      },
      items: [
        'ucp/overview',
        'ucp/guards',
        'ucp/middleware-fastapi',
        'ucp/middleware-express',
        'ucp/examples',
        'ucp/troubleshooting',
      ],
    },
    {
      type: 'category',
      label: '🤖 Open Responses',
      link: {
        type: 'doc',
        id: 'open-responses/overview',
      },
      items: [
        'open-responses/overview',
        'open-responses/guards',
        'open-responses/langchain',
        'open-responses/openai',
        'open-responses/examples',
        'open-responses/troubleshooting',
      ],
    },
    {
      type: 'category',
      label: '🔌 QWED-MCP',
      link: {
        type: 'doc',
        id: 'mcp/overview',
      },
      items: [
        'mcp/overview',
        'mcp/tools',
        'mcp/examples',
        'mcp/troubleshooting',
      ],
    },
    {
      type: 'category',
      label: '🏦 QWED-Finance',
      link: {
        type: 'doc',
        id: 'finance/overview',
      },
      items: [
        'finance/overview',
        'finance/guards',
        'finance/compliance',
        'finance/design',
        {
          type: 'category',
          label: 'Integrations',
          items: [
            'finance/integrations/ucp',
            'finance/integrations/open-responses',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: '🏛️ QWED-Legal',
      link: {
        type: 'doc',
        id: 'legal/overview',
      },
      items: [
        'legal/overview',
        'legal/guards',
        'legal/examples',
        'legal/troubleshooting',
      ],
    },
    {
      type: 'category',
      label: '💸 QWED-Tax',
      link: {
        type: 'doc',
        id: 'tax/overview',
      },
      items: [
        'tax/overview',
        'tax/guards',
        'tax/integration',
      ],
    },
    {
      type: 'category',
      label: '☁️ QWED-Infra',
      link: {
        type: 'doc',
        id: 'infra/overview',
      },
      items: [
        'infra/overview',
        'infra/guards',
        'infra/examples',
        'infra/troubleshooting',
      ],
    },
  ],
};

export default sidebars;

