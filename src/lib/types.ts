export interface ExtractedJobData {
  title: string;
  location: string;
  modality: string;
  salary: string;
  benefits: string[];
  schedule: string;
  requirements: string[];
  activities: string[];
}

export interface SourcingProfile {
  idealCandidate: string;
  recommendedUniversities: string[];
  linkedinHashtags: string[];
  coldOutreachTemplates: {
    linkedinInmail: string;
    whatsappDirect: string;
  };
  screeningQuestions: string[];
}

export interface CopyData {
  headline: string;
  subheadline: string;
  highlights: string[];
  ctaText: string;
  socialCaption: string;
}

export interface AssetUrls {
  feed: string;
  story: string;
  linkedin: string;
  whatsapp: string;
}

export interface BrandKitJob {
  id: string;
  job_url: string;
  recipient_email: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  extracted_data?: ExtractedJobData;
  sourcing_profile?: SourcingProfile;
  copy_data?: CopyData;
  asset_urls?: AssetUrls;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}
