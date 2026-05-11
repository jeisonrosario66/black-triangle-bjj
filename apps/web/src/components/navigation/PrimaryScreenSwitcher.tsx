import { Box, ButtonBase, Typography } from "@mui/material";
import { matchPath, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  primaryNavigationItems,
  type PrimaryNavigationValue,
} from "@src/components/navigation/primaryNavigationConfig";
import * as styles from "@src/styles/navigation/stylePrimaryScreenSwitcher";

const resolveActiveNavigation = (
  pathname: string,
): PrimaryNavigationValue | null => {
  const match = primaryNavigationItems.find((item) =>
    item.matchPaths.some((pattern) =>
      Boolean(matchPath({ path: pattern, end: true }, pathname)),
    ),
  );

  return match?.value ?? null;
};

export const isPrimaryNavigationRoute = (pathname: string) =>
  resolveActiveNavigation(pathname) !== null;

export default function PrimaryScreenSwitcher({
  variant = "panel",
  onNavigate,
}: {
  variant?: "menu" | "panel";
  onNavigate?: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const activeNavigation = resolveActiveNavigation(location.pathname);

  if (!activeNavigation) {
    return null;
  }

  return (
    <Box sx={styles.switcherShell}>
      {primaryNavigationItems.map((item) => {
        const isActive = item.value === activeNavigation;

        return (
          <ButtonBase
            key={item.value}
            onClick={() => {
              navigate(item.to);
              onNavigate?.();
            }}
            sx={styles.switcherButton({ isActive, variant })}
            aria-current={isActive ? "page" : undefined}
            aria-label={t(item.labelKey)}
          >
            <Box sx={styles.switcherIcon({ isActive, variant })}>{item.icon}</Box>
            <Typography
              component="span"
              sx={styles.switcherLabel({ isActive, variant })}
            >
              {t(item.labelKey)}
            </Typography>
          </ButtonBase>
        );
      })}
    </Box>
  );
}
