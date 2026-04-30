const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function generateDraft(topic: string) {
  const res = await fetch(`${BASE_URL}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic }),
  });

  // If your backend returns 201 Created or 202 Accepted, 
  // ensure you aren't accidentally rejecting it.
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Failed to generate");
  }

  return res.json();
}

export async function getDraft(jobId: string) {
  const res = await fetch(`${BASE_URL}/drafts/${jobId}`);
  if (!res.ok) return null;
  return res.json();
}

export async function updateDraft(job_id: string, content: string) {
  const res = await fetch(`${BASE_URL}/drafts/${job_id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  return res.json();
}

export async function publishDraft(job_id: string) {
  const res = await fetch(`${BASE_URL}/drafts/${job_id}/publish`, {
    method: "POST",
  });
  return res.json();
}