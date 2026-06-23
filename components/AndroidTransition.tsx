import React from 'react';
import { motion, Variants } from 'motion/react';

export type AndroidAnimType =
  | 'abc_fade_in'
  | 'abc_fade_out'
  | 'abc_grow_fade_in_from_bottom'
  | 'abc_shrink_fade_out_from_bottom'
  | 'abc_popup_enter'
  | 'abc_popup_exit'
  | 'abc_slide_in_bottom'
  | 'abc_slide_out_bottom'
  | 'abc_slide_in_top'
  | 'abc_slide_out_top'
  | 'abc_tooltip_enter'
  | 'abc_tooltip_exit';

// Translate classical Android R.anim spec into modern web spring/duration-based structures
export const androidAnimationVariants: Record<AndroidAnimType, Variants> = {
  abc_fade_in: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  abc_fade_out: {
    initial: { opacity: 1 },
    animate: { opacity: 0 },
    exit: { opacity: 0 },
  },
  abc_grow_fade_in_from_bottom: {
    initial: { opacity: 0, scale: 0.93, y: 16 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.93, y: 16 },
  },
  abc_shrink_fade_out_from_bottom: {
    initial: { opacity: 1, scale: 1, y: 0 },
    animate: { opacity: 0, scale: 0.93, y: 16 },
    exit: { opacity: 0, scale: 0.93, y: 16 },
  },
  abc_popup_enter: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  },
  abc_popup_exit: {
    initial: { opacity: 1, scale: 1 },
    animate: { opacity: 0, scale: 0.8 },
    exit: { opacity: 0, scale: 0.8 },
  },
  abc_slide_in_bottom: {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 },
  },
  abc_slide_out_bottom: {
    initial: { y: 0, opacity: 1 },
    animate: { y: '100%', opacity: 0 },
    exit: { y: '100%', opacity: 0 },
  },
  abc_slide_in_top: {
    initial: { y: '-100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '-100%', opacity: 0 },
  },
  abc_slide_out_top: {
    initial: { y: 0, opacity: 1 },
    animate: { y: '-100%', opacity: 0 },
    exit: { y: '-100%', opacity: 0 },
  },
  abc_tooltip_enter: {
    initial: { opacity: 0, scale: 0.96, y: 3 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.96, y: 3 },
  },
  abc_tooltip_exit: {
    initial: { opacity: 1, scale: 1, y: 0 },
    animate: { opacity: 0, scale: 0.96, y: 3 },
    exit: { opacity: 0, scale: 0.96, y: 3 },
  },
};

// Maps Android standard durations/easings to make physics accurate
const getAndroidTransition = (type: AndroidAnimType, customDuration?: number, customDelay?: number) => {
  const baseDelay = customDelay ?? 0;
  
  switch (type) {
    case 'abc_fade_in':
      return { duration: customDuration ?? 0.22, ease: 'easeOut', delay: baseDelay };
    case 'abc_fade_out':
      return { duration: customDuration ?? 0.18, ease: 'easeIn', delay: baseDelay };
    case 'abc_grow_fade_in_from_bottom':
      return {
        type: 'spring',
        stiffness: 320,
        damping: 24,
        mass: 0.8,
        delay: baseDelay,
      };
    case 'abc_shrink_fade_out_from_bottom':
      return { duration: customDuration ?? 0.16, ease: 'easeInOut', delay: baseDelay };
    case 'abc_popup_enter':
      return {
        type: 'spring',
        stiffness: 420,
        damping: 22,
        mass: 0.7,
        delay: baseDelay,
      };
    case 'abc_popup_exit':
      return { duration: customDuration ?? 0.12, ease: 'easeIn', delay: baseDelay };
    case 'abc_slide_in_bottom':
    case 'abc_slide_in_top':
      return {
        type: 'spring',
        stiffness: 280,
        damping: 26,
        mass: 0.9,
        delay: baseDelay,
      };
    case 'abc_slide_out_bottom':
    case 'abc_slide_out_top':
      return { duration: customDuration ?? 0.24, ease: 'easeInOut', delay: baseDelay };
    case 'abc_tooltip_enter':
      return { duration: customDuration ?? 0.12, ease: 'easeOut', delay: baseDelay };
    case 'abc_tooltip_exit':
      return { duration: customDuration ?? 0.08, ease: 'easeIn', delay: baseDelay };
    default:
      return { duration: 0.2, ease: 'easeInOut', delay: baseDelay };
  }
};

interface AndroidTransitionProps {
  children: React.ReactNode;
  type: AndroidAnimType;
  className?: string;
  duration?: number;
  delay?: number;
  layout?: boolean | 'position' | 'size' | 'x' | 'y';
  onClick?: () => void;
  id?: string;
}

export const AndroidTransition: React.FC<AndroidTransitionProps> = ({
  children,
  type,
  className = '',
  duration,
  delay,
  layout,
  onClick,
  id,
}) => {
  const variants = androidAnimationVariants[type];
  const transition = getAndroidTransition(type, duration, delay) as any;

  return (
    <motion.div
      id={id}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transition}
      layout={layout}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.div>
  );
};
