import { ComplaintCategory, MLComponents, Complaint } from "../types";

/**
 * HOSTELSMART AI CORE V5.0 - PRECISION PRIORITIZATION
 * Strictly following the 4-Pillar Design:
 * 0.4 * Severity + 0.3 * Frequency + 0.2 * Urgency + 0.1 * Time Factor
 */

export async function analyzeComplaint(text: string) {
  const res = await fetch("http://127.0.0.1:5000/ml/complaint", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    throw new Error("ML backend failed");
  }

  return await res.json();
}

export const detectAttendanceAnomaly = (record: any, recentHistory: any[]) => {
  const sameIPRecords = recentHistory.filter(
    (h) => h.ipAddress === record.ipAddress && h.studentId !== record.studentId,
  );
  if (sameIPRecords.length >= 2)
    return {
      isAnomaly: true,
      reason: "Proxy Detected: Shared IP Fingerprint.",
    };
  if (!record.isHostelWifi)
    return {
      isAnomaly: true,
      reason: "Invalid Network: Not on Hostel Gateway.",
    };
  return { isAnomaly: false };
};
