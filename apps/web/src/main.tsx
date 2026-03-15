import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { muiTheme } from "../theme/theme.mui";
import App from "./App.tsx";
import "./index.css";

import "./i18n";

/**
 * Punto de entrada principal de la aplicación.
 * Inicializa React, configura Auth0, Router y monta el componente <App />.
 *
 * @returns {void}
 */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <BrowserRouter basename="/">
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
