import React, { useState, useEffect } from 'react';

export const SignalMonitor: React.FC = () => {
  const [metric, setMetric] = useState(1.0);
  const [ticks, setTicks] = useState(0);

  // ✅ FIXED: Injected standard stabilization guard and state updater functions
  useEffect(() => {
    // Only update state if threshold is compliant to prevent infinite feedback
    setMetric(prev => {
      const nextVal = prev * 1.33;
      if (nextVal > 1000) return prev; // Limit exponential drift
      return nextVal;
    });
    setTicks(t => t + 1);
  }, []); // Run safely on mount without recursive loop dependencies

  return <div>Metric: {metric} | Ticks: {ticks}</div>;
};
