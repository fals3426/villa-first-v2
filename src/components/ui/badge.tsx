import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-transparent px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-white text-black [a&]:hover:bg-zinc-200",
        secondary:
          "bg-zinc-900 text-white border-white/10 [a&]:hover:bg-zinc-800",
        destructive:
          "bg-red-500 text-white [a&]:hover:bg-red-600 focus-visible:ring-red-500/20",
        outline:
          "border-white/20 text-white [a&]:hover:bg-white/10 [a&]:hover:text-white",
        ghost: "[a&]:hover:bg-white/10 [a&]:hover:text-white text-white/80",
        link: "text-white underline-offset-4 [a&]:hover:underline",
        // Variants V1
        "v1-default": "bg-white/10 text-white border-white/20",
        "v1-outline": "border-white/40 text-white bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
