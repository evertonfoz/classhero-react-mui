// src/pages/components/GuidanceSection.tsx

import { Box, Typography } from '@mui/material';

interface GuidanceSectionProps {
  guidanceOnError?: string;
  guidanceOnSuccess?: string;
}

export default function GuidanceSection({
  guidanceOnError,
  guidanceOnSuccess,
}: GuidanceSectionProps) {
  if (!guidanceOnError && !guidanceOnSuccess) return null;

  return (
    <Box>
      {guidanceOnError && (
        <Box mt={3}>
          <Typography variant="subtitle2" color="error.main" fontWeight="bold">
            Orientação em caso de erro:
          </Typography>
          <Typography color="text.secondary">{guidanceOnError}</Typography>
        </Box>
      )}
      {guidanceOnSuccess && (
        <Box mt={2}>
          <Typography variant="subtitle2" color="success.main" fontWeight="bold">
            Pesquisa complementar para quem acertar:
          </Typography>
          <Typography color="text.secondary">{guidanceOnSuccess}</Typography>
        </Box>
      )}
    </Box>
  );
}
