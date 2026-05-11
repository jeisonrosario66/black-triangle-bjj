import React, { useMemo } from "react";
import {
  Tabs,
  Tab,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
} from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

import { useUIStore } from "@src/store/index";
import { iconsMap } from "@src/components/index";
import type { GraphLink, NodeViewData } from "@src/context/index";
import { capitalizeFirstLetter, isSpecialGraphUser } from "@src/utils/index";
import { useSession } from "@src/hooks";

import themeApp from "@src/styles/stylesThemeApp";

const textHardcoded = "components.nodeConnectionViewer.";

interface NodeConnectionViewerProps {
  nodeId: number;
  valueLinks?: string;
  valueNodes?: string;
  onSelectNode?: (node: NodeViewData) => void;
}

const getLinkEndpointId = (endpoint: GraphLink["source"] | GraphLink["target"]) =>
  typeof endpoint === "number" ? endpoint : endpoint?.id;

const buildUniqueNodeList = (
  ids: number[],
  nodeById: Map<number, NodeViewData>,
) => {
  const seenIds = new Set<number>();

  return ids.reduce<NodeViewData[]>((result, id) => {
    if (seenIds.has(id)) {
      return result;
    }

    const node = nodeById.get(id);

    if (!node) {
      return result;
    }

    seenIds.add(id);
    result.push(node);
    return result;
  }, []);
};

export default function NodeConnectionViewer({
  nodeId,
  valueLinks,
  valueNodes,
  onSelectNode,
}: NodeConnectionViewerProps) {
  const { t } = useTranslation();
  const { user } = useSession();
  const linkData = useUIStore((state) => state.linksData);
  const documentsFirestore = useUIStore((state) => state.documentsFirestore);
  const activeTabState = useUIStore(
    (state) => state.connectionViewerActiveStep,
  );
  const canSeeNodeIds = isSpecialGraphUser(user);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    useUIStore.setState((state) => ({
      connectionViewerActiveStep:
        state.connectionViewerActiveStep === newValue ? null : newValue,
    }));
  };

  const nodeById = useMemo(
    () =>
      new Map(
        documentsFirestore
          .filter((node) => !valueNodes || node.valueNodes === valueNodes)
          .map((node) => [node.id, node]),
      ),
    [documentsFirestore, valueNodes],
  );
  const scopedLinks = useMemo(
    () =>
      valueLinks
        ? linkData.filter((link) => link.valueLinks === valueLinks)
        : linkData,
    [linkData, valueLinks],
  );

  const sourceNodes = useMemo(() => {
    const targetIds = scopedLinks
      .filter((link) => getLinkEndpointId(link.source) === nodeId)
      .map((link) => getLinkEndpointId(link.target))
      .filter((id): id is number => typeof id === "number");

    return buildUniqueNodeList(targetIds, nodeById);
  }, [nodeById, nodeId, scopedLinks]);

  const targetNodes = useMemo(() => {
    const sourceIds = scopedLinks
      .filter((link) => getLinkEndpointId(link.target) === nodeId)
      .map((link) => getLinkEndpointId(link.source))
      .filter((id): id is number => typeof id === "number");

    return buildUniqueNodeList(sourceIds, nodeById);
  }, [nodeById, nodeId, scopedLinks]);

  const openNode = (node: NodeViewData) => {
    if (onSelectNode) {
      onSelectNode(node);
      return;
    }

    useUIStore.setState({ nodeViewData: node });
  };

  const renderNodeList = (nodes: NodeViewData[], emptyText: string) => {
    if (nodes.length === 0) {
      return (
        <Typography variant="body2" sx={{ color: "text.secondary", px: 0.5 }}>
          {emptyText}
        </Typography>
      );
    }

    return (
      <List dense sx={{ py: 0 }}>
        {nodes.map((node, index) => {
          const key = capitalizeFirstLetter(node.group || "groupEmpty");
          const IconComponent = iconsMap[key] || iconsMap.default;

          return (
            <React.Fragment key={`${node.id}-${index}`}>
              <ListItemButton
                onClick={() => openNode(node)}
                sx={{
                  borderRadius: 2,
                  px: 1.25,
                  py: 0.8,
                  "& .MuiListItemText-primary, & .MuiListItemText-secondary": {
                    fontSize: "0.76rem",
                    fontFamily: themeApp.palette.typography.fontFamily,
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 34 }}>
                  <IconComponent color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    node.name ||
                    (canSeeNodeIds
                      ? `${t(textHardcoded + "node")} ${node.id}`
                      : t(textHardcoded + "node"))
                  }
                  secondary={node.group || t(textHardcoded + "groupEmpty")}
                />
              </ListItemButton>
              {index < nodes.length - 1 ? <Divider variant="inset" /> : null}
            </React.Fragment>
          );
        })}
      </List>
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        "& .MuiTab-root": {
          fontSize: "0.8rem",
          fontFamily: themeApp.palette.typography.fontFamily,
        },
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={activeTabState ?? false}
          onChange={handleChange}
          aria-label="Node connection viewer tabs"
          centered
        >
          <Tab
            icon={<ArrowBack />}
            iconPosition="start"
            label={`${t(textHardcoded + "targetLabel")} (${targetNodes.length})`}
            id="tab-0"
            aria-controls="tabpanel-0"
            onClick={() => {
              if (activeTabState === 0) {
                useUIStore.setState({ connectionViewerActiveStep: null });
              }
            }}
          />
          <Tab
            icon={<ArrowForward />}
            iconPosition="end"
            label={`${t(textHardcoded + "sourceLabel")} (${sourceNodes.length})`}
            id="tab-1"
            aria-controls="tabpanel-1"
            onClick={() => {
              if (activeTabState === 1) {
                useUIStore.setState({ connectionViewerActiveStep: null });
              }
            }}
          />
        </Tabs>
      </Box>

      {activeTabState === 0 ? (
        <Box role="tabpanel" id="tabpanel-0" aria-labelledby="tab-0" sx={{ pt: 1.5 }}>
          {renderNodeList(targetNodes, t(textHardcoded + "targetLinksLabel"))}
        </Box>
      ) : null}

      {activeTabState === 1 ? (
        <Box role="tabpanel" id="tabpanel-1" aria-labelledby="tab-1" sx={{ pt: 1.5 }}>
          {renderNodeList(sourceNodes, t(textHardcoded + "sourceLinksLabel"))}
        </Box>
      ) : null}
    </Box>
  );
}
