import { JobListing } from "./types";

const COUNTRY = process.env.ADZUNA_COUNTRY || "us";
const ADZUNA_ID = process.env.ADZUNA_APP_ID || "";
const ADZUNA_KEY = process.env.ADZUNA_APP_KEY || "";
const RAPID_KEY = process.env.RAPIDAPI_KEY || "";

async function searchAdzuna(query: string, perPage = 8): Promise<JobListing[]> {
  if (!ADZUNA_ID || !ADZUNA_KEY) return [];

  const params = new URLSearchParams({
    app_id: ADZUNA_ID,
    app_key: ADZUNA_KEY,
    results_per_page: String(perPage),
    what: query,
  });

  try {
    const res = await fetch(
      `https://api.adzuna.com/v1/api/jobs/${COUNTRY}/search/1?${params}`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data.results ?? []).map((j: any) => ({
      id: `adzuna-${j.id}`,
      title: j.title ?? "",
      company: j.company?.display_name ?? "Unknown",
      location: j.location?.display_name ?? "",
      description: j.description ?? "",
      salary: salaryRange(j.salary_min, j.salary_max),
      postedAt: j.created ?? undefined,
      applyUrl: j.redirect_url ?? "",
      source: "Adzuna",
    }));
  } catch {
    return [];
  }
}

async function searchJSearch(query: string, perPage = 6): Promise<JobListing[]> {
  if (!RAPID_KEY) return [];

  const params = new URLSearchParams({
    query,
    page: "1",
    num_pages: "1",
    date_posted: "week",
  });

  try {
    const res = await fetch(`https://jsearch.p.rapidapi.com/search?${params}`, {
      headers: {
        "X-RapidAPI-Key": RAPID_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
      },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((data.data ?? []) as any[]).slice(0, perPage).map((j) => ({
      id: `jsearch-${j.job_id}`,
      title: j.job_title ?? "",
      company: j.employer_name ?? "Unknown",
      location: [j.job_city, j.job_state, j.job_country].filter(Boolean).join(", "),
      description: j.job_description ?? "",
      salary: salaryFromJSearch(j.job_min_salary, j.job_max_salary, j.job_salary_period),
      jobType: j.job_employment_type ?? undefined,
      postedAt: j.job_posted_at_datetime_utc ?? undefined,
      applyUrl: j.job_apply_link ?? j.job_google_link ?? "",
      source: j.job_publisher ?? "JSearch",
    }));
  } catch {
    return [];
  }
}

export async function searchAllSources(queries: string[]): Promise<JobListing[]> {
  const promises = queries.slice(0, 4).flatMap((q) => [
    searchAdzuna(q),
    searchJSearch(q),
  ]);

  const results = await Promise.all(promises);
  const all = results.flat();

  // Deduplicate by title + company
  const seen = new Set<string>();
  return all.filter((j) => {
    const key = `${j.title.toLowerCase()}|${j.company.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function salaryRange(min?: number, max?: number): string {
  if (!min && !max) return "";
  if (min && max) return `$${Math.round(min / 1000)}k – $${Math.round(max / 1000)}k`;
  if (min) return `From $${Math.round(min / 1000)}k`;
  return `Up to $${Math.round(max! / 1000)}k`;
}

function salaryFromJSearch(min?: number, max?: number, period?: string): string {
  if (!min && !max) return "";
  const s = period === "HOUR" ? "/hr" : period === "YEAR" ? "/yr" : "";
  if (min && max) {
    if (period === "YEAR") return `$${Math.round(min / 1000)}k – $${Math.round(max / 1000)}k${s}`;
    return `$${min} – $${max}${s}`;
  }
  return "";
}
