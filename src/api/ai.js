// ../api/ai.js
export async function runAIMatch(jobId) {
  try {
    const response = await fetch("http://localhost:3030/match-job", { // <-- match endpoint
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job_id: jobId }),
    });

    const data = await response.json();
    return data; // This will be { success: true, message: ... } for now
  } catch (err) {
    console.error("AI error:", err);
    return null;
  }
}