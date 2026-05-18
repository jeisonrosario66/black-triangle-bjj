export const srtToVtt = (input: string) => {
  const normalizedInput = input.replace(/^\uFEFF/, "").replace(/\r+/g, "");

  if (normalizedInput.startsWith("WEBVTT")) {
    return normalizedInput;
  }

  const vttBody = normalizedInput.replace(
    /(\d{2}:\d{2}:\d{2}),(\d{3})/g,
    "$1.$2",
  );

  return `WEBVTT\n\n${vttBody}`;
};
