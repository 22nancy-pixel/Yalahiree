export async function runJobMatch(jobId) {
  const SUPABASE_URL = "https://YOUR_PROJECT_REF.supabase.co"; // replace with your Supabase project URL
  const SUPABASE_KEY = "YOUR_SERVICE_ROLE_KEY"; // replace with your Supabase service role key
  const url = `${SUPABASE_URL}/functions/v1/job-match`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
      },
      body: JSON.stringify({ job_id: jobId }),
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Job match failed:", err);
    return null;
  }
}
