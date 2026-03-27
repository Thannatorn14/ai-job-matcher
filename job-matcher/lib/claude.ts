import Anthropic from "@anthropic-ai/sdk";
import { ResumeProfile, JobListing, MatchedJob } from "./types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzeResume(resumeText: string): Promise<ResumeProfile> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Analyze this resume and extract structured information. Return a JSON object with exactly these fields:
- name: string (full name or null)
- email: string (email or null)
- phone: string (phone or null)
- summary: string (2-3 sentence professional summary)
- skills: string[] (all technical and soft skills, max 20)
- jobTitles: string[] (current and target job titles, 3-6 titles)
- experienceLevel: "entry" | "mid" | "senior" | "executive"
- yearsOfExperience: number
- education: string[] (degrees and certifications)
- industries: string[] (relevant industries, max 5)
- searchQueries: string[] (5-7 specific job search queries to find the best matches, e.g. "senior software engineer React Node.js")

Resume:
${resumeText}

Respond with ONLY valid JSON, no markdown, no explanation.`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  return JSON.parse(text) as ResumeProfile;
}

export async function matchJobsToResume(
  profile: ResumeProfile,
  jobs: JobListing[]
): Promise<MatchedJob[]> {
  if (jobs.length === 0) return [];

  const jobsText = jobs
    .map(
      (j, i) =>
        `[${i}] ${j.title} at ${j.company} (${j.location})\n${j.description.slice(0, 400)}`
    )
    .join("\n\n");

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `You are a job matching expert. Score each job listing's fit for this candidate.

CANDIDATE PROFILE:
- Skills: ${profile.skills.join(", ")}
- Experience Level: ${profile.experienceLevel} (${profile.yearsOfExperience} years)
- Target Roles: ${profile.jobTitles.join(", ")}
- Industries: ${profile.industries.join(", ")}
- Summary: ${profile.summary}

JOB LISTINGS:
${jobsText}

For each job (using its [index]), return a JSON array with objects containing:
- index: number
- matchScore: number (0-100, be realistic and discriminating)
- matchReason: string (1-2 sentences why this job fits or doesn't fit)
- matchingSkills: string[] (skills from candidate that match this job)
- missingSkills: string[] (skills this job needs that candidate lacks)

Respond with ONLY a valid JSON array, no markdown, no explanation.`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "[]";
  const scores = JSON.parse(text) as Array<{
    index: number;
    matchScore: number;
    matchReason: string;
    matchingSkills: string[];
    missingSkills: string[];
  }>;

  return scores.map((s) => ({
    ...jobs[s.index],
    matchScore: s.matchScore,
    matchReason: s.matchReason,
    matchingSkills: s.matchingSkills,
    missingSkills: s.missingSkills,
  }));
}
