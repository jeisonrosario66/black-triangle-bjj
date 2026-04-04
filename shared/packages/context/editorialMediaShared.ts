export const editorialMedia = {
  landingHero: {
    src: "/images/editorial/landing-hero-bjj-training.webp",
    objectPosition: "center 34%",
  },
  homeIntro: {
    src: "/images/editorial/home-intro-learning-journey.webp",
    objectPosition: "center 28%",
  },
  explorerHero: {
    src: "/images/editorial/explorer-hero-systems-study.webp",
    objectPosition: "center 32%",
  },
  courseContext: {
    src: "/images/editorial/course-detail-context-guard-study.webp",
    objectPosition: "center 30%",
  },
  videoContext: {
    src: "/images/editorial/video-detail-context-analysis.webp",
    objectPosition: "center 30%",
  },
} as const;

export type EditorialMediaKey = keyof typeof editorialMedia;
