export type ContractType = 'ESTAGIO' | 'CLT' | 'PJ';
export type SeniorityLevel = 'Estágio' | 'Júnior' | 'Pleno' | 'Sênior' | 'Especialista';
export type CandidatureType = 'platform' | 'email';

export interface ExtractedJobData {
  title: string;
  location: string;
  modality: string;
  salary: string;
  benefits: string[];
  schedule: string;
  requirements: string[];
  activities: string[];
  contractType: ContractType;
  seniorityLevel: SeniorityLevel;
  rawDescription: string;
  candidatureType?: CandidatureType;
  candidatureEmail?: string;
  showRequirements?: boolean;
  requirementsList?: string;
  customCtaPrefix?: string;
}

export interface SourcingChannels {
  universities: string[];
  facebookGroups: string[];
  whatsappTelegramCommunities: string[];
  linkedinSearchQueries: string[];
  specializedPlatforms: string[];
}

export interface SourcingProfile {
  idealCandidate: string;
  hardSkills: string[];
  softSkills: string[];
  companyExpectations: string;
  sourcingChannels: SourcingChannels;
  coldOutreachTemplates: {
    linkedinInmail: string;
    whatsappDirect: string;
  };
  screeningQuestions: string[];
  // Legacy compat fields
  recommendedUniversities: string[];
  linkedinHashtags: string[];
}

export interface CopyData {
  headline: string;
  subheadline: string;
  highlights: string[];
  ctaText: string;
  socialCaption: string;
  candidatureType?: CandidatureType;
  candidatureEmail?: string;
  showRequirements?: boolean;
  requirementsList?: string;
  customCtaPrefix?: string;
  contractType?: ContractType;
}

export interface AssetUrls {
  feed: string;
  story: string;
  whatsapp: string;
}

export interface BrandKitJob {
  id: string;
  job_url: string;
  recipient_email: string;
  status: 'pending' | 'processing' | 'scraping' | 'generating_ai' | 'rendering_arts' | 'uploading_and_mailing' | 'completed' | 'failed' | 'expired' | string;
  extracted_data?: ExtractedJobData;
  sourcing_profile?: SourcingProfile;
  copy_data?: CopyData;
  asset_urls?: AssetUrls;
  error_message?: string;
  created_at: string;
  completed_at?: string;
  expires_at?: string;
}
