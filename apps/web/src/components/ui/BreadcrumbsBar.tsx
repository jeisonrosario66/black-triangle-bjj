import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import {
  Box,
  Breadcrumbs,
  Link,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useMemo } from "react";

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbsBarProps {
  items: BreadcrumbItem[];
}

/**
 * Breadcrumbs ligeros para el flujo de aprendizaje.
 * En móvil reduce el número de elementos para evitar ruido visual.
 */
export default function BreadcrumbsBar({ items }: BreadcrumbsBarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const visibleItems = useMemo(() => {
    if (!isMobile || items.length <= 2) return items;
    return [items[0], items[items.length - 1]];
  }, [isMobile, items]);

  return (
    <Box sx={{ mb: 2 }}>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
      >
        {visibleItems.map((item, index) => {
          const isLast = index === visibleItems.length - 1;
          if (isLast) {
            return (
              <Typography
                key={`${item.label}-${index}`}
                color="text.primary"
                variant="body2"
                sx={{ fontWeight: 600 }}
              >
                {item.label}
              </Typography>
            );
          }

          return (
            <Link
              key={`${item.label}-${index}`}
              color="inherit"
              underline="hover"
              variant="body2"
              onClick={item.onClick}
              sx={{ cursor: item.onClick ? "pointer" : "default" }}
            >
              {item.label}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
}
