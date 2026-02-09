import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:scale-[1.02]",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-2 bg-background shadow-xs hover:bg-accent hover:text-accent-foreground hover:border-primary/40 dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        // Variants premium V2 (conservés pour référence)
        gradient: "bg-gradient-primary text-white hover:shadow-glow-primary hover:scale-[1.02] border-0",
        "gradient-ocean": "bg-gradient-ocean text-white hover:shadow-lg hover:scale-[1.02] border-0",
        "gradient-sunset": "bg-gradient-sunset text-white hover:shadow-lg hover:scale-[1.02] border-0",
        glow: "bg-primary text-white shadow-glow-primary hover:shadow-glow-primary-lg hover:scale-[1.02]",
        // Variants V1 - Design épuré noir/blanc
        "v1-primary": "bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-zinc-200 transition-all duration-300",
        "v1-outline": "border border-white/40 px-6 py-3 rounded-full font-semibold text-white hover:border-white/60 transition-all duration-300",
        "v1-ghost": "px-6 py-3 rounded-full border border-white/30 text-white/80 hover:text-white transition-all duration-300",
      },
      size: {
        default: "touch-target-min px-4 py-2 has-[>svg]:px-3 md:h-9",
        sm: "touch-target-min rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 md:h-8",
        lg: "touch-target-min rounded-lg px-8 text-base font-semibold has-[>svg]:px-6 md:h-11",
        xl: "touch-target-min rounded-xl px-10 text-lg font-bold has-[>svg]:px-8 md:h-14",
        icon: "touch-target-min md:size-9",
        "icon-sm": "touch-target-min md:size-8",
        "icon-lg": "touch-target-min md:size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
