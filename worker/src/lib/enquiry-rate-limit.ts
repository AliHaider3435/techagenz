interface RateLimitBinding {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

type RateLimitResult = "allowed" | "limited" | "unavailable";

function parseIpv4(address: string): number[] | null {
  const octets = address.split(".");
  if (octets.length !== 4) return null;

  const parsed = octets.map((octet) => {
    if (!/^(0|[1-9]\d{0,2})$/.test(octet)) return -1;
    const value = Number(octet);
    return value <= 255 ? value : -1;
  });
  return parsed.every((octet) => octet >= 0) ? parsed : null;
}

function expandIpv6(address: string): string[] | null {
  const ipv4Tail = address.match(/(\d+(?:\.\d+){3})$/);
  if (ipv4Tail) {
    const octets = parseIpv4(ipv4Tail[1]);
    if (!octets) return null;
    const high = ((octets[0] << 8) | octets[1]).toString(16);
    const low = ((octets[2] << 8) | octets[3]).toString(16);
    address = `${address.slice(0, ipv4Tail.index)}${high}:${low}`;
  }

  const halves = address.toLowerCase().split("::");
  if (halves.length > 2) return null;

  const left = halves[0] ? halves[0].split(":") : [];
  const right = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const zeroCount = 8 - left.length - right.length;
  if ((halves.length === 1 && zeroCount !== 0) || (halves.length === 2 && zeroCount < 1)) {
    return null;
  }

  const groups = [...left, ...Array<string>(zeroCount).fill("0"), ...right];
  if (groups.length !== 8 || groups.some((group) => !/^[\da-f]{1,4}$/.test(group))) {
    return null;
  }
  return groups.map((group) => group.padStart(4, "0"));
}

function normalizeClientIp(address: string): string | null {
  const ipv4 = parseIpv4(address);
  if (ipv4) return `ipv4:${ipv4.join(".")}`;
  if (!address.includes(":")) return null;

  const groups = expandIpv6(address);
  if (!groups) return null;

  if (groups.slice(0, 5).every((group) => group === "0000") && groups[5] === "ffff") {
    const high = Number.parseInt(groups[6], 16);
    const low = Number.parseInt(groups[7], 16);
    return `ipv4:${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`;
  }

  return `ipv6:${groups.slice(0, 4).join(":")}/64`;
}

export function getEnquiryRateLimitKey(request: Request): string | null {
  const clientIp = request.headers.get("CF-Connecting-IP")?.trim();
  if (!clientIp) return null;

  const normalizedIp = normalizeClientIp(clientIp);
  return normalizedIp ? `public-enquiries:${normalizedIp}` : null;
}

export async function checkEnquiryRateLimit(
  request: Request,
  rateLimiter: RateLimitBinding,
): Promise<RateLimitResult> {
  const key = getEnquiryRateLimitKey(request);
  if (!key) {
    console.error("[Enquiries] Cloudflare client IP is missing or invalid; rejecting request");
    return "unavailable";
  }

  try {
    const { success } = await rateLimiter.limit({ key });
    return success ? "allowed" : "limited";
  } catch (error) {
    console.error("[Enquiries] Cloudflare rate limiter failed:", error);
    return "unavailable";
  }
}
