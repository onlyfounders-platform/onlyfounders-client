import "react";

// The home page drives its animations with CSS custom properties
// (--d stagger, --t delay, --an keyframe, --g gradient …) set inline.
declare module "react" {
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
}
