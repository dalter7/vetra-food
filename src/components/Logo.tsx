interface LogoProps {
  size?: "sm" | "md" | "lg";
  on?: "cream" | "ink";
  className?: string;
}

const MARK_RATIO = 868 / 532;

const SIZES: Record<NonNullable<LogoProps["size"]>, { mark: number; text: string }> = {
  sm: { mark: 28, text: "text-base" },
  md: { mark: 36, text: "text-xl" },
  lg: { mark: 50, text: "text-3xl" },
};

export function Logo({ size = "md", on = "cream", className = "" }: LogoProps) {
  const s = SIZES[size];
  const textColor = on === "cream" ? "text-ink-950" : "text-cream-100";
  const subColor = on === "cream" ? "text-ink-500" : "text-cream-300";
  const markColor = on === "cream" ? "#15120F" : "#FFFBF5";

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span
        aria-hidden
        className="shrink-0"
        style={{
          display: "inline-block",
          width: s.mark * MARK_RATIO,
          height: s.mark,
          backgroundColor: markColor,
          WebkitMaskImage: "url(/logo-mark.png)",
          maskImage: "url(/logo-mark.png)",
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
        }}
      />
      <div className="leading-none">
        <div className={`font-display font-bold ${s.text} ${textColor} tracking-tight`}>Vetra</div>
        <div className={`font-mono text-[9px] tracking-[0.25em] ${subColor} -mt-0.5`}>FOOD</div>
      </div>
    </div>
  );
}
