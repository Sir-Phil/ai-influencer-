const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

/**
 * Trigger the initial AI research and draft generation
 */
export async function generateDraft(topic: string) {
  const res = await fetch(`${BASE_URL}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to generate draft");
  }

  return res.json(); // Returns { id: "uuid", status: "..." }
}

/**
 * Poll for the status and content of a specific draft
 */
export async function getDraft(jobId: string) {
  const res = await fetch(`${BASE_URL}/drafts/${jobId}`);
  if (!res.ok) return null;
  return res.json();
}

/**
 * Persist manual edits to a draft before publishing
 */
export async function updateDraft(jobId: string, content: string) {
  const res = await fetch(`${BASE_URL}/drafts/${jobId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) throw new Error("Failed to update draft");
  return res.json();
}

/**
 * Push the final approved content to X and Instagram
 */
export async function publishDraft(jobId: string) {
  const res = await fetch(`${BASE_URL}/drafts/${jobId}/publish`, {
    method: "POST",
  });

  if (!res.ok) throw new Error("Failed to publish to social media");
  return res.json();
}

/**
 * Fetch the latest verified claims from the Truth Monitor
 */
export async function getFactChecks() {
  const res = await fetch(`${BASE_URL}/fact-check-history`); 
  // Note: Ensure you have a GET route for history in your FastAPI main.py
  if (!res.ok) return [];
  return res.json();
}