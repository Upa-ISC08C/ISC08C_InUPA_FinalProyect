export interface CVEducation {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate?: string;
}

export interface CVExperience {
  id: string;
  company: string;
  role: string;
  description: string;
  startDate: string;
  endDate?: string;
}

export interface CV {
  id: string;
  userId: string;
  fullName: string;
  summary: string;
  education: CVEducation[];
  experience: CVExperience[];
  skills: string[];
  templateId: string;
  updatedAt: string;
}
