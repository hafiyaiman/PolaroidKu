/* eslint-disable @next/next/no-img-element, @next/next/no-page-custom-font */
import * as React from "react";

// ── Date parsing & formatting helpers ─────────────────────────────────────────
export function parseEventDate(
  dateStr: string | undefined,
): { dayName: string; day: string; monthName: string; year: string } | null {
  if (!dateStr) return null;

  // Try direct parsing
  let d = new Date(dateStr);

  // If parsing fails, try formatting DD/MM/YYYY or YYYY-MM-DD manually
  if (isNaN(d.getTime())) {
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      d = new Date(year, month, day);
    }
  }

  if (isNaN(d.getTime())) return null;

  const days = ["AHAD", "ISNIN", "SELASA", "RABU", "KHAMIS", "JUMAAT", "SABTU"];
  const months = [
    "JAN",
    "FEB",
    "MAC",
    "APR",
    "MEI",
    "JUN",
    "JUL",
    "OGOS",
    "SEPT",
    "OKT",
    "NOV",
    "DIS",
  ];

  return {
    dayName: days[d.getDay()],
    day: d.getDate().toString(),
    monthName: months[d.getMonth()],
    year: d.getFullYear().toString(),
  };
}

export function getDateCaption(dateStr: string | undefined): string {
  const parsed = parseEventDate(dateStr);
  if (!parsed) return dateStr || "";
  return `${parsed.dayName} | ${parsed.day} | ${parsed.monthName} | ${parsed.year}`;
}

// ── Styled floral strip preview components ────────────────────────────────────
interface FramePreviewProps {
  eventName: string;
  eventDate: string;
  scaleX: number;
  scaleY: number;
  width: number;
  height: number;
}

export function PinkFloralFramePreview({
  eventName,
  eventDate,
  scaleX,
  scaleY,
}: FramePreviewProps) {
  const dateStr = getDateCaption(eventDate) || "SABTU | 7 | FEB | 2026";
  const displayNames = eventName || "Aiman & Hafiya";

  return (
    <div
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-20 flex flex-col justify-between"
      style={{
        background:
          "linear-gradient(135deg, #FFF5F6 0%, #FFEBEF 50%, #FFDFE6 100%)",
        padding: `${Math.round(5 * scaleY)}px`,
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap"
        rel="stylesheet"
      />

      <div
        className="absolute inset-0 border-pink-200 pointer-events-none"
        style={{
          margin: `${Math.round(5 * scaleX)}px`,
          borderWidth: `${Math.round(3.3 * scaleX)}px`,
        }}
      />

      <img
        src="/frames/pink_roses_corner.png"
        alt=""
        className="absolute top-0 left-0 pointer-events-none"
        style={{
          width: `${Math.round(60 * scaleX)}px`,
          height: `${Math.round(60 * scaleX)}px`,
          margin: `${Math.round(5 * scaleX)}px`,
        }}
      />
      <img
        src="/frames/pink_roses_corner.png"
        alt=""
        className="absolute top-0 right-0 pointer-events-none -scale-x-100"
        style={{
          width: `${Math.round(60 * scaleX)}px`,
          height: `${Math.round(60 * scaleX)}px`,
          margin: `${Math.round(5 * scaleX)}px`,
        }}
      />

      <div
        className="w-full flex flex-col items-center justify-center relative"
        style={{
          top: `${Math.round(15 * scaleY)}px`,
        }}
      >
        <span
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: `${Math.round(8.5 * scaleY)}px`,
            color: "#9D4E62",
            fontWeight: 800,
            letterSpacing: "0.15em",
          }}
        >
          RAIKAN CINTA
        </span>

        <span
          className="text-center truncate w-[85%] leading-none"
          style={{
            fontFamily:
              "'Great Vibes', cursive, 'Playfair Display', Georgia, serif",
            fontSize: `${Math.round(22 * scaleY)}px`,
            color: "#742A3A",
            marginTop: `${Math.round(6 * scaleY)}px`,
            textShadow: "0px 1px 1px rgba(255,255,255,0.6)",
          }}
        >
          {displayNames}
        </span>

        <div
          className="flex items-center justify-center w-[70%] border-y border-pink-200"
          style={{
            marginTop: `${Math.round(8 * scaleY)}px`,
            paddingTop: `${Math.round(3 * scaleY)}px`,
            paddingBottom: `${Math.round(3 * scaleY)}px`,
            borderTopWidth: "1px",
            borderBottomWidth: "1px",
          }}
        >
          <span
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: `${Math.round(8 * scaleY)}px`,
              color: "#9D4E62",
              fontWeight: 700,
              letterSpacing: "0.08em",
            }}
          >
            {dateStr}
          </span>
        </div>
      </div>

      <div
        className="w-full text-center relative"
        style={{
          bottom: `${Math.round(12 * scaleY)}px`,
        }}
      >
        <span
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: `${Math.round(7 * scaleY)}px`,
            color: "#9D4E62",
            fontWeight: 750,
            letterSpacing: "0.15em",
          }}
        >
          POLAROIDKU
        </span>
      </div>
    </div>
  );
}

export function BlueFloralFramePreview({
  eventName,
  eventDate,
  scaleX,
  scaleY,
}: FramePreviewProps) {
  const dateStr = getDateCaption(eventDate) || "SABTU | 7 | FEB | 2026";
  const displayNames = eventName || "Aiman & Hafiya";

  return (
    <div
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-20 flex flex-col justify-between"
      style={{
        background:
          "linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 50%, #DBEAFE 100%)",
        padding: `${Math.round(5 * scaleY)}px`,
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap"
        rel="stylesheet"
      />

      <div
        className="absolute inset-0 border-blue-200 pointer-events-none"
        style={{
          margin: `${Math.round(5 * scaleX)}px`,
          borderWidth: `${Math.round(3.3 * scaleX)}px`,
        }}
      />

      <img
        src="/frames/blue_flowers_corner.png"
        alt=""
        className="absolute top-0 left-0 pointer-events-none"
        style={{
          width: `${Math.round(60 * scaleX)}px`,
          height: `${Math.round(60 * scaleX)}px`,
          margin: `${Math.round(5 * scaleX)}px`,
        }}
      />
      <img
        src="/frames/blue_flowers_corner.png"
        alt=""
        className="absolute top-0 right-0 pointer-events-none -scale-x-100"
        style={{
          width: `${Math.round(60 * scaleX)}px`,
          height: `${Math.round(60 * scaleX)}px`,
          margin: `${Math.round(5 * scaleX)}px`,
        }}
      />

      <div
        className="w-full flex flex-col items-center justify-center relative"
        style={{
          top: `${Math.round(15 * scaleY)}px`,
        }}
      >
        <span
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: `${Math.round(8.5 * scaleY)}px`,
            color: "#1E3A8A",
            fontWeight: 800,
            letterSpacing: "0.15em",
          }}
        >
          RAIKAN CINTA
        </span>

        <span
          className="text-center truncate w-[85%] leading-none"
          style={{
            fontFamily:
              "'Great Vibes', cursive, 'Playfair Display', Georgia, serif",
            fontSize: `${Math.round(22 * scaleY)}px`,
            color: "#1D4ED8",
            marginTop: `${Math.round(6 * scaleY)}px`,
            textShadow: "0px 1px 1px rgba(255,255,255,0.6)",
          }}
        >
          {displayNames}
        </span>

        <div
          className="flex items-center justify-center w-[70%] border-y border-blue-200"
          style={{
            marginTop: `${Math.round(8 * scaleY)}px`,
            paddingTop: `${Math.round(3 * scaleY)}px`,
            paddingBottom: `${Math.round(3 * scaleY)}px`,
            borderTopWidth: "1px",
            borderBottomWidth: "1px",
          }}
        >
          <span
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: `${Math.round(8 * scaleY)}px`,
              color: "#1E3A8A",
              fontWeight: 700,
              letterSpacing: "0.08em",
            }}
          >
            {dateStr}
          </span>
        </div>
      </div>

      <div
        className="w-full text-center relative"
        style={{
          bottom: `${Math.round(12 * scaleY)}px`,
        }}
      >
        <span
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: `${Math.round(7 * scaleY)}px`,
            color: "#1E3A8A",
            fontWeight: 750,
            letterSpacing: "0.15em",
          }}
        >
          KOTAKFLASH.MY
        </span>
      </div>
    </div>
  );
}
