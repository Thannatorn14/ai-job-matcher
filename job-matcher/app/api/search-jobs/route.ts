import { NextRequest, NextResponse } from "next/server";
import { searchAllSources } from "@/lib/jobApis";
import { matchJobsToResume } from "@/lib/claude";
import { ResumeProfile } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { profile }: { profile: ResumeProfile } = await req.json();

    if (!profile) {
      return NextResponse.json({ error: "No profile provided" }, { status: 400 });
    }

    // Search for jobs using the profile's generated queries
    const jobs = await searchAllSources(profile.searchQueries);

    if (jobs.length === 0) {
      return NextResponse.json({
        jobs: [],
        message: "No jobs found. Please check your API keys in the .env file.",
      });
    }

    // Score all jobs against the resume profile
    const matchedJobs = await matchJobsToResume(profile, jobs);

    // Sort by match score descending
    matchedJobs.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({ jobs: matchedJobs });
  } catch (err) {
    console.error("search-jobs error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to search jobs" },
      { status: 500 }
    );
  }
}
