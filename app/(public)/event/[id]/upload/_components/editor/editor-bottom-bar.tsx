"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ImageIcon, CameraRotateIcon } from "@phosphor-icons/react";
import { BorderItem } from "./frame-picker";

interface EditorBottomBarProps {
  allBorders: BorderItem[];
  selectedBorder: BorderItem;
  setSelectedBorder: (border: BorderItem) => void;
  cameraStream: MediaStream | null;
  capturePhoto: () => void;
  toggleCamera: () => void;
  handleGalleryImportClick: () => void;
  hasAllFilled: boolean;
  emptyCount: number;
}

export function EditorBottomBar({
  allBorders,
  selectedBorder,
  setSelectedBorder,
  cameraStream,
  capturePhoto,
  toggleCamera,
  handleGalleryImportClick,
  hasAllFilled,
  emptyCount,
}: EditorBottomBarProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const isClickingRef = React.useRef(false);
  const scrollTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Cached positions of slider items to avoid layout thrashing during scroll
  const itemOffsetsRef = React.useRef<
    { left: number; width: number; center: number }[]
  >([]);
  const containerWidthRef = React.useRef<number>(0);

  const measureItems = React.useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    containerWidthRef.current = container.offsetWidth;
    const children = container.children;
    const offsets = [];
    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement;
      const left = child.offsetLeft;
      const width = child.offsetWidth;
      offsets.push({
        left,
        width,
        center: left + width / 2,
      });
    }
    itemOffsetsRef.current = offsets;
  }, []);

  const updateScales = React.useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const containerWidth = containerWidthRef.current || container.offsetWidth;
    const containerCenter = container.scrollLeft + containerWidth / 2;

    const offsets = itemOffsetsRef.current;
    const children = container.children;

    // Fallback if measurement hasn't happened yet
    if (offsets.length === 0 && children.length > 0) {
      measureItems();
      return;
    }

    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement;
      const offset = offsets[i];
      if (!offset) continue;

      const diff = Math.abs(containerCenter - offset.center);

      // Max distance where scaling occurs (e.g. 60px)
      const maxDistance = 60;
      const distanceRatio = Math.min(diff / maxDistance, 1);

      // Scale goes from 1.35 (active) down to 1.0 (inactive)
      const scale = 1.35 - (1.35 - 1.0) * distanceRatio;
      // Opacity goes from 1.0 (active) down to 0.5 (inactive)
      const opacity = 1.0 - (1.0 - 0.5) * distanceRatio;

      const circle = child.querySelector(
        ".frame-circle-inner",
      ) as HTMLElement | null;
      if (circle) {
        // scale3d enables hardware acceleration on GPU
        circle.style.transform = `scale3d(${scale}, ${scale}, 1)`;
        circle.style.opacity = `${opacity}`;
      }
    }
  }, [measureItems]);

  const selectBorderAndScroll = (border: BorderItem, index: number) => {
    isClickingRef.current = true;
    setSelectedBorder(border);
    const container = scrollContainerRef.current;
    if (container) {
      const child = container.children[index] as HTMLElement;
      if (child) {
        child.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }

    // Keep updating scales during smooth scrolling animation (60fps animation loop)
    let frameId: number;
    const animate = () => {
      updateScales();
      if (isClickingRef.current) {
        frameId = requestAnimationFrame(animate);
      }
    };
    frameId = requestAnimationFrame(animate);

    setTimeout(() => {
      isClickingRef.current = false;
      cancelAnimationFrame(frameId);
      updateScales();
    }, 450);
  };

  const handleScroll = () => {
    updateScales();

    if (isClickingRef.current) return;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const containerWidth = containerWidthRef.current || container.offsetWidth;
      const containerCenter = container.scrollLeft + containerWidth / 2;
      let closestIndex = 0;
      let minDiff = Infinity;

      const offsets = itemOffsetsRef.current;
      for (let i = 0; i < offsets.length; i++) {
        const offset = offsets[i];
        const diff = Math.abs(containerCenter - offset.center);
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = i;
        }
      }

      if (
        allBorders[closestIndex] &&
        selectedBorder.id !== allBorders[closestIndex].id
      ) {
        setSelectedBorder(allBorders[closestIndex]);
      }
    }, 80);
  };

  // Sync scroll position when active frame is changed from outside (e.g. template auto-change)
  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    measureItems();

    const index = allBorders.findIndex((b) => b.id === selectedBorder.id);
    if (index !== -1) {
      const child = container.children[index] as HTMLElement;
      if (child) {
        const containerCenter =
          container.scrollLeft + container.offsetWidth / 2;
        const childCenter = child.offsetLeft + child.offsetWidth / 2;
        if (Math.abs(containerCenter - childCenter) > 10) {
          child.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
          });
        }
      }
    }

    const timer = setTimeout(updateScales, 400);
    return () => clearTimeout(timer);
  }, [selectedBorder.id, allBorders, updateScales, measureItems]);

  // Initial and window resize listeners for scale updating
  React.useEffect(() => {
    const timer = setTimeout(() => {
      measureItems();
      updateScales();
    }, 200);

    const handleResize = () => {
      measureItems();
      updateScales();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [updateScales, measureItems]);

  return (
    <div className="shrink-0 pb-safe-bottom bg-black">
      {/* Hint */}
      <p
        className={cn(
          "text-center text-[10px] mb-1.5 transition-all",
          !hasAllFilled ? "text-zinc-500 animate-pulse" : "text-zinc-600",
        )}
      >
        {!hasAllFilled
          ? `${emptyCount} slot${emptyCount > 1 ? "s" : ""} remaining — tap center to add`
          : "Drag to reposition · Pinch or scroll to zoom"}
      </p>

      {/* Integrated bottom action bar with frame picker slider */}
      <div className="flex items-center justify-between px-4 py-4 border-t border-zinc-900 bg-black/85 backdrop-blur-md shrink-0 relative h-28 overflow-hidden select-none animate-fade-in">
        {/* Bottom Left: Gallery Import */}
        <div className="z-10 w-16 flex justify-start">
          <button
            type="button"
            onClick={handleGalleryImportClick}
            className="flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-white active:text-white active:scale-95 transition-all cursor-pointer select-none"
          >
            <div className="size-11 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-850 transition-colors">
              <ImageIcon className="size-5" />
            </div>
          </button>
        </div>

        {/* Bottom Center: Sliding Frame Picker + Capture Shutter Button */}
        <div className="flex-1 min-w-0 relative h-full flex items-center justify-center z-10">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="w-full h-full overflow-x-auto scrollbar-none snap-x snap-mandatory flex items-center gap-2 px-[calc(50%-28px)]"
            style={{
              maskImage:
                "linear-gradient(to right, transparent, white 25%, white 75%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, white 25%, white 75%, transparent)",
            }}
          >
            {allBorders.map((border, idx) => {
              const proxied = border.imageUrl
                ? `/api/proxy-image?url=${encodeURIComponent(border.imageUrl)}`
                : "";
              return (
                <div
                  key={border.id}
                  className="w-14 flex-shrink-0 snap-center flex flex-col items-center justify-center"
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedBorder.id === border.id) {
                        capturePhoto();
                      } else {
                        selectBorderAndScroll(border, idx);
                      }
                    }}
                    disabled={!cameraStream}
                    className="frame-circle-inner size-11 rounded-full border border-zinc-800 bg-zinc-900/40 flex items-center justify-center transition-colors duration-200 select-none cursor-pointer will-change-transform disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ transform: "scale3d(1, 1, 1)", opacity: 0.5 }}
                  >
                    <div className="size-10 rounded-full overflow-hidden flex items-center justify-center bg-zinc-800">
                      {proxied ? (
                        <img
                          src={proxied}
                          alt=""
                          className="object-contain w-full h-full"
                          draggable={false}
                        />
                      ) : (
                        <span className="text-sm">📸</span>
                      )}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Static Capture Ring overlay (always in the center, doesn't scroll) */}
        <div className="absolute pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-16 rounded-full border-[3px] border-white z-20 bg-transparent flex items-center justify-center shadow-lg" />

        {/* Bottom Right: Flip Camera */}
        <div className="z-10 w-16 flex justify-end">
          <button
            type="button"
            onClick={toggleCamera}
            disabled={!cameraStream}
            className="flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-white active:text-white active:scale-95 transition-all cursor-pointer disabled:opacity-40 select-none"
          >
            <div className="size-11 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-850 transition-colors">
              <CameraRotateIcon className="size-5" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
