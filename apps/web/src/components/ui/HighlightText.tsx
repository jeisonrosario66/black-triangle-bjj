import { Box } from "@mui/material";

interface HighlightTextProps {
  text: string;
  query: string;
}

/**
 * Resalta coincidencias de búsqueda sin usar HTML peligroso.
 */
export default function HighlightText({ text, query }: HighlightTextProps) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return <>{text}</>;
  }

  const normalizedText = text.toLowerCase();
  const matchIndex = normalizedText.indexOf(normalizedQuery);

  if (matchIndex === -1) {
    return <>{text}</>;
  }

  const before = text.slice(0, matchIndex);
  const match = text.slice(matchIndex, matchIndex + query.length);
  const after = text.slice(matchIndex + query.length);

  return (
    <>
      {before}
      <Box
        component="span"
        sx={{
          backgroundColor: "rgba(30, 58, 138, 0.12)",
          borderRadius: 1,
          px: 0.4,
        }}
      >
        {match}
      </Box>
      {after}
    </>
  );
}
