/**
 * A fictional job posting used to demonstrate keyword matching against `sampleResume()`.
 * The marketing site runs the real `keywordMatch()` over `samplePostingText()`, so any edit
 * here changes the numbers shown on the homepage.
 */
export const SAMPLE_POSTING = {
  title: 'Senior Product Engineer, Billing',
  company: 'Fieldstone',
  url: 'jobs.example.com/fieldstone/senior-product-engineer',
  lines: [
    'Own billing and onboarding for our B2B SaaS platform.',
    'Build in TypeScript, React, Node.js and PostgreSQL.',
    'Design usage-based billing on Stripe.',
    'Ship to AWS with Docker and Kubernetes.',
    'Mentor engineers and own onboarding analytics.',
    'Experience in B2B SaaS and SQL. GraphQL or Terraform a plus.',
  ],
}

export const samplePostingText = () => [SAMPLE_POSTING.title, ...SAMPLE_POSTING.lines].join('\n')
