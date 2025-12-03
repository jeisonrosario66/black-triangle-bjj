  import { SxProps } from "@mui/system";
  import themeApp from "@src/styles/stylesThemeApp";
  const theme = themeApp.palette;
  const formStyles = theme.formStyles;
  const textColor = theme.text;

  export const containerLogin: SxProps = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    height: "100vh",
    width: "100vw",
    backgroundColor: formStyles.containerBackgroundColor,
  };
  export const headerLogin: SxProps = {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    marginTop:"1rem"
  };

  export const cardLogin: SxProps = {
    backgroundColor: formStyles.cardBackgroundColor,
    width: "80%",
    maxWidth: "400px",
    borderRadius: "1rem",
    padding: "2rem",
    marginTop: "10px",
  };

  export const title: SxProps = {
    color: textColor.secondary,
    fontSize: "1.5rem",
    fontWeight: 700,
    marginBottom: "2rem",
    textAlign: "center",
    fontFamily: theme.typography.fontFamily,
  };

  export const loginButton: SxProps = {
    width: "100%",
    backgroundColor: formStyles.buttonForm,
    color: textColor.primary,
    padding: "0.5rem",
    borderRadius: "0.5rem",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    marginBottom: "1rem",
    marginTop: "0.5rem",
  };

  export const forgotPassword: SxProps = {
    textAlign: "center",
    fontSize: "0.875rem",
    color: textColor.secondary,
    marginBottom: "1rem",
  };

  export const googleButton: SxProps = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    width: "100%",
    padding: "0.5rem",
    border: `1px solid ${formStyles.borderColor}`,
    borderRadius: "0.5rem",
    backgroundColor: "#fff",
    cursor: "pointer",
    "& img": {
      width: "20px",
      height: "20px",
    },
  };

  export const googleText: SxProps = {
    color: textColor.secondary,
    fontWeight: "500",
    fontSize: "0.9rem",
  };
