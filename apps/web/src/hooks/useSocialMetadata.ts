import { useEffect } from "react";
import type { SeoMetadata } from "@src/utils/seo";
import { applySeoMetadata } from "@src/utils/seo";

export const useSocialMetadata = ({
  title,
  description,
  image,
  url,
  type,
  locale,
}: SeoMetadata) => {
  useEffect(() => {
    applySeoMetadata({ title, description, image, url, type, locale });
  }, [description, image, locale, title, type, url]);
};

export default useSocialMetadata;
