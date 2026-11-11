export interface EnquiryFormData {
  name: string;
  email: string;
  company: string;
  message: string;
}

export interface EnquiryWorkerPayload extends EnquiryFormData {
  turnstileToken: string;
}

interface WorkerResponse {
  ok?: boolean;
  error?: string;
  data?: EnquirySubmissionResult;
}

export type EnquiryEmailNotificationStatus = "accepted" | "not_configured" | "failed";

export interface EnquirySubmissionResult {
  enquirySaved: true;
  emailNotification: EnquiryEmailNotificationStatus;
}

export function getWorkerEnquiryEndpoint(workerBaseUrl: string | undefined): string {
  if (!workerBaseUrl?.trim()) {
    throw new Error("The enquiry service is not configured. Please contact us directly.");
  }

  let baseUrl: URL;
  try {
    baseUrl = new URL(workerBaseUrl);
  } catch {
    throw new Error("The enquiry service configuration is invalid. Please contact us directly.");
  }

  const isLocalHttp =
    baseUrl.protocol === "http:" &&
    (baseUrl.hostname === "localhost" || baseUrl.hostname === "127.0.0.1");
  if (baseUrl.protocol !== "https:" && !isLocalHttp) {
    throw new Error("The enquiry service must use HTTPS.");
  }

  return `${baseUrl.origin}/api/enquiries`;
}

export function createWorkerEnquiryRequest(
  workerBaseUrl: string | undefined,
  formData: EnquiryFormData,
  turnstileToken: string,
): { endpoint: string; init: RequestInit } {
  if (!turnstileToken.trim()) {
    throw new Error("Complete the security check before submitting.");
  }

  return {
    endpoint: getWorkerEnquiryEndpoint(workerBaseUrl),
    init: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, turnstileToken }),
    },
  };
}

export async function submitEnquiry(
  formData: EnquiryFormData,
  turnstileToken: string,
): Promise<EnquirySubmissionResult> {
  const { endpoint, init } = createWorkerEnquiryRequest(
    import.meta.env.VITE_API_BASE_URL,
    formData,
    turnstileToken,
  );
  const response = await fetch(endpoint, init);

  let result: WorkerResponse;
  try {
    result = await response.json();
  } catch {
    throw new Error("The enquiry service returned an invalid response. Please try again.");
  }

  if (!response.ok || result.ok !== true) {
    throw new Error(result.error || "Unable to deliver enquiry. Please try again.");
  }

  if (
    result.data?.enquirySaved !== true ||
    !["accepted", "not_configured", "failed"].includes(result.data.emailNotification)
  ) {
    throw new Error("The enquiry service returned an invalid response. Please try again.");
  }

  return result.data;
}
