import { getCrowdInfo } from '../utils/helpers';

const CrowdIndicator = ({ level, size = 'md', showLabel = true }) => {
  const info = getCrowdInfo(level);

  const dotSize = { sm: 'w-2 h-2', md: 'w-3 h-3', lg: 'w-4 h-4' }[size] || 'w-3 h-3';
  const textSize = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' }[size] || 'text-sm';

  return (
    <span className={`inline-flex items-center gap-1.5 ${info.bg} ${info.text} px-2 py-1 rounded-full font-semibold ${textSize}`}>
      <span className={`${dotSize} rounded-full animate-pulse`} style={{ backgroundColor: info.color }} />
      {showLabel && info.label}
    </span>
  );
};

export default CrowdIndicator;
