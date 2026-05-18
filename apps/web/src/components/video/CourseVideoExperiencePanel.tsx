import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import QueuePlayNextRoundedIcon from "@mui/icons-material/QueuePlayNextRounded";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type { CourseVideoExperienceState, CourseVideoNode } from "@src/hooks/useCourseVideoExperience";
import {
  DescriptionList,
  ModuleList,
  TagList,
} from "@src/components/index";
import type { TagItem } from "@src/components/ui/TagList";
import * as styles from "@src/styles/screens/styleVideoDetailScreen";
import { formatCompactNumber } from "@bt/shared/utils";
import { capitalizeFirstLetter } from "@src/utils";
import { resolveStorageAssetUrl } from "@src/utils/resolveStorageAssetUrl";
import { srtToVtt } from "@src/utils/srtToVtt";

interface CourseVideoExperiencePanelProps {
  experience: CourseVideoExperienceState;
  onSelectModule: (module: CourseVideoNode) => void;
  variant?: "page" | "dialog";
  tagItemsOverride?: TagItem[];
  metaExtra?: ReactNode;
  afterNavigation?: ReactNode;
}

type ResolvedSubtitleTrack = {
  src: string;
  srcLang: "es" | "en";
  label: string;
};

const resolveStyle = (
  theme: Theme,
  sx: unknown,
): SystemStyleObject<Theme> => {
  if (!sx) {
    return {};
  }

  if (typeof sx === "function") {
    return sx(theme);
  }

  if (Array.isArray(sx)) {
    return sx.reduce<SystemStyleObject<Theme>>((accumulator, currentValue) => {
      if (!currentValue) {
        return accumulator;
      }

      return {
        ...accumulator,
        ...resolveStyle(theme, currentValue),
      };
    }, {});
  }

  return sx as SystemStyleObject<Theme>;
};

export default function CourseVideoExperiencePanel({
  experience,
  onSelectModule,
  variant = "page",
  tagItemsOverride,
  metaExtra,
  afterNavigation,
}: CourseVideoExperiencePanelProps) {
  const { t, i18n } = useTranslation();
  const [navigationExpanded, setNavigationExpanded] = useState(true);
  const textVideoDetail = "components.videoDetail.";
  const textHardcoded = "components.nodeConnectionViewer.";
  const preferredLanguage = i18n.language.startsWith("en") ? "en" : "es";
  const {
    currentNode,
    orderedModules,
    currentIndex,
    previousModule,
    nextModule,
    visitedModuleIds,
    viewsCount,
    tagItems,
    onVideoPlay,
  } = experience;
  const resolvedTagItems = tagItemsOverride ?? tagItems;
  const resolvedVideoUrl = useMemo(
    () => resolveStorageAssetUrl(currentNode?.videoid),
    [currentNode?.videoid],
  );
  const [subtitleTracks, setSubtitleTracks] = useState<ResolvedSubtitleTrack[]>([]);

  useEffect(() => {
    if (!currentNode) {
      setSubtitleTracks([]);
      return;
    }

    const subtitleCandidates = [
      {
        label: t("components.header.languageSpanish"),
        srcLang: "es" as const,
        storageKey: currentNode.subtitleEs,
      },
      {
        label: t("components.header.languageEnglish"),
        srcLang: "en" as const,
        storageKey: currentNode.subtitleEn,
      },
    ].filter((candidate) => Boolean(candidate.storageKey));

    if (subtitleCandidates.length === 0) {
      setSubtitleTracks([]);
      return;
    }

    const abortController = new AbortController();
    const objectUrls: string[] = [];
    let cancelled = false;

    const loadSubtitleTracks = async () => {
      try {
        const resolvedTracks = await Promise.all(
          subtitleCandidates.map(async (candidate) => {
            const resolvedSubtitleUrl = resolveStorageAssetUrl(candidate.storageKey);

            if (!resolvedSubtitleUrl) {
              return null;
            }

            if (resolvedSubtitleUrl.toLowerCase().endsWith(".vtt")) {
              return {
                label: candidate.label,
                src: resolvedSubtitleUrl,
                srcLang: candidate.srcLang,
              } satisfies ResolvedSubtitleTrack;
            }

            const response = await fetch(resolvedSubtitleUrl, {
              signal: abortController.signal,
            });

            if (!response.ok) {
              throw new Error(`Subtitle request failed: ${response.status}`);
            }

            const subtitleText = await response.text();
            const objectUrl = URL.createObjectURL(
              new Blob([srtToVtt(subtitleText)], { type: "text/vtt" }),
            );

            objectUrls.push(objectUrl);

            return {
              label: candidate.label,
              src: objectUrl,
              srcLang: candidate.srcLang,
            } satisfies ResolvedSubtitleTrack;
          }),
        );

        if (!cancelled) {
          setSubtitleTracks(
            resolvedTracks.filter(
              (track): track is ResolvedSubtitleTrack => Boolean(track),
            ),
          );
        }
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }

        console.error("No se pudieron cargar los subtítulos del video:", error);

        if (!cancelled) {
          setSubtitleTracks([]);
        }
      }
    };

    void loadSubtitleTracks();

    return () => {
      cancelled = true;
      abortController.abort();
      objectUrls.forEach((objectUrl) => URL.revokeObjectURL(objectUrl));
    };
  }, [
    currentNode,
    currentNode?.id,
    currentNode?.subtitleEn,
    currentNode?.subtitleEs,
    t,
  ]);

  if (!currentNode) {
    return null;
  }

  return (
    <>
      <Box
        sx={(theme) => ({
          ...resolveStyle(theme, styles.videoFrame),
          ...(variant === "dialog"
            ? {
                width: "100%",
                marginLeft: 0,
                marginRight: 0,
                minHeight: { xs: 220, sm: "unset" },
              }
            : {}),
        })}
      >
        {resolvedVideoUrl ? (
          <Box
            component="video"
            src={resolvedVideoUrl}
            controls
            playsInline
            preload="metadata"
            crossOrigin="anonymous"
            onPlay={onVideoPlay}
            title={currentNode.name ?? t(textVideoDetail + "content")}
            sx={styles.videoPlayer}
          >
            {subtitleTracks.map((track) => (
              <track
                key={`${currentNode.id}-${track.srcLang}`}
                kind="subtitles"
                src={track.src}
                srcLang={track.srcLang}
                label={track.label}
                default={track.srcLang === preferredLanguage}
              />
            ))}
          </Box>
        ) : (
          <Box sx={styles.videoPlaceholder}>
            <Typography variant="overline" sx={styles.videoPlaceholderEyebrow}>
              {t(textVideoDetail + "playbackUnavailable")}
            </Typography>
            <Typography variant="h5" sx={styles.videoPlaceholderTitle}>
              {capitalizeFirstLetter(currentNode.name ?? t(textVideoDetail + "content"))}
            </Typography>
            <Typography sx={styles.videoPlaceholderDescription}>
              {t(textVideoDetail + "playbackUnavailableDescription")}
            </Typography>
          </Box>
        )}
      </Box>

      <Box
        sx={(theme) => ({
          ...resolveStyle(theme, styles.metaCard),
          ...(variant === "dialog"
            ? {
                marginTop: 2,
                padding: { xs: 2, md: 2.25 },
              }
            : {}),
        })}
      >
        <Box sx={styles.videoMetaRow}>
          <Typography variant="body2" sx={styles.viewsLabel}>
            {t(textVideoDetail + "viewsCount", {
              value: formatCompactNumber(viewsCount),
            })}
          </Typography>
        </Box>

        {resolvedTagItems.length > 0 ? (
          <Box sx={{ mb: metaExtra ? 1.5 : 2 }}>
            <TagList items={resolvedTagItems} />
          </Box>
        ) : null}

        {metaExtra}

        {currentNode.description?.summary ? (
          <Box sx={styles.descriptionBox}>
            <DescriptionList
              title={t(textHardcoded + "descriptionLabel")}
              summary={currentNode.description.summary}
              points={currentNode.description.points}
            />
          </Box>
        ) : null}
      </Box>

      {orderedModules.length > 0 ? (
        <Accordion
          expanded={navigationExpanded}
          onChange={() => setNavigationExpanded(!navigationExpanded)}
          sx={(theme) => ({
            ...resolveStyle(theme, styles.navigationAccordion),
            ...(variant === "dialog" ? { marginTop: 2 } : {}),
          })}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={styles.accordionSummary}
          >
            <QueuePlayNextRoundedIcon sx={{ mr: 1 }} />
            <Typography>
              {t(textVideoDetail + "courseVideos", {
                current: currentIndex >= 0 ? currentIndex + 1 : 1,
                total: orderedModules.length,
              })}
            </Typography>
          </AccordionSummary>

          <AccordionDetails>
            <Box sx={styles.navigationControls}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackRoundedIcon />}
                disabled={!previousModule}
                onClick={() => previousModule && onSelectModule(previousModule)}
              >
                {t(textVideoDetail + "previousVideo")}
              </Button>

              <Button
                variant="contained"
                endIcon={<ArrowForwardRoundedIcon />}
                disabled={!nextModule}
                onClick={() => nextModule && onSelectModule(nextModule)}
              >
                {t(textVideoDetail + "nextVideo")}
              </Button>
            </Box>

            <Divider sx={{ mb: 1.5 }} />

            <ModuleList
              modules={orderedModules}
              selectedModuleId={currentNode.id}
              visitedModuleIds={visitedModuleIds}
              onSelect={(module) => onSelectModule(module)}
            />
          </AccordionDetails>
        </Accordion>
      ) : null}

      {afterNavigation}
    </>
  );
}
