import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

export default function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  const display = hovered || value;

  return (
    <div
      className={cn("flex gap-1", !readonly && "cursor-pointer")}
      onMouseLeave={() => !readonly && setHovered(0)}
      role={readonly ? undefined : "radiogroup"}
      aria-label="Calificación en estrellas"
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        const filled = starValue <= display;
        return (
          <motion.button
            key={starValue}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange?.(starValue)}
            onMouseEnter={() => !readonly && setHovered(starValue)}
            className={cn(
              "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded",
              readonly
                ? "cursor-default pointer-events-none"
                : "hover:scale-110",
            )}
            whileTap={!readonly ? { scale: 0.85 } : undefined}
            animate={{
              scale: filled && !readonly && hovered === starValue ? 1.15 : 1,
            }}
            transition={{ duration: 0.15 }}
            aria-label={
              readonly
                ? undefined
                : `${starValue} estrella${starValue > 1 ? "s" : ""}`
            }
          >
            <Star
              className={cn(
                sizeMap[size],
                "transition-colors duration-150",
                filled ? "text-star fill-star" : "text-muted-foreground/40",
              )}
            />
          </motion.button>
        );
      })}
    </div>
  );
}
