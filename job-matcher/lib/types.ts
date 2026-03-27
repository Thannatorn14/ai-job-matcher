export interface ResumeProfile {
  name?: string;
  email?: string;
  phone?: string;
  summary: string;
  skills: string[];
  jobTitles: string[];
  experienceLevel: "entry" | "mid" | "senior" | "executive";
  yearsOfExperience: number;
  education: string[];
  industries: string[];
  searchQueries: string[];
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  jobType?: string;
  postedAt?: string;
  applyUrl: string;
  source: string;
}

export interface MatchedJob extends JobListing {
  matchScore: number;
  matchReason: string;
  matchingSkills: string[];
  missingSkills: string[];
}

export interface SearchStatus {
  stage: "idle" | "analyzing" | "searching" | "matching" | "done" | "error";
  message: string;
  progress: number;
}
