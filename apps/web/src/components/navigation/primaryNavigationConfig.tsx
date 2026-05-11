import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded";
import type { ReactNode } from "react";

import { routeList } from "@src/context/index";

export type PrimaryNavigationValue = "home" | "explorer" | "explorer3d";

export interface PrimaryNavigationItem {
  value: PrimaryNavigationValue;
  labelKey: string;
  to: string;
  icon: ReactNode;
  matchPaths: string[];
}

export const primaryNavigationItems: PrimaryNavigationItem[] = [
  {
    value: "home",
    labelKey: "components.primaryNavigation.home",
    to: routeList.home,
    icon: <HomeRoundedIcon />,
    matchPaths: [routeList.home],
  },
  {
    value: "explorer",
    labelKey: "components.primaryNavigation.list",
    to: routeList.explorerScreen,
    icon: <ViewListRoundedIcon />,
    matchPaths: [
      routeList.explorerScreen,
      routeList.courseDetailScreen,
      routeList.videoDetailScreen,
    ],
  },
  {
    value: "explorer3d",
    labelKey: "components.primaryNavigation.graph",
    to: routeList.explorerGraphScreen,
    icon: <HubRoundedIcon />,
    matchPaths: [routeList.explorerGraphScreen, routeList.nodeViewer],
  },
];
