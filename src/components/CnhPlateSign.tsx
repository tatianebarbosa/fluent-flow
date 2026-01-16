import type { CnhPlate, CnhPlateSymbol } from "@/data/cnh";

type CnhPlateSignProps = {
  plate: CnhPlate;
  compact?: boolean;
};

export function CnhPlateSign({ plate, compact = false }: CnhPlateSignProps) {
  const sizeClass = compact ? "h-16 w-16" : "h-48 w-48";
  const visual = plate.visual;

  if (visual.kind === "stop") {
    return (
      <div className={`${sizeClass} flex items-center justify-center`}>
        <svg viewBox="0 0 160 160" role="img" aria-label={plate.nome}>
          <polygon
            points="57,8 103,8 152,57 152,103 103,152 57,152 8,103 8,57"
            fill="#d9272e"
            stroke="#fff"
            strokeWidth="8"
          />
          <text
            x="80"
            y="94"
            textAnchor="middle"
            fontSize="38"
            fontWeight="800"
            fill="#fff"
            fontFamily="Arial, sans-serif"
          >
            PARE
          </text>
        </svg>
      </div>
    );
  }

  if (visual.kind === "diamond") {
    return (
      <div className={`${sizeClass} flex items-center justify-center`}>
        <svg viewBox="0 0 160 160" role="img" aria-label={plate.nome}>
          <rect
            x="31"
            y="31"
            width="98"
            height="98"
            transform="rotate(45 80 80)"
            fill="#f2c230"
            stroke="#111"
            strokeWidth="6"
          />
          <PlateSymbol symbol={visual.symbol} warning />
        </svg>
      </div>
    );
  }

  if (visual.kind === "blue" || visual.kind === "green") {
    const fill = visual.kind === "blue" ? "#1f66c2" : "#16814f";

    return (
      <div className={`${sizeClass} flex items-center justify-center`}>
        <svg viewBox="0 0 160 160" role="img" aria-label={plate.nome}>
          <rect
            x="18"
            y="28"
            width="124"
            height="104"
            rx="8"
            fill={fill}
            stroke="#fff"
            strokeWidth="8"
          />
          <text
            x="80"
            y={visual.text.length > 2 ? 91 : 102}
            textAnchor="middle"
            fontSize={visual.text.length > 2 ? 34 : 72}
            fontWeight="800"
            fill="#fff"
            fontFamily="Arial, sans-serif"
          >
            {visual.text}
          </text>
        </svg>
      </div>
    );
  }

  return (
    <div className={`${sizeClass} flex items-center justify-center`}>
      <svg viewBox="0 0 160 160" role="img" aria-label={plate.nome}>
        <circle cx="80" cy="80" r="67" fill="#fff" stroke="#d9272e" strokeWidth="12" />
        {visual.text ? (
          <text
            x="80"
            y={visual.text === "-" ? 86 : 97}
            textAnchor="middle"
            fontSize={visual.text === "-" ? 82 : 54}
            fontWeight="800"
            fill="#111"
            fontFamily="Arial, sans-serif"
          >
            {visual.text}
          </text>
        ) : null}
        {visual.symbol ? <PlateSymbol symbol={visual.symbol} /> : null}
        {visual.slash ? (
          <line
            x1="37"
            y1="123"
            x2="123"
            y2="37"
            stroke="#d9272e"
            strokeWidth="10"
            strokeLinecap="round"
          />
        ) : null}
      </svg>
    </div>
  );
}

function PlateSymbol({
  symbol,
  warning = false,
}: {
  symbol: CnhPlateSymbol;
  warning?: boolean;
}) {
  const color = "#111";
  const stroke = warning ? 9 : 10;

  if (symbol === "arrow-up") {
    return <path d="M80 124V43M80 43 51 72M80 43l29 29" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
  }

  if (symbol === "arrow-left" || symbol === "no-left") {
    return <path d="M115 80H45M45 80l28-28M45 80l28 28" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
  }

  if (symbol === "arrow-right" || symbol === "no-right") {
    return <path d="M45 80h70M115 80 87 52M115 80l-28 28" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
  }

  if (symbol === "turn-left") {
    return <path d="M103 122V82c0-18-10-30-28-30H55M55 52l22-20M55 52l22 20" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
  }

  if (symbol === "turn-right") {
    return <path d="M57 122V82c0-18 10-30 28-30h20M105 52 83 32M105 52 83 72" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
  }

  if (symbol === "no-u-turn") {
    return <path d="M103 116V72c0-20-12-33-32-33H57M57 39l23-20M57 39l23 21" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
  }

  if (symbol === "no-parking") {
    return <text x="80" y="103" textAnchor="middle" fontSize="72" fontWeight="800" fill={color} fontFamily="Arial, sans-serif">E</text>;
  }

  if (symbol === "no-stopping") {
    return (
      <>
        <text x="80" y="103" textAnchor="middle" fontSize="72" fontWeight="800" fill={color} fontFamily="Arial, sans-serif">E</text>
        <line x1="43" y1="40" x2="117" y2="120" stroke="#d9272e" strokeWidth="8" strokeLinecap="round" />
      </>
    );
  }

  if (symbol === "pedestrian") {
    return (
      <>
        <circle cx="80" cy="48" r="10" fill={color} />
        <path d="M80 59 68 88M80 59l14 28M73 76l-20 15M88 78l20-12M68 88l-16 31M94 87l20 31" stroke={color} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </>
    );
  }

  if (symbol === "school") {
    return (
      <>
        <circle cx="65" cy="55" r="8" fill={color} />
        <circle cx="96" cy="54" r="8" fill={color} />
        <path d="M65 66 54 99M65 66l17 21M96 65l-14 22M96 65l17 32M55 100l-13 20M82 88l-7 31M113 98l9 22" stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </>
    );
  }

  if (symbol === "traffic-light") {
    return (
      <>
        <rect x="62" y="33" width="36" height="94" rx="9" fill={color} />
        <circle cx="80" cy="55" r="8" fill="#f44336" />
        <circle cx="80" cy="80" r="8" fill="#f2c230" />
        <circle cx="80" cy="105" r="8" fill="#1ab36f" />
      </>
    );
  }

  if (symbol === "crossroad") {
    return <path d="M80 31v98M35 80h90" stroke={color} strokeWidth={stroke} strokeLinecap="round" />;
  }

  if (symbol === "roundabout") {
    return (
      <>
        <path d="M56 59a35 35 0 1 1 8 48" stroke={color} strokeWidth="8" strokeLinecap="round" fill="none" />
        <path d="M55 59h28M55 59V31" stroke={color} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </>
    );
  }

  if (symbol === "speed-bump") {
    return <path d="M35 102h90M50 102c7-34 53-34 60 0" stroke={color} strokeWidth={stroke} strokeLinecap="round" fill="none" />;
  }

  if (symbol === "narrow-road") {
    return <path d="M54 124c0-32 7-49 22-68M106 124c0-32-7-49-22-68M80 38v22" stroke={color} strokeWidth={stroke} strokeLinecap="round" fill="none" />;
  }

  if (symbol === "slippery") {
    return (
      <>
        <path d="M61 53h38l10 25H51z" fill={color} />
        <circle cx="61" cy="86" r="7" fill={color} />
        <circle cx="99" cy="86" r="7" fill={color} />
        <path d="M48 111c13-16 24 14 37 0s24 14 37 0" stroke={color} strokeWidth="7" strokeLinecap="round" fill="none" />
      </>
    );
  }

  if (symbol === "works") {
    return (
      <>
        <circle cx="74" cy="47" r="8" fill={color} />
        <path d="M70 58 57 86h30l-9-28M57 86l-16 34M87 86l22 34M48 115h61" stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </>
    );
  }

  if (symbol === "animal") {
    return (
      <>
        <path d="M43 91c18-29 56-30 74-1M58 91v28M98 91v28M67 65l-13-16M94 65l13-16" stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="71" cy="77" r="4" fill={color} />
        <circle cx="91" cy="77" r="4" fill={color} />
      </>
    );
  }

  if (symbol === "rail") {
    return (
      <>
        <path d="M48 119 80 41l32 78M61 91h38M55 108h50" stroke={color} strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M46 46 114 114M114 46 46 114" stroke={color} strokeWidth="8" strokeLinecap="round" />
      </>
    );
  }

  return null;
}
