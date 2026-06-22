import { useState, useCallback, useMemo } from 'react';
import poolConfig from '../config/poolConfig';

export function usePoolConfig() {
  const [selections, setSelections] = useState(() => {
    const initial = {};
    poolConfig.asset.sections.forEach((s) => {
      initial[s.id] = s.defaultOption;
    });
    return initial;
  });

  const [dims] = useState({
    pool_length: poolConfig.asset.dimensions.pool_length.value,
    pool_width: poolConfig.asset.dimensions.pool_width.value,
    pool_depth: poolConfig.asset.dimensions.pool_depth.value,
  });

  const selectOption = useCallback((sectionId, optionId) => {
    setSelections((prev) => {
      if (prev[sectionId] === optionId) return prev;
      return { ...prev, [sectionId]: optionId };
    });
  }, []);

  const getOption = useCallback(
    (sectionId) => {
      const section = poolConfig.asset.sections.find((s) => s.id === sectionId);
      if (!section) return null;
      return section.options.find((o) => o.id === selections[sectionId]);
    },
    [selections]
  );

  const cost = useMemo(() => {
    let total = 0;
    const lines = [];

    poolConfig.asset.sections.forEach((section) => {
      const opt = section.options.find((o) => o.id === selections[section.id]);
      if (!opt) return;

      let lineCost = 0;
      let label = '';

      if (opt.method === 'LS') {
        lineCost = opt.price;
        label = opt.name;
      } else if (opt.method === 'SF') {
        const L = dims.pool_length, W = dims.pool_width;
        const patioArea = (L + 8) * (W + 8) - L * W;
        lineCost = opt.price * Math.max(patioArea, 200);
        label = `${opt.name} (${Math.round(patioArea)} SF)`;
      }

      total += lineCost;
      lines.push({ label, cost: lineCost });
    });

    return { total, lines };
  }, [selections, dims]);

  const shellOption = getOption('section_pool_shell');
  const patioOption = getOption('section_patio_hardscape');
  const waterOption = getOption('section_water_profile');

  return {
    config: poolConfig,
    selections,
    dims,
    selectOption,
    getOption,
    cost,
    shellOption,
    patioOption,
    waterOption,
  };
}
