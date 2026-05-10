const DRIVE_ID_PATTERN = /^[A-Za-z0-9_-]{20,}$/;

const extractDriveFileId = (value?: string) => {
  if (!value) return null;

  const trimmedValue = value.trim();
  if (!trimmedValue) return null;

  if (DRIVE_ID_PATTERN.test(trimmedValue)) {
    return trimmedValue;
  }

  const directIdMatch = trimmedValue.match(/[?&]id=([A-Za-z0-9_-]+)/);
  if (directIdMatch?.[1]) {
    return directIdMatch[1];
  }

  const filePathMatch = trimmedValue.match(/\/file\/d\/([A-Za-z0-9_-]+)/);
  if (filePathMatch?.[1]) {
    return filePathMatch[1];
  }

  const ucPathMatch = trimmedValue.match(/\/uc\?.*id=([A-Za-z0-9_-]+)/);
  if (ucPathMatch?.[1]) {
    return ucPathMatch[1];
  }

  return null;
};

export const resolveDriveImageUrl = (value?: string) => {
  if (!value) return undefined;

  const trimmedValue = value.trim();
  if (!trimmedValue) return undefined;

  const driveFileId = extractDriveFileId(trimmedValue);
  if (driveFileId) {
    return `https://drive.google.com/thumbnail?id=${driveFileId}&sz=w1600`;
  }

  return trimmedValue;
};
