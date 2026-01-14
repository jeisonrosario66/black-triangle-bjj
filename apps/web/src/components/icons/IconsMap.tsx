// src/components/icons/IconsMap.tsx
import {
  GuardIcon,
  ControlIcon,
  PassIcon,
  SubmissionIcon,
  TachiWazaIcon,
  DefenseIcon,
  SystemIcon,
  SwitchIcon,
  TransitionIcon,
} from "./IconsGroup";

const iconsMap: Record<string, React.FC<{ color: string }>> = {
  Guard: GuardIcon,
  Control: ControlIcon,
  Pass: PassIcon,
  Submission: SubmissionIcon,
  TachiWaza: TachiWazaIcon,
  Defense: DefenseIcon,
  System: SystemIcon,
  Switch: SwitchIcon,
  Transition: TransitionIcon,
  default: SystemIcon,
};

export default iconsMap;
