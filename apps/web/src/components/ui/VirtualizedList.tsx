import { Box } from "@mui/material";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  height: number | string;
  overscan?: number;
  contentPadding?: number;
  renderItem: (item: T, index: number) => ReactNode;
}

/**
 * Lista virtualizada liviana con altura fija por item.
 * Pensada para mobile: reduce render en listas largas.
 */
export default function VirtualizedList<T>({
  items,
  itemHeight,
  height,
  overscan = 4,
  contentPadding = 0,
  renderItem,
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const handleScroll = () => setScrollTop(node.scrollTop);
    const resizeObserver = new ResizeObserver(() =>
      setContainerHeight(node.clientHeight),
    );

    resizeObserver.observe(node);
    node.addEventListener("scroll", handleScroll);

    setContainerHeight(node.clientHeight);

    return () => {
      resizeObserver.disconnect();
      node.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const totalHeight = items.length * itemHeight;

  const { startIndex, endIndex } = useMemo(() => {
    if (!containerHeight) {
      return { startIndex: 0, endIndex: Math.min(items.length - 1, 10) };
    }

    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight) + overscan * 2;
    const end = Math.min(items.length - 1, start + visibleCount);

    return { startIndex: start, endIndex: end };
  }, [scrollTop, containerHeight, itemHeight, overscan, items.length]);

  const offsetTop = startIndex * itemHeight;
  const visibleItems = items.slice(startIndex, endIndex + 1);

  return (
    <Box
      ref={containerRef}
      sx={{
        height,
        overflowY: "auto",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "outlineVariant",
        backgroundColor: "background.paper",
      }}
    >
      <Box sx={{ height: totalHeight + contentPadding * 2, position: "relative" }}>
        <Box
          sx={{
            position: "absolute",
            top: offsetTop + contentPadding,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) =>
            renderItem(item, startIndex + index),
          )}
        </Box>
      </Box>
    </Box>
  );
}
