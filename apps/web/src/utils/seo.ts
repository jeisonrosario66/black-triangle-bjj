export type SeoMetadata = {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "video.other";
  locale?: "es" | "en";
};

const DEFAULT_TITLE = "Black Triangle BJJ";
const DEFAULT_DESCRIPTION =
  "Plataforma visual para estudiar Brazilian Jiu-Jitsu con cursos, sistemas conectados y progreso continuo.";
const DEFAULT_IMAGE_PATH = "/social-preview.png";
const DEFAULT_TYPE: SeoMetadata["type"] = "website";

const ABSOLUTE_URL_PATTERN = /^(?:https?:)?\/\//i;

const readSiteUrl = () => {
  const configuredUrl = import.meta.env.VITE_SITE_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin.replace(/\/+$/, "");
  }

  return "";
};

const resolveAbsoluteUrl = (value?: string) => {
  if (!value) {
    return undefined;
  }

  if (ABSOLUTE_URL_PATTERN.test(value)) {
    return value;
  }

  const siteUrl = readSiteUrl();

  if (!siteUrl) {
    return value;
  }

  return `${siteUrl}${value.startsWith("/") ? value : `/${value}`}`;
};

const upsertMeta = (selector: string, attributeName: "name" | "property", attributeValue: string, content: string) => {
  if (typeof document === "undefined") {
    return;
  }

  let node = document.head.querySelector<HTMLMetaElement>(selector);

  if (!node) {
    node = document.createElement("meta");
    node.setAttribute(attributeName, attributeValue);
    document.head.appendChild(node);
  }

  node.setAttribute("content", content);
};

const upsertLink = (rel: string, href: string) => {
  if (typeof document === "undefined") {
    return;
  }

  let node = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);

  if (!node) {
    node = document.createElement("link");
    node.setAttribute("rel", rel);
    document.head.appendChild(node);
  }

  node.setAttribute("href", href);
};

export const applySeoMetadata = ({
  title,
  description,
  image,
  url,
  type = DEFAULT_TYPE,
  locale = "es",
}: SeoMetadata) => {
  if (typeof document === "undefined") {
    return;
  }

  const normalizedTitle = title?.trim() || DEFAULT_TITLE;
  const normalizedDescription = description?.trim() || DEFAULT_DESCRIPTION;
  const normalizedImage = resolveAbsoluteUrl(image || DEFAULT_IMAGE_PATH) || DEFAULT_IMAGE_PATH;
  const normalizedUrl =
    resolveAbsoluteUrl(
      url ||
        (typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}${window.location.hash}`
          : "/"),
    ) || readSiteUrl();

  document.title = normalizedTitle;
  document.documentElement.lang = locale;

  upsertMeta('meta[name="description"]', "name", "description", normalizedDescription);
  upsertMeta('meta[property="og:title"]', "property", "og:title", normalizedTitle);
  upsertMeta(
    'meta[property="og:description"]',
    "property",
    "og:description",
    normalizedDescription,
  );
  upsertMeta('meta[property="og:type"]', "property", "og:type", type);
  upsertMeta('meta[property="og:site_name"]', "property", "og:site_name", DEFAULT_TITLE);
  upsertMeta('meta[property="og:locale"]', "property", "og:locale", locale === "en" ? "en_US" : "es_ES");
  upsertMeta('meta[property="og:image"]', "property", "og:image", normalizedImage);
  upsertMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
  upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", normalizedTitle);
  upsertMeta(
    'meta[name="twitter:description"]',
    "name",
    "twitter:description",
    normalizedDescription,
  );
  upsertMeta('meta[name="twitter:image"]', "name", "twitter:image", normalizedImage);

  if (normalizedUrl) {
    upsertMeta('meta[property="og:url"]', "property", "og:url", normalizedUrl);
    upsertLink("canonical", normalizedUrl);
  }
};

export const buildSeoTitle = (value?: string, suffix = DEFAULT_TITLE) =>
  value?.trim() ? `${value.trim()} | ${suffix}` : suffix;

export const buildSeoDescriptionFromSummary = (
  summary?: string,
  fallback = DEFAULT_DESCRIPTION,
) => {
  const normalizedSummary = summary?.trim();

  if (!normalizedSummary) {
    return fallback;
  }

  return normalizedSummary.length > 220
    ? `${normalizedSummary.slice(0, 217).trimEnd()}...`
    : normalizedSummary;
};

export const getDefaultSeoImage = () => resolveAbsoluteUrl(DEFAULT_IMAGE_PATH) || DEFAULT_IMAGE_PATH;
