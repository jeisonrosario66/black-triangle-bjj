import themeApp from "@src/styles/stylesThemeApp";
const theme = themeApp;

const containerBoxStep: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  alignItems: "center",
};

const formPosition: React.CSSProperties = {
  backgroundColor: "#f1f1f1",
  padding: 20,
  borderRadius: 2,
  border: "1px solid #ccc",
  marginTop: "20px",
};

const formLabel: React.CSSProperties = {
  color: theme.palette.text.secondary,
};
export { containerBoxStep, formPosition, formLabel };
