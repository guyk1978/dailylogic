import type { Transition, Variants } from "framer-motion";

export const springSnappy: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 28,
};

export const springPop: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 14,
};

export const easeOut: Transition = {
  duration: 0.35,
  ease: [0.25, 0.46, 0.45, 0.94],
};

export const staggerList: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

export const fadeSlideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: easeOut,
  },
};

export const fadeSlideUpSection: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export const pageEnter: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: easeOut,
  },
};

export const contentCrossfade: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.18, ease: "easeIn" },
  },
};

export const toolCardHover: Variants = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
  },
  hover: {
    scale: 1.02,
    y: -6,
    boxShadow:
      "0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.05)",
    transition: springSnappy,
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.12 },
  },
};

export const toolIconHover: Variants = {
  rest: { scale: 1, rotate: 0 },
  hover: {
    scale: 1.14,
    rotate: -8,
    transition: springPop,
  },
};
