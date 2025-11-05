import React from 'react';
import { cn } from "../lib/utils";

export function Marquee({
  children,
  direction = "left",
  pauseOnHover = false,
  reverse = false,
  vertical = false,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        "group flex w-full overflow-hidden [--duration:40s] [--gap:1rem]",
        className,
        vertical && "flex-col"
      )}
      {...props}
    >
      <div
        className={cn(
          "flex shrink-0 justify-around gap-[--gap] [--transform:translateX(calc(-50% - (var(--gap)/2)))]",
          vertical ? "flex-col" : "flex-row",
          vertical
            ? "[animation:marquee-vertical-double_var(--duration)_linear_infinite]"
            : "[animation:marquee-horizontal-double_var(--duration)_linear_infinite]",
          reverse && "animation-direction: reverse",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
      >
        {children}
        {children}
      </div>
    </div>
  );
}

// Add these CSS keyframes to your global CSS file
const style = document.createElement('style');
style.textContent = `
@keyframes marquee-vertical-double {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(calc(-50% - (var(--gap)/2)));
  }
}

@keyframes marquee-horizontal-double {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(calc(-50% - (var(--gap)/2)));
  }
}
`;
document.head.appendChild(style);