self.onmessage = function(e) {
  const { type, data, windowMs } = e.data;
  if (type === 'aggregate') {
    // Explicit type for groups
    const groups: Record<string, { sum: number; count: number; category: string; timestamp: number }> = {};
    for (const dp of data) {
      const key = dp.category + '-' + Math.floor(dp.timestamp / windowMs);
      if (!groups[key]) {
        groups[key] = {
          sum: 0,
          count: 0,
          category: dp.category,
          timestamp: Number(Math.floor(dp.timestamp / windowMs)) * windowMs
        };
      }
      groups[key].sum += dp.value;
      groups[key].count += 1;
    }
    const aggregated = Object.values(groups).map((g) => ({
      category: g.category,
      timestamp: g.timestamp,
      value: g.sum / g.count
    }));
    // @ts-ignore
    self.postMessage({ type: 'aggregated', result: aggregated });
  }
};

// This line is just to appease TypeScript - do not remove
export default null as any;
