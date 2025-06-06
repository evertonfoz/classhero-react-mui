import { useEffect, useState } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';

export default function useDynamicLimit(rowHeight = 56) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const calculateLimit = () => {
      const offset = isMobile ? 220 : 280;
      const availableHeight = window.innerHeight - offset;
      const rows = Math.floor(availableHeight / rowHeight);
      const capped = isMobile ? Math.min(rows, 6) : rows;
      setLimit(capped > 0 ? capped : 4);
    };

    calculateLimit();
    window.addEventListener('resize', calculateLimit);
    return () => window.removeEventListener('resize', calculateLimit);
  }, [rowHeight, isMobile]);

  return limit;
}
