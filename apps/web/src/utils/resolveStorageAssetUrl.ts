const ABSOLUTE_URL_PATTERN = /^(?:https?:)?\/\//i;
const SPECIAL_PROTOCOL_PATTERN = /^(?:blob:|data:)/i;
const RELATIVE_ASSET_PATTERN = /^(?:\/|\.\/|\.\.\/)/;
const DEFAULT_BUCKET_NAME = "black-triangle-storage";

const normalizeBaseUrl = (value?: string) => {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return "";
  }

  return trimmedValue.replace(/\/+$/, "");
};

const normalizeStoragePath = (value: string) =>
  value
    .trim()
    .replace(/^\/+/, "")
    .replace(new RegExp(`^${DEFAULT_BUCKET_NAME}/`), "");

export const resolveStorageAssetUrl = (value?: string) => {
  if (!value) {
    return undefined;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return undefined;
  }

  if (
    ABSOLUTE_URL_PATTERN.test(trimmedValue) ||
    SPECIAL_PROTOCOL_PATTERN.test(trimmedValue) ||
    RELATIVE_ASSET_PATTERN.test(trimmedValue)
  ) {
    return trimmedValue;
  }

  const publicBaseUrl = normalizeBaseUrl(import.meta.env.VITE_R2_PUBLIC_BASE_URL);

  if (!publicBaseUrl) {
    return undefined;
  }

  return `${publicBaseUrl}/${normalizeStoragePath(trimmedValue)}`;
};
