export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:4000";

export type ApiRequestConfig = {
  path: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
};

function normalizeServerMessage(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("incorect credentials") || lowerMessage.includes("incorrect credentials")) {
    return "Email or password is incorrect. Please try again.";
  }

  if (lowerMessage.includes("authentication required")) {
    return "Please log in to continue.";
  }

  if (lowerMessage.includes("invalid or expired token")) {
    return "Your session has expired. Please log in again.";
  }

  if (lowerMessage.includes("zoderror")) {
    return "Some input values are invalid. Please check and try again.";
  }

  return message;
}

function getDefaultMessageByStatus(status: number): string {
  if (status === 400) return "Something in your request looks invalid. Please check and try again.";
  if (status === 401) return "Please log in to continue.";
  if (status === 403) return "You do not have permission to perform this action.";
  if (status === 404) return "We could not find what you are looking for.";
  if (status === 409) return "This action conflicts with existing data.";
  if (status >= 500) return "Our server is having trouble right now. Please try again shortly.";
  return "Something went wrong. Please try again.";
}

export async function apiRequest<T>({
  path,
  method = "GET",
  body,
  token,
}: ApiRequestConfig): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(
      "Unable to connect right now. Please check your internet or server connection and try again."
    );
  }

  const data = (await response.json().catch(() => ({}))) as {
    message?: string;
    error?: string;
    [key: string]: unknown;
  };

  if (!response.ok) {
    const rawMessage =
      typeof data.message === "string"
        ? data.message
        : typeof data.error === "string"
          ? data.error
          : getDefaultMessageByStatus(response.status);
    throw new Error(normalizeServerMessage(rawMessage));
  }

  return data as T;
}
