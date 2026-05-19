import { type SystemCardUI } from "@bt/shared/context";
import {
  buildCourseLocationStateShared,
  buildSystemsUIShared,
  getCachedSystemsShared,
  getCachedUserCourseStatsShared,
  getSystemshared,
  getUserCourseStatsShared,
  trackCourseSelectionShared,
} from "@bt/shared/services";
import { capitalizeFirstLetter } from "@bt/shared/utils/capitalizeFirstLetter";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardActionArea,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { routeList } from "@src/context/configGlobal";
import { database, useSession } from "@src/hooks/index";
import * as loadingStyle from "@src/styles/screens/styleLoading";
import * as styles from "@src/styles/screens/styleExplorerScreen";
import { collection, doc, getDocs, increment, setDoc } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  AppBarNewHeader,
  BreadcrumbsBar,
  PageContainer,
  SectionHeader,
  SimpleGrid,
  SystemCover,
  VirtualizedList,
} from "@src/components/index";
import type { UserCourseStatDoc } from "@bt/shared/services";

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const scoreField = (field: string | undefined, query: string, weight: number) => {
  if (!field) return 0;
  const normalizedField = normalizeText(field);
  if (normalizedField.startsWith(query)) return weight * 2;
  if (normalizedField.includes(query)) return weight;
  return 0;
};

const scoreSystem = (system: SystemCardUI, query: string) => {
  if (!query) return 0;
  return (
    scoreField(system.name, query, 4) +
    scoreField(system.label, query, 3) +
    scoreField(system.coach, query, 2.5) +
    scoreField(system.setSystem, query, 2) +
    scoreField(system.description, query, 1)
  );
};

const formatCoachName = (value?: string | null) =>
  value
    ?.split(/(\s+|&)/)
    .map((segment) =>
      /\s+/.test(segment) || segment === "&"
        ? segment
        : capitalizeFirstLetter(segment.toLowerCase()),
    )
    .join("") ?? "";

type ExplorerSortOrder = "" | "alphabetical" | "views" | "videos";

interface SystemCardProps {
  system: SystemCardUI;
  isVisited?: boolean;
  progressLabel?: string | null;
  progressPercentage?: number;
  onClick: () => void;
}

function SystemCard({
  system,
  isVisited = false,
  progressLabel,
  progressPercentage = 0,
  onClick,
}: SystemCardProps) {
  return (
    <Card sx={styles.systemCard}>
      <CardActionArea onClick={onClick}>
        <Box sx={styles.cardMedia}>
          <SystemCover
            title={capitalizeFirstLetter(system.name)}
            subtitle={capitalizeFirstLetter(system.setSystem)}
            coach={formatCoachName(system.coach)}
            coverUrl={system.coverUrl}
            videoCount={system.videoCount}
            showVisitedIndicator={isVisited}
            variant="card"
          />
        </Box>
        {progressLabel ? (
          <Box sx={styles.progressFooter}>
            <Typography variant="body2" sx={styles.progressLabel}>
              {progressLabel}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={styles.progressBar}
            />
          </Box>
        ) : null}
      </CardActionArea>
    </Card>
  );
}

interface SystemListItemProps {
  system: SystemCardUI;
  isVisited?: boolean;
  progressLabel?: string | null;
  progressPercentage?: number;
  onClick: () => void;
}

function SystemListItem({
  system,
  isVisited = false,
  progressLabel,
  progressPercentage = 0,
  onClick,
}: SystemListItemProps) {
  return (
    <Box
      sx={styles.mobileListItem}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter") onClick();
      }}
      role="button"
      tabIndex={0}
      aria-label={capitalizeFirstLetter(system.name)}
    >
      <Box sx={styles.mobileListMedia}>
        <SystemCover
          title={capitalizeFirstLetter(system.name)}
          subtitle={capitalizeFirstLetter(system.setSystem)}
          coach={formatCoachName(system.coach)}
          coverUrl={system.coverUrl}
          videoCount={system.videoCount}
          showVisitedIndicator={isVisited}
          variant="list"
        />
      </Box>
      {progressLabel ? (
        <Box sx={styles.mobileProgressFooter}>
          <Typography variant="body2" sx={styles.progressLabel}>
            {progressLabel}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progressPercentage}
            sx={styles.progressBar}
          />
        </Box>
      ) : null}
    </Box>
  );
}

export default function ExplorerScreen() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { t, i18n } = useTranslation();
  const { user } = useSession();
  const language = i18n.language.startsWith("en") ? "en" : "es";
  const textExplorer = "components.explorer.";
  const cachedSystemsData = getCachedSystemsShared(language);
  const cachedCatalog = useMemo(
    () => (cachedSystemsData ? buildSystemsUIShared(cachedSystemsData) : null),
    [cachedSystemsData],
  );
  const cachedUserStats = user?.email
    ? getCachedUserCourseStatsShared(user.email)
    : null;

  const [systems, setSystems] = useState<SystemCardUI[]>(
    () => cachedCatalog?.systems ?? [],
  );
  const [tagNavigation, setTagNavigation] = useState<string[]>(
    () => cachedCatalog?.tagNavigation ?? [],
  );
  const [loading, setLoading] = useState(!cachedCatalog);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<ExplorerSortOrder>("");
  const [visitedCourseLabels, setVisitedCourseLabels] = useState<string[]>(
    () =>
      cachedUserStats
        ? Array.from(cachedUserStats.values())
            .filter((stat) => Boolean(stat.watchedVideoIds?.length || stat.lastVideoAt))
            .map((stat) => stat.label)
        : [],
  );
  const [userCourseStatsMap, setUserCourseStatsMap] = useState<Map<string, UserCourseStatDoc>>(
    () => cachedUserStats ?? new Map(),
  );

  useEffect(() => {
    let mounted = true;

    const loadSystems = async () => {
      if (mounted) {
        setLoading(!cachedCatalog);
      }

      try {
        const systemsData = await getSystemshared(
          getDocs,
          collection,
          database,
          language,
        );
        const catalog = buildSystemsUIShared(systemsData);

        if (!mounted) {
          return;
        }

        setSystems(catalog.systems);
        setTagNavigation(catalog.tagNavigation);
      } catch (error) {
        console.error("Error cargando sistemas:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadSystems();

    return () => {
      mounted = false;
    };
  }, [language]);

  useEffect(() => {
    let mounted = true;

    const loadVisitedCourses = async () => {
      if (!user?.email) {
        if (mounted) {
          setVisitedCourseLabels([]);
        }
        return;
      }

      try {
        const statsMap = await getUserCourseStatsShared({
          email: user.email,
          firestore: {
            collection,
            database,
            getDocs,
          },
        });

        if (!mounted) {
          return;
        }

        setVisitedCourseLabels(
          Array.from(statsMap.values())
            .filter((stat) => Boolean(stat.watchedVideoIds?.length || stat.lastVideoAt))
            .map((stat) => stat.label),
        );
        setUserCourseStatsMap(statsMap);
      } catch (error) {
        console.error("No se pudieron cargar los cursos vistos del usuario:", error);
      }
    };

    void loadVisitedCourses();

    return () => {
      mounted = false;
    };
  }, [user?.email]);

  const rawQuery = useMemo(() => searchQuery.trim(), [searchQuery]);
  const normalizedQuery = useMemo(() => normalizeText(rawQuery), [rawQuery]);
  const hasActiveFilters = Boolean(normalizedQuery || selectedCategory || sortOrder);

  const searchSuggestions = useMemo(() => {
    const pool = new Set<string>();

    systems.forEach((system) => {
      if (system.name) pool.add(system.name);
      if (system.coach) pool.add(system.coach);
      if (system.setSystem) pool.add(system.setSystem);
    });

    return Array.from(pool).sort();
  }, [systems]);

  const systemsFiltrados = useMemo(() => {
    if (!hasActiveFilters) {
      return [] as SystemCardUI[];
    }

    const filtered = systems.filter((system) => {
      const matchesCategory = selectedCategory
        ? system.setSystem === selectedCategory
        : true;

      if (!normalizedQuery) {
        return matchesCategory;
      }

      const haystack = [
        system.name,
        system.coach,
        system.setSystem,
        system.label,
        system.description,
      ]
        .filter(Boolean)
        .join(" ");

      return matchesCategory && normalizeText(haystack).includes(normalizedQuery);
    });

    if (sortOrder === "alphabetical") {
      return filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (sortOrder === "views") {
      return filtered.sort(
        (a, b) =>
          (b.viewsCount ?? 0) - (a.viewsCount ?? 0) ||
          a.name.localeCompare(b.name),
      );
    }

    if (sortOrder === "videos") {
      return filtered.sort(
        (a, b) =>
          (b.videoCount ?? 0) - (a.videoCount ?? 0) ||
          a.name.localeCompare(b.name),
      );
    }

    if (!normalizedQuery) {
      return filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered
      .map((system) => ({
        ...system,
        score: scoreSystem(system, normalizedQuery),
      }))
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
      .map(({ score, ...system }) => system);
  }, [hasActiveFilters, normalizedQuery, selectedCategory, sortOrder, systems]);

  const visitedCourseSet = useMemo(
    () => new Set(visitedCourseLabels),
    [visitedCourseLabels],
  );
  const courseMetricsByLabel = useMemo(() => {
    const metrics = new Map<
      string,
      {
        progressPercentage: number;
        progressLabel: string | null;
      }
    >();

    systems.forEach((system) => {
      const stat = userCourseStatsMap.get(system.label);
      const watchedVideosCount = stat?.watchedVideoIds?.length ?? 0;
      const totalVideos = system.videoCount ?? 0;

      if (!watchedVideosCount || !totalVideos) {
        return;
      }

      const progressPercentage = Math.min(
        100,
        Math.round((watchedVideosCount / totalVideos) * 100),
      );

      metrics.set(system.label, {
        progressPercentage,
        progressLabel: t("components.home.progressLabel", {
          current: watchedVideosCount,
          percent: progressPercentage,
          total: totalVideos,
        }),
      });
    });

    return metrics;
  }, [systems, t, userCourseStatsMap]);

  const handleClear = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSortOrder("");
  };

  const handleNavigate = (item: SystemCardUI) => {
    if (user?.email) {
      void trackCourseSelectionShared({
        email: user.email,
        firestore: {
          database,
          doc,
          increment,
          setDoc,
        },
        source: "explorer",
        system: item,
      });
    }

    navigate(
      routeList.courseDetailScreen.replace(
        ":systemName",
        item.label + "-" + item.coach.replace(/ /g, "_"),
      ),
      {
        state: buildCourseLocationStateShared(item),
      },
    );
  };

  if (loading) {
    return (
      <Box sx={loadingStyle.loading}>
        <CircularProgress color="primary" size={60} />
      </Box>
    );
  }

  return (
    <Box sx={styles.screen}>
      <AppBarNewHeader />
      <PageContainer sx={{ pt: { xs: 2, md: 3 } }}>
        <BreadcrumbsBar items={[{ label: t(textExplorer + "breadcrumb") }]} />

        <SectionHeader
          title={t(textExplorer + "title")}
          subtitle={t(textExplorer + "subtitle")}
        />

        <Box sx={styles.heroCard}>
          <Box sx={styles.heroGlow} />

          <Box sx={styles.heroContent}>
            <Box sx={styles.heroCopy}>

              <Typography variant="h4" sx={styles.heroTitle}>
                {t(textExplorer + "heroTitle")}
              </Typography>

              <Typography sx={styles.heroDescription}>
                {t(textExplorer + "heroDescription")}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={styles.filtersRow}>
          <Autocomplete
            freeSolo
            options={searchSuggestions}
            inputValue={searchQuery}
            onInputChange={(_, value) => setSearchQuery(value)}
            filterOptions={(options, state) => {
              const value = normalizeText(state.inputValue.trim());
              if (!value) return options.slice(0, 8);

              return options
                .map((option) => ({
                  option,
                  score: scoreField(option, value, 1),
                }))
                .filter((item) => item.score > 0)
                .sort((a, b) => b.score - a.score)
                .slice(0, 8)
                .map((item) => item.option);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t(textExplorer + "searchLabel")}
                placeholder={t(textExplorer + "searchPlaceholder")}
                sx={styles.searchField}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                  endAdornment: (
                    <>
                      {searchQuery ? (
                        <IconButton size="small" onClick={() => setSearchQuery("")}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          <FormControl sx={styles.selectField}>
            <InputLabel id="category-select-label">
              {t(textExplorer + "categoryLabel")}
            </InputLabel>
            <Select
              labelId="category-select-label"
              label={t(textExplorer + "categoryLabel")}
              value={selectedCategory}
              onChange={(event) =>
                setSelectedCategory(event.target.value as string)
              }
            >
              <MenuItem value="">{t(textExplorer + "allCategories")}</MenuItem>
              {tagNavigation.map((tag) => (
                <MenuItem key={tag} value={tag}>
                  {tag}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={styles.sortField}>
            <InputLabel id="sort-select-label">
              {t(textExplorer + "sortLabel")}
            </InputLabel>
            <Select
              labelId="sort-select-label"
              label={t(textExplorer + "sortLabel")}
              value={sortOrder}
              onChange={(event) =>
                setSortOrder(event.target.value as ExplorerSortOrder)
              }
            >
              <MenuItem value="">{t(textExplorer + "sortPlaceholder")}</MenuItem>
              <MenuItem value="alphabetical">
                {t(textExplorer + "sortAlphabetical")}
              </MenuItem>
              <MenuItem value="views">{t(textExplorer + "sortViews")}</MenuItem>
              <MenuItem value="videos">{t(textExplorer + "sortVideos")}</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="text"
            onClick={handleClear}
            disabled={!searchQuery && !selectedCategory && !sortOrder}
            sx={{ alignSelf: { xs: "flex-start", md: "center" } }}
          >
            {t(textExplorer + "clearFilters")}
          </Button>
        </Box>

        {hasActiveFilters ? (
          <Typography variant="body2" sx={styles.resultsMeta}>
            {t(textExplorer + "resultsLoaded", { count: systemsFiltrados.length })}
          </Typography>
        ) : null}

        {!hasActiveFilters ? (
          <Box sx={styles.emptyState}>
            <Typography variant="h6" sx={styles.emptyStateTitle}>
              {t(textExplorer + "idleTitle")}
            </Typography>
            <Typography variant="body2" sx={styles.emptyStateDescription}>
              {t(textExplorer + "idleDescription")}
            </Typography>
          </Box>
        ) : systemsFiltrados.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t(textExplorer + "emptyResults")}
          </Typography>
        ) : isMobile ? (
          <VirtualizedList
            items={systemsFiltrados}
            itemHeight={styles.mobileItemHeight}
            height="60vh"
            contentPadding={8}
            renderItem={(item) => (
              <SystemListItem
                key={item.label}
                system={item}
                isVisited={visitedCourseSet.has(item.label)}
                progressLabel={courseMetricsByLabel.get(item.label)?.progressLabel ?? null}
                progressPercentage={
                  courseMetricsByLabel.get(item.label)?.progressPercentage ?? 0
                }
                onClick={() => handleNavigate(item)}
              />
            )}
          />
        ) : (
          <SimpleGrid columns={{ xs: 1, md: 2 }} gap={3}>
            {systemsFiltrados.map((item) => (
              <SystemCard
                key={item.label}
                system={item}
                isVisited={visitedCourseSet.has(item.label)}
                progressLabel={courseMetricsByLabel.get(item.label)?.progressLabel ?? null}
                progressPercentage={
                  courseMetricsByLabel.get(item.label)?.progressPercentage ?? 0
                }
                onClick={() => handleNavigate(item)}
              />
            ))}
          </SimpleGrid>
        )}
      </PageContainer>
    </Box>
  );
}
