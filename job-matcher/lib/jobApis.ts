import { JobListing } from "./types";

const ADZUNA_COUNTRY = process.env.ADZUNA_COUNTRY || "us";
const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID || "";
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY || "";
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "";

export async function searchAdzuna(query: string, results = 10): Promise<JobListing[]> {
  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) return [];

  try {
    const params = new URLSearchParams({
      app_id: ADZUNA_APP_ID,
      app_key: ADZUNA_APP_KEY,
      results_per_page: String(results),
      what: query,
      content_type: "application/json",
    });

    const url = `https://api.adzuna.com/v1/api/jobs/${ADZUNA_COUNTRY}/search/1?${params}`;
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) return [];

    const data = await res.json();
    return (data.results || []).map((job: Record<string, unknown>) => ({
      id: `adzuna-${job.id}`,
      title: job.title as string,
      company: (job.company as Record<string, string>)?.display_name || "Unknown",
      location: (job.location as Record<string, unknown>)?.display_name as string || "",
      description: job.description as string || "",
      salary: formatSalary(job.salary_min as number, job.salary_max as number),
      postedAt: job.created as string,
      applyUrl: job.redirect_url as string,
      source: "Adzuna",
    }));
  } catch {
    return [];
  }
}

export async function searchJSearch(query: string, results = 10): Promise<JobListing[]> {
  if (!RAPIDAPI_KEY) return [];

  try {
    const params = new URLSearchParams({
      query,
      page: "1",
      num_pages: "1",
      date_posted: "week",
    });

    const res = await fetch(
      `https://jsearch.p.rapidapi.com/search?${params}`,
      {
        headers: {
          "X-RapidAPI-Key": RAPIDAPI_KEY,
          "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        },
        next: { revalidate: 0 },
      }
    );
    if (!res.ok) return [];

    const data = await res.json();
    return ((data.data || []) as Record<string, unknown>[]).slice(0, results).map((job) => ({
      id: `jsearch-${job.job_id}`,
      title: job.job_title as string,
      company: job.employer_name as string || "Unknown",
      location: [job.job_city, job.job_state, job.job_country]
        .filter(Boolean)
        .join(", "),
      description: job.job_description as string || "",
      salary: formatSalaryRange(
        job.job_min_salary as number,
        job.job_max_salary as number,
        job.job_salary_period as string
      ),
      jobType: job.job_employment_type as string,
      postedAt: job.job_posted_at_datetime_utc as string,
      applyUrl: (job.job_apply_link as string) || (job.job_google_link as string) || "",
      source: job.job_publisher as string || "JSearch",
    }));
  } catch {
    return [];
  }
}

export async function searchAllSources(queries: string[]): Promise<JobListing[]> {
  const searchPromises: Promise<JobListing[]>[] = [];

  for (const query of queries.slice(0, 4)) {
    searchPromises.push(searchAdzuna(query, 8));
    searchPromises.push(searchJSearch(query, 6));
  }

  const results = await Promise.all(searchPromises);
  const allJobs = results.flat();

  // Deduplicate by title+company
  const seen = new Set<string>();
  return allJobs.filter((job) => {
    const key = `${job.title.toLowerCase()}-${job.company.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function formatSalary(min?: number, max?: number): string {
  if (!min && !max) return "";
  if (min && max) return `$${Math.round(min / 1000)}k - $${Math.round(max / 1000)}k`;
  if (min) return `From $${Math.round(min / 1000)}k`;
  if (max) return `Up to $${Math.round(max / 1000)}k`;
  return "";
}

function formatSalaryRange(min?: number, max?: number, period?: string): string {
  if (!min && !max) return "";
  const suffix = period === "YEAR" ? "/yr" : period === "HOUR" ? "/hr" : "";
  if (min && max) {
    if (period === "YEAR") return `$${Math.round(min / 1000)}k - $${Math.round(max / 1000)}k${suffix}`;
    return `$${min} - $${max}${suffix}`;
  }
  return "";
}
