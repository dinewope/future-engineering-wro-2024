/** Every number on the site lives here. Fictional case data is labelled; real research carries its source. */

export const CASE_STATS = [
  { value: '12,000', label: 'patients with recurring unexplained symptoms' },
  { value: '6', label: 'average healthcare visits before specialist referral' },
  { value: '30 mo', label: 'median time from first documented symptom to referral' },
  { value: '46%', label: 'of patients felt heard during their journey' },
  { value: '52%', label: 'of primary care practices have timely specialist access' },
  { value: '38%', label: 'of patient records have incomplete symptom histories' },
];

export interface Research {
  value: string;
  text: string;
  cite: string;
  url: string;
}

export const RESEARCH: Record<string, Research> = {
  prevalence: {
    value: '0.7%',
    text: 'of people worldwide have chronic urticaria (1.4% Asia, 0.5% Europe, 0.1% North America).',
    cite: 'Fricke et al., Allergy 2020',
    url: 'https://opus.bibliothek.uni-wuerzburg.de/files/21370/ALL_ALL14037.pdf',
  },
  women: {
    value: '2×',
    text: 'In US adults, women are affected about twice as often as men (310 vs 146 per 100,000).',
    cite: 'Wertenteil et al., JAAD 2019',
    url: 'https://www.em-consulte.com/article/1294301/prevalence-estimates-for-chronic-urticaria-in-the-',
  },
  delay: {
    value: '24%',
    text: 'of 4,332 chronic urticaria patients had a delay of at least 1 year before their condition was identified.',
    cite: 'Muñoz et al., Clin Exp Allergy 2026 (CURE registry)',
    url: 'https://pure.eur.nl/en/publications/diagnostic-delay-in-patients-with-chronic-urticaria-results-from-/',
  },
  doctors: {
    value: '75%',
    text: 'of 190 CSU patients saw 3+ doctors before their condition was named; 92% felt mainly anger or frustration; 83% called their care path unsatisfactory.',
    cite: 'Cappuccio et al., Acta Derm Venereol 2017',
    url: 'https://publires.unicatt.it/it/publications/living-with-chronic-spontaneous-urticaria-in-italy-a-narrative-me-6/',
  },
  swelling: {
    value: '66%',
    text: 'of 673 patients had swelling episodes in the past year; 27% work productivity impairment.',
    cite: 'Maurer et al., ASSURE-CSU, Allergy 2017',
    url: 'https://research.manchester.ac.uk/en/publications/the-burden-of-chronic-spontaneous-urticaria-is-substantial-real-w/',
  },
  model: {
    value: '3.8 → 2.5 yrs',
    text: 'German model: time to disease control 3.8 years; with patient education + doctor education + a disease-management programme, 2.5 years. Patients with control 44.2% → 58.1% (computer simulation).',
    cite: 'Maurer et al., JEADV 2024',
    url: 'https://www.immunosensation.de/publications/modelling-of-patient-journey-in-chronic-spontaneous-urticaria-increasing-awareness-and-education-by-shorten-patients-disease-journey-in-germany',
  },
  app: {
    value: '25,710',
    text: 'entries logged by 2,540 users of a real CSU tracking app in its first year; free in 17 countries.',
    cite: 'Neisinger et al., Clin Transl Allergy 2024',
    url: 'https://dspace.library.uu.nl/handle/1874/454152',
  },
  summaries: {
    value: '87.5%',
    text: 'of physicians said AI summaries of health records with links to source notes would save time (small early study, 8 physicians).',
    cite: 'Mass General Brigham, medRxiv 2025',
    url: 'https://www.medrxiv.org/content/10.1101/2025.06.02.25328807',
  },
  skin: {
    value: 'Bias',
    text: 'Skin-image AI performed much worse on Black and brown skin.',
    cite: 'Daneshjou et al., Science Advances 2022',
    url: 'https://med.stanford.edu/news/insights/2022/09/training-physicians-and-algorithms-in-dermatology-diversity.html',
  },
  cahps: {
    value: 'CAHPS',
    text: '"Felt heard" can be measured with national survey items, e.g. provider "listened carefully" and "seemed to know the important information about your medical history".',
    cite: 'AHRQ CAHPS Clinician & Group Survey 3.0',
    url: 'https://yourcahps.rand.org/surveys/1',
  },
};
