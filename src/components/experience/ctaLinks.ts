export type CtaLinkInput = {
  primary?: string;
  secondary?: string;
};

export type ProductionCtaLinks = {
  primary: string;
  secondary: string;
};

function isVerifiedHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Returns a complete https pair or null — never partial or hash placeholders. */
export function resolveProductionCtaLinks(
  input: CtaLinkInput,
): ProductionCtaLinks | null {
  const primary = input.primary?.trim() ?? "";
  const secondary = input.secondary?.trim() ?? "";
  if (!primary || !secondary) return null;
  if (!isVerifiedHttpsUrl(primary) || !isVerifiedHttpsUrl(secondary)) {
    return null;
  }
  return { primary, secondary };
}

export function readProductionCtaLinksFromEnv(): ProductionCtaLinks | null {
  const env = import.meta.env as {
    VITE_AFFILIATE_URL?: string;
    VITE_INCOME_DISCLOSURE_URL?: string;
  };
  return resolveProductionCtaLinks({
    primary: env.VITE_AFFILIATE_URL,
    secondary: env.VITE_INCOME_DISCLOSURE_URL,
  });
}
