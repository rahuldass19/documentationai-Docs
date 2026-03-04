import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'QWED | Deterministic Verification for AI',
  tagline: 'Mathematically prove LLM outputs before they reach production.',
  favicon: 'img/favicon.svg',

  // SEO Metadata
  headTags: [
    // Google Tag Manager
    {
      tagName: 'script',
      attributes: {},
      innerHTML: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','GTM-WFWSMKGZ');`,
    },
    // Primary Meta Tags
    {
      tagName: 'meta',
      attributes: { name: 'keywords', content: 'AI Verification, Deterministic AI, LLM Security, Prompt Injection Prevention, Formal Verification, Symbolic AI, Enterprise AI Safety, QWED Protocol' },
    },
    {
      tagName: 'meta',
      attributes: { name: 'author', content: 'QWED Inc.' },
    },
    {
      tagName: 'meta',
      attributes: { name: 'robots', content: 'index, follow' },
    },
    // Open Graph
    {
      tagName: 'meta',
      attributes: { property: 'og:type', content: 'website' },
    },
    {
      tagName: 'meta',
      attributes: { property: 'og:url', content: 'https://docs.qwedai.com/' },
    },
    {
      tagName: 'meta',
      attributes: { property: 'og:title', content: 'QWED | Deterministic Verification for AI' },
    },
    {
      tagName: 'meta',
      attributes: { property: 'og:description', content: 'The verification infrastructure layer for Enterprise AI. Mathematically prove LLM outputs before production.' },
    },
    {
      tagName: 'meta',
      attributes: { property: 'og:image', content: 'https://docs.qwedai.com/img/og-card.png' },
    },
    // Twitter Cards
    {
      tagName: 'meta',
      attributes: { name: 'twitter:card', content: 'summary_large_image' },
    },
    {
      tagName: 'meta',
      attributes: { name: 'twitter:url', content: 'https://docs.qwedai.com/' },
    },
    {
      tagName: 'meta',
      attributes: { name: 'twitter:title', content: 'QWED | Deterministic Verification for AI' },
    },
    {
      tagName: 'meta',
      attributes: { name: 'twitter:description', content: 'The verification infrastructure layer for Enterprise AI. Mathematically prove LLM outputs before production.' },
    },
    {
      tagName: 'meta',
      attributes: { name: 'twitter:image', content: 'https://docs.qwedai.com/img/og-card.png' },
    },
    // Structured Data (JSON-LD)
    {
      tagName: 'script',
      attributes: { type: 'application/ld+json' },
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "QWED",
        "url": "https://qwed.ai",
        "logo": "https://qwed.ai/logo.png",
        "description": "The verification infrastructure layer for Enterprise AI.",
        "sameAs": [
          "https://x.com/rahuldass29",
          "https://www.linkedin.com/in/rahul-dass-23b370b0/",
          "https://github.com/QWED-AI"
        ]
      }),
    },
    // Intercom Messenger Widget
    {
      tagName: 'script',
      attributes: {},
      innerHTML: `window.intercomSettings = {
        api_base: "https://api-iam.intercom.io",
        app_id: "q2zprv83"
      };`,
    },
    {
      tagName: 'script',
      attributes: {},
      innerHTML: `(function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/q2zprv83';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(document.readyState==='complete'){l();}else if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();`,
    },
  ],

  future: {
    v4: true,
  },

  url: 'https://docs.qwedai.com',
  baseUrl: '/',

  organizationName: 'QWED-AI',
  projectName: 'qwed-verification',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/QWED-AI/qwed-verification/tree/main/docs-site/',
          versions: {
            current: {
              label: 'v3.0.1',
            },
          },
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: 'https://github.com/QWED-AI/qwed-verification/tree/main/docs-site/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          // Old URLs that need to redirect to new locations
          { from: '/cli', to: '/docs/advanced/cli' },
          { from: '/integration', to: '/docs/integration/getting-started' },
          { from: '/docs/production', to: '/docs/integration/production' },
          { from: '/docs/advanced/security.md', to: '/docs/advanced/security-hardening' },
          { from: '/docs/integration/optimization', to: '/docs/integration/production' },
        ],
      },
    ],
  ],

  themeConfig: {
    image: 'img/qwed-social-card.png',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    // Algolia DocSearch - Apply at https://docsearch.algolia.com/apply/
    algolia: {
      appId: 'C7OC3N27NJ',
      apiKey: '3c07a75a8e7c0b21b8393f8e578b2e14',
      indexName: 'QWED Docs',
      contextualSearch: true,
      searchPagePath: 'search',
    },
    navbar: {
      title: 'QWED',
      logo: {
        alt: 'QWED Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          to: '/docs/integration/getting-started',
          label: 'Integration',
          position: 'left',
        },
        {
          to: '/docs/sdks/overview',
          label: 'SDKs',
          position: 'left',
        },
        {
          to: '/docs/specs/overview',
          label: 'Specs',
          position: 'left',
        },
        { to: '/blog', label: 'Blog', position: 'left' },
        {
          to: '/docs/ucp/overview',
          label: 'UCP',
          position: 'left',
        },
        {
          to: '/docs/open-responses/overview',
          label: 'Open Responses',
          position: 'left',
        },
        {
          to: '/docs/mcp/overview',
          label: 'MCP',
          position: 'left',
        },
        {
          to: '/docs/finance/overview',
          label: 'Finance',
          position: 'left',
        },
        {
          to: '/docs/legal/overview',
          label: 'Legal',
          position: 'left',
        },
        {
          to: '/docs/tax/overview',
          label: 'Tax',
          position: 'left',
        },
        {
          to: '/docs/infra/overview',
          label: 'Infra',
          position: 'left',
        },
        {
          type: 'docsVersionDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/QWED-AI/qwed-verification',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/intro',
            },
            {
              label: 'API Reference',
              to: '/docs/api/overview',
            },
            {
              label: 'Protocol Specs',
              to: '/docs/specs/overview',
            },
          ],
        },
        {
          title: 'SDKs',
          items: [
            {
              label: 'Python',
              to: '/docs/sdks/python',
            },
            {
              label: 'TypeScript',
              to: '/docs/sdks/typescript',
            },
            {
              label: 'Go',
              to: '/docs/sdks/go',
            },
            {
              label: 'Rust',
              to: '/docs/sdks/rust',
            },
          ],
        },
        {
          title: 'Integrations',
          items: [
            {
              label: 'LangChain',
              to: '/docs/integrations/langchain',
            },
            {
              label: 'LlamaIndex',
              to: '/docs/integrations/llamaindex',
            },
            {
              label: 'CrewAI',
              to: '/docs/integrations/crewai',
            },
            {
              label: 'MCP (Claude)',
              to: '/docs/mcp/overview',
            },
            {
              label: 'UCP (Commerce)',
              to: '/docs/ucp/overview',
            },
            {
              label: 'Tax (Payroll)',
              to: '/docs/tax/overview',
            },
            {
              label: 'Legal (Contracts)',
              to: '/docs/legal/overview',
            },
            {
              label: 'Infra (IaC)',
              to: '/docs/infra/overview',
            },
            {
              label: 'Open Responses',
              to: '/docs/open-responses/overview',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/QWED-AI/qwed-verification',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/qwed_ai',
            },
            {
              label: '💖 Sponsor',
              href: 'https://github.com/sponsors/rahuldass19',
            },
            {
              label: '🛡️ Secured by Snyk',
              href: 'https://snyk.io',
            },
          ],
        },
        {
          title: 'Legal',
          items: [
            {
              label: 'Privacy Policy',
              to: '/privacy',
            },
            {
              label: 'Terms of Service',
              to: '/terms',
            },
            {
              label: 'Support',
              href: 'mailto:support@qwedai.com',
            },
          ],
        },
      ],
      logo: {
        alt: 'NVIDIA Inception Program',
        src: 'img/nvidia-inception.png',
        href: 'https://www.nvidia.com/en-us/startups/',
        width: 140,
        height: 50,
      },
      copyright: `Copyright © ${new Date().getFullYear()} QWED-AI. Built with ❤️ for deterministic AI. | Member of NVIDIA Inception Program`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['python', 'typescript', 'go', 'rust', 'bash'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;

