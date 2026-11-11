import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface BouncyButtonProps {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  target?: string;
  rel?: string;
}

const MotionLink = motion.create(Link);

function BouncyButton({
  children,
  className = "",
  href,
  onClick,
  type = "button",
  target,
  rel,
}: BouncyButtonProps) {
  const motionProps = {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.92 },
    transition: { type: "spring" as const, stiffness: 400, damping: 15 },
    className,
  };

  if (href) {
    const isInternal = href.startsWith("/") && !href.startsWith("//");
    if (isInternal) {
      return (
        <MotionLink to={href} target={target} rel={rel} {...motionProps}>
          {children}
        </MotionLink>
      );
    }

    return (
      <motion.a href={href} target={target} rel={rel} {...motionProps}>
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button type={type} onClick={onClick} {...motionProps}>
      {children}
    </motion.button>
  );
}

export default BouncyButton;
