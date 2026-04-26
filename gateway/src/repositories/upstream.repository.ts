import { getLogger } from "@task-manager/shared/server";

const log = getLogger();

export interface ForwardResult {
  status: number;
  body: unknown;
  contentType: string | null;
}

/** HTTP client to downstream microservices (no shared DB). */
export class UpstreamRepository {
  async forward(
    serviceBaseUrl: string,
    method: string,
    pathWithQuery: string,
    body: unknown,
    hasJsonBody: boolean,
    forwardedHeaders: Record<string, string> = {}
  ): Promise<ForwardResult> {
    const url = `${serviceBaseUrl.replace(/\/$/, "")}${pathWithQuery}`;
    const headers: Record<string, string> = { ...forwardedHeaders };
    if (hasJsonBody && body !== undefined && method !== "GET" && method !== "HEAD") {
      headers["content-type"] = "application/json";
    }
    const init: RequestInit = {
      method,
      headers,
    };
    if (hasJsonBody && body !== undefined && method !== "GET" && method !== "HEAD") {
      init.body = JSON.stringify(body);
    }
    log.info("upstream_request", { method, url });
    const res = await fetch(url, init);
    const contentType = res.headers.get("content-type");
    const text = await res.text();
    if (!text) {
      return { status: res.status, body: null, contentType };
    }
    if (contentType?.includes("application/json")) {
      try {
        return { status: res.status, body: JSON.parse(text) as unknown, contentType };
      } catch {
        return { status: res.status, body: text, contentType };
      }
    }
    return { status: res.status, body: text, contentType };
  }
}

let upstreamRepository: UpstreamRepository | null = null;

export function getUpstreamRepository(): UpstreamRepository {
  if (!upstreamRepository) upstreamRepository = new UpstreamRepository();
  return upstreamRepository;
}
