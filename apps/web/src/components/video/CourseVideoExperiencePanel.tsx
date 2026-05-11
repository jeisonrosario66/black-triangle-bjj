import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
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
import { type ReactNode, useState } from "react";
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

interface CourseVideoExperiencePanelProps {
  experience: CourseVideoExperienceState;
  onSelectModule: (module: CourseVideoNode) => void;
  variant?: "page" | "dialog";
  tagItemsOverride?: TagItem[];
  metaExtra?: ReactNode;
  afterNavigation?: ReactNode;
}

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
  const { t } = useTranslation();
  const [navigationExpanded, setNavigationExpanded] = useState(true);
  const textVideoDetail = "components.videoDetail.";
  const textHardcoded = "components.nodeConnectionViewer.";
  const {
    currentNode,
    orderedModules,
    currentIndex,
    previousModule,
    nextModule,
    visitedModuleIds,
    viewsCount,
    isVideoPlayerActive,
    tagItems,
    startPlayback,
  } = experience;
  const resolvedTagItems = tagItemsOverride ?? tagItems;

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
        {isVideoPlayerActive ? (
          <Box
            component="iframe"
            src={`https://drive.google.com/file/d/${currentNode.videoid}/preview`}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={currentNode.name ?? t(textVideoDetail + "content")}
            sx={styles.videoIframe}
          />
        ) : (
          <Box sx={styles.videoPlaceholder}>
            <Typography variant="overline" sx={styles.videoPlaceholderEyebrow}>
              {t(textVideoDetail + "playbackReady")}
            </Typography>
            <Typography variant="h5" sx={styles.videoPlaceholderTitle}>
              {capitalizeFirstLetter(currentNode.name ?? t(textVideoDetail + "content"))}
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<PlayArrowRoundedIcon />}
              onClick={startPlayback}
            >
              {t(textVideoDetail + "startPlayback")}
            </Button>
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
