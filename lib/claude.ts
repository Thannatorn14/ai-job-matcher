import Anthropic from "@anthropic-ai/sdk";
import { ResumeProfile, JobListing, MatchedJob } from "./types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function analyzeResume(resumeText: string): Promise<ResumeProfile> {
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Analyze this resume and return a JSON object with ONLY these fields (no extra text):
{
  "name": string | null,
  "email": string | null,
  "summary": "2-3 sentence professional summary",
  "skills": ["up to 20 skills"],
  "jobTitles": ["3-6 current or target job titles"],
  "experienceLevel": "entry" | "mid" | "senior" | "executive",
  "yearsOfExperience": number,
  "education": ["degrees and certifications"],
  "industries": ["up to 5 relevant industries"],
  "searchQueries": ["5-7 job search queries to find best matches, e.g. 'senior React developer TypeScript'"]
}

Resume:
${resumeText}`,
      },
    ],
  });

  const raw = msg.content[0].type === "text" ? msg.content[0].text.trim() : "{}";
  // Strip any accidental markdown fences
  const json = raw.replace(/^```[a-z]*\n?/, "").replace(/\n?```$/, "");
  return JSON.parse(json) as ResumeProfile;
}

export async function matchJobsToResume(
  profile: ResumeProfile,
  jobs: JobListing[]
): Promise<MatchedJob[]> {
  if (jobs.length === 0) return [];

  const listings = jobs
    .map(
      (j, i) =>
        `[${i}] "${j.title}" at ${j.company} — ${j.location}\n${j.description.slice(0, 350)}`
    )
    .join("\n\n---\n\n");

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `You are a recruiting expert. Score each job for this candidate and return ONLY a JSON array (no extra text):

CANDIDATE:
Skills: ${profile.skills.join(", ")}
Level: ${profile.experienceLevel} (${profile.yearsOfExperience} yrs)
Targets: ${profile.jobTitles.join(", ")}
Industries: ${profile.industries.join(", ")}
Summary: ${profile.summary}

JOBS:
${listings}

Return array of objects (one per job):
[{
  "index": number,
  "matchScore": number (0-100, be realistic),
  "matchReason": "1-2 sentences",
  "matchingSkills": ["skills candidate has that match"],
  "missingSkills": ["skills job wants that candidate lacks"]
}]`,
      },
    ],
  });

  const raw = msg.content[0].type === "text" ? msg.content[0].text.trim() : "[]";
  const json = raw.replace(/^```[a-z]*\n?/, "").replace(/\n?```$/, "");
  const scores = JSON.parse(json) as Array<{
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
    matchingSkills: s.matchingSkills ?? [],
    missingSkills: s.missingSkills ?? [],
  }));
}
