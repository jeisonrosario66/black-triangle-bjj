import { editorialMedia, type SystemCardUI } from "@bt/shared/context";
import {
  buildCourseLocationStateShared,
  buildSystemsUIShared,
  getCachedUserCourseStatsShared,
  getCachedSystemsShared,
  getUserCourseStatsShared,
  getSystemshared,
  trackCourseSelectionShared,
} from "@bt/shared/services";
import { capitalizeFirstLetter } from "@bt/shared/utils/capitalizeFirstLetter";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
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
  MenuItem,
  Select,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { routeList } from "@src/context/configGlobal";
import { database, useSession } from "@src/hooks/index";
import * as styles from "@src/styles/screens/styleExplorerScreen";
import * as loadingStyle from "@src/styles/screens/styleLoading";
import {
  collection,
  doc,
  getDocs,
  increment,
  setDoc,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBarNewHeader,
  BreadcrumbsBar,
  EditorialImagePanel,
  PageContainer,
  SectionHeader,
  SimpleGrid,
  SystemCover,
  VirtualizedList,
} from "@src/components/index";

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

interface SystemCardProps {
  system: SystemCardUI;
  isVisited?: boolean;
  onClick: () => void;
}

function SystemCard({
  system,
  isVisited = false,
  onClick,
}: SystemCardProps) {
  return (
    <Card sx={styles.systemCard}>
      <CardActionArea onClick={onClick}>
        <Box sx={styles.cardMedia}>
          <SystemCover
            title={capitalizeFirstLetter(system.name)}
            subtitle={capitalizeFirstLetter(system.setSystem)}
            coach={capitalizeFirstLetter(system.coach)}
            coverUrl={system.coverUrl}
            videoCount={system.videoCount}
            showVisitedIndicator={isVisited}
            variant="card"
          />
        </Box>
      </CardActionArea>
    </Card>
  );
}

interface SystemListItemProps {
  system: SystemCardUI;
  isVisited?: boolean;
  onClick: () => void;
}

const language = "es";

function SystemListItem({
  system,
  isVisited = false,
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
          coach={capitalizeFirstLetter(system.coach)}
          coverUrl={system.coverUrl}
          videoCount={system.videoCount}
          showVisitedIndicator={isVisited}
          variant="list"
        />
      </Box>
    </Box>
  );
}

/**
 * Pantalla de exploración de sistemas en entorno web.
 * Orquesta la carga de sistemas desde Firestore mediante servicios compartidos,
 * gestiona el filtrado por búsqueda y categoría, y permite la navegación hacia
 * la vista de detalle del curso correspondiente.
 *
 * @returns {JSX.Element} Vista de listado de sistemas con filtros y navegación a detalle.
 */
export default function ExplorerScreen() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user } = useSession();
  const cachedSystemsData = getCachedSystemsShared(language);
  const cachedUserStats = user?.email
    ? getCachedUserCourseStatsShared(user.email)
    : null;
  const initialExplorerData = cachedSystemsData
    ? buildSystemsUIShared(cachedSystemsData)
    : null;

  const [systems, setSystems] = useState<SystemCardUI[]>(
    () => initialExplorerData?.systems ?? [],
  );
  const [tagNavigation, setTagNavigation] = useState<string[]>(
    () => initialExplorerData?.tagNavigation ?? [],
  );
  const [loading, setLoading] = useState(!initialExplorerData);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [visitedCourseLabels, setVisitedCourseLabels] = useState<string[]>(
    () =>
      cachedUserStats
        ? Array.from(cachedUserStats.values())
            .filter((stat) => Boolean(stat.watchedVideoIds?.length || stat.lastVideoAt))
            .map((stat) => stat.label)
        : [],
  );

  useEffect(() => {
    const loadSystems = async () => {
      try {
        const data = await getSystemshared(getDocs, collection, database, language);
        const explorerData = buildSystemsUIShared(data);
        setSystems(explorerData.systems);
        setTagNavigation(explorerData.tagNavigation);
      } catch (error) {
        console.error("Error cargando sistemas:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSystems();
  }, []);

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
  const normalizedQuery = useMemo(
    () => normalizeText(rawQuery),
    [rawQuery],
  );

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
    const query = normalizedQuery;

    const filtered = systems.filter((system) => {
      const matchesCategory = selectedCategory
        ? system.setSystem === selectedCategory
        : true;

      if (!query) return matchesCategory;

      const haystack = [
        system.name,
        system.coach,
        system.setSystem,
        system.label,
        system.description,
      ]
        .filter(Boolean)
        .join(" ");

      return matchesCategory && normalizeText(haystack).includes(query);
    });

    if (!query) {
      return filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    const scored = filtered.map((system) => ({
      ...system,
      score: scoreSystem(system, query),
    }));

    return scored
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
      .map(({ score, ...system }) => system);
  }, [systems, selectedCategory, normalizedQuery]);

  const visitedCourseSet = useMemo(
    () => new Set(visitedCourseLabels),
    [visitedCourseLabels],
  );

  const handleClear = () => {
    setSearchQuery("");
    setSelectedCategory("");
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
        <BreadcrumbsBar items={[{ label: "Explorar" }]} />

        <SectionHeader
          title="Explorar Sistemas"
          subtitle="Busca por técnica, coach o sistema"
        />

        <EditorialImagePanel
          src={editorialMedia.explorerHero.src}
          alt="Explorar sistemas de BJJ"
          eyebrow="Black Triangle"
          title="Busca por sistema, coach o técnica"
          description="Encuentra rutas de estudio más claras con una exploración visual más guiada."
          objectPosition={editorialMedia.explorerHero.objectPosition}
          sx={styles.heroVisual}
        />

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
                label="Buscar técnicas, coach o sistema"
                placeholder="Ej: guard pass, De La Riva"
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
                        <IconButton
                          size="small"
                          onClick={() => setSearchQuery("")}
                        >
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
            <InputLabel id="category-select-label">Categoría</InputLabel>
            <Select
              labelId="category-select-label"
              label="Categoría"
              value={selectedCategory}
              onChange={(event) =>
                setSelectedCategory(event.target.value as string)
              }
            >
              <MenuItem value="">Todas</MenuItem>
              {tagNavigation.map((tag) => (
                <MenuItem key={tag} value={tag}>
                  {tag}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="text"
            onClick={handleClear}
            disabled={!searchQuery && !selectedCategory}
            sx={{ alignSelf: { xs: "flex-start", md: "center" } }}
          >
            Limpiar filtros
          </Button>
        </Box>

        <Typography variant="body2" sx={styles.resultsMeta}>
          {systemsFiltrados.length} resultados
        </Typography>

        {systemsFiltrados.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No encontramos resultados con esos filtros.
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
                onClick={() => handleNavigate(item)}
              />
            ))}
          </SimpleGrid>
        )}
      </PageContainer>
    </Box>
  );
}
