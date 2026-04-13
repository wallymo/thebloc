import { ScoringContext, ScoringResult } from '@/types/scoring';

export interface SampleAsset {
  id: string;
  name: string;
  description: string;
  imagePath: string;
  context: ScoringContext;
  result: ScoringResult;
}

export const SAMPLE_ASSETS: SampleAsset[] = [
  {
    id: 'sample-1',
    name: 'DTC Print Ad — Diabetes',
    description:
      'Direct-to-consumer print ad for Type 2 diabetes awareness with brand-forward creative and low-visibility safety copy.',
    imagePath: '/samples/sample-1.png',
    context: {
      therapeuticArea: 'Type 2 Diabetes',
      audience: 'Adult patients 45-65',
      objective: 'Drive HCP conversation / brand awareness',
    },
    result: {
      overallScore: 41,
      overallCategory: 'Adequate',
      dimensions: {
        science: {
          score: 28,
          category: 'Poor',
          evidenceQuote:
            'Important Safety Information appears in 6pt gray text at bottom — below FDA readability standards',
          recommendations: [
            'Move ISI above the fold with minimum 8pt black text',
            'Add explicit indication statement near the headline',
          ],
        },
        engagement: {
          score: 58,
          category: 'Adequate',
          evidenceQuote:
            'Talk to your doctor CTA present but rendered in same weight as body copy',
          recommendations: [
            'Make CTA a distinct button with contrasting color',
            'Lead with patient outcome not product name',
          ],
        },
        clarity: {
          score: 61,
          category: 'Adequate',
          evidenceQuote: 'Three separate messages compete for attention',
          recommendations: [
            'Reduce to one primary message',
            'Increase white space between headline and body copy',
          ],
        },
      },
      priorityFixes: [
        'Move ISI above the fold with minimum 8pt black text',
        'Add explicit indication statement near the headline',
        'Make CTA a distinct button with contrasting color',
        'Lead with patient outcome not product name',
        'Reduce to one primary message',
      ],
      annotations: [
        {
          id: 'sample-1-sci-1',
          type: 'error',
          label: 'ISI readability risk',
          detail:
            'Important Safety Information is confined to faint 6pt gray text at the bottom of the ad, creating a compliance and readability issue.',
          dimension: 'science',
        },
        {
          id: 'sample-1-sci-2',
          type: 'error',
          label: 'Missing indication statement',
          detail:
            'The ad does not clearly state what the brand is indicated to treat near the main headline or claim.',
          dimension: 'science',
        },
        {
          id: 'sample-1-eng-1',
          type: 'warning',
          label: 'Weak CTA emphasis',
          detail:
            'The "Talk to your doctor" CTA is present, but it visually blends into the surrounding body copy instead of guiding action.',
          dimension: 'engagement',
        },
        {
          id: 'sample-1-cla-1',
          type: 'warning',
          label: 'Competing messages',
          detail:
            'Multiple value statements are given similar prominence, which weakens the primary takeaway and hurts scanability.',
          dimension: 'clarity',
        },
      ],
      scoredAt: '2026-04-10T10:00:00Z',
    },
  },
  {
    id: 'sample-2',
    name: 'HCP Detail Aid — Oncology',
    description:
      'Healthcare professional detail aid for NSCLC featuring efficacy endpoints, trial context, and patient selection criteria.',
    imagePath: '/samples/sample-2.png',
    context: {
      therapeuticArea: 'Oncology (NSCLC)',
      audience: 'Oncologists and oncology nurses',
      objective: 'Communicate efficacy data and patient selection criteria',
    },
    result: {
      overallScore: 78,
      overallCategory: 'Good',
      dimensions: {
        science: {
          score: 84,
          category: 'Strong',
          evidenceQuote:
            'Efficacy endpoint data includes the trial name and confidence interval alongside the primary result',
          recommendations: [
            'Add an at-a-glance safety summary adjacent to the efficacy chart',
            'Surface the patient selection criteria in a brief callout above the fold',
          ],
        },
        engagement: {
          score: 71,
          category: 'Good',
          evidenceQuote: '"Select your patients" headline gives clinicians a clear decision frame',
          recommendations: [
            'Add a stronger next-step CTA for formulary or dosing review',
            'Pair the headline with a short subhead that connects selection criteria to treatment action',
          ],
        },
        clarity: {
          score: 72,
          category: 'Good',
          evidenceQuote: 'The data table is well-organized but dense',
          recommendations: [
            'Convert the densest table rows into highlighted key takeaways',
            'Increase spacing between patient selection criteria and the efficacy table',
          ],
        },
      },
      priorityFixes: [
        'Add a stronger next-step CTA for formulary or dosing review',
        'Convert the densest table rows into highlighted key takeaways',
        'Add an at-a-glance safety summary adjacent to the efficacy chart',
      ],
      annotations: [
        {
          id: 'sample-2-sci-1',
          type: 'strength',
          label: 'Referenced efficacy evidence',
          detail:
            'The piece cites the trial name and confidence interval with the main endpoint, supporting scientific credibility.',
          dimension: 'science',
        },
        {
          id: 'sample-2-eng-1',
          type: 'strength',
          label: 'Audience-specific framing',
          detail:
            'The "Select your patients" headline aligns well with how oncology teams evaluate eligibility and treatment fit.',
          dimension: 'engagement',
        },
        {
          id: 'sample-2-cla-1',
          type: 'warning',
          label: 'Dense data presentation',
          detail:
            'The table structure is organized, but the volume of information still creates a slower scan for busy clinicians.',
          dimension: 'clarity',
        },
      ],
      scoredAt: '2026-04-10T10:05:00Z',
    },
  },
  {
    id: 'sample-3',
    name: 'Digital Banner — Cardiology',
    description:
      'Small-format cardiology banner ad with overloaded copy, limited hierarchy, and no visible risk balance.',
    imagePath: '/samples/sample-3.png',
    context: {
      therapeuticArea: 'Cardiovascular / Heart Failure',
      audience: 'Cardiologists',
      objective: 'Awareness and click-through to prescribing information',
    },
    result: {
      overallScore: 29,
      overallCategory: 'Poor',
      dimensions: {
        science: {
          score: 22,
          category: 'Poor',
          evidenceQuote: 'Important Safety Information and fair balance are absent from the banner entirely',
          recommendations: [
            'Add visible ISI and fair balance support before launch',
            'Include an indication or prescribing information reference within the unit',
          ],
        },
        engagement: {
          score: 44,
          category: 'Adequate',
          evidenceQuote: '"Learn more" CTA is present but generic and detached from a clinical benefit',
          recommendations: [
            'Replace the generic CTA with a prescribing-information action',
            'Lead with one concrete cardiology benefit instead of abstract awareness language',
          ],
        },
        clarity: {
          score: 31,
          category: 'Poor',
          evidenceQuote: 'Four text elements compete inside a 300x250px frame',
          recommendations: [
            'Reduce the banner to one headline and one supporting line',
            'Increase font size and spacing by removing nonessential copy',
          ],
        },
      },
      priorityFixes: [
        'Add visible ISI and fair balance support before launch',
        'Include an indication or prescribing information reference within the unit',
        'Reduce the banner to one headline and one supporting line',
        'Increase font size and spacing by removing nonessential copy',
        'Replace the generic CTA with a prescribing-information action',
      ],
      annotations: [
        {
          id: 'sample-3-sci-1',
          type: 'error',
          label: 'No ISI present',
          detail:
            'The banner does not surface Important Safety Information anywhere in the creative, creating an immediate compliance gap.',
          dimension: 'science',
        },
        {
          id: 'sample-3-sci-2',
          type: 'error',
          label: 'Fair balance omitted',
          detail:
            'Benefit language appears without any accompanying risk framing or fair balance, which is not acceptable for this format.',
          dimension: 'science',
        },
        {
          id: 'sample-3-eng-1',
          type: 'warning',
          label: 'Generic CTA',
          detail:
            'The CTA invites a click, but it does not connect the action to prescribing information or a clear clinical reason to engage.',
          dimension: 'engagement',
        },
        {
          id: 'sample-3-cla-1',
          type: 'error',
          label: 'Overcrowded banner layout',
          detail:
            'The 300x250 placement carries too many competing text elements, making the hierarchy hard to scan at a glance.',
          dimension: 'clarity',
        },
      ],
      scoredAt: '2026-04-10T10:10:00Z',
    },
  },
];
