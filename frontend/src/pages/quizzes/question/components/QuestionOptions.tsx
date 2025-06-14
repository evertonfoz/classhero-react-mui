// components/QuestionOptions.tsx
import { Box, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface Props {
  options: string[];
  correctAnswers: string[];
}

export default function QuestionOptions({ options, correctAnswers }: Props) {
  return (
    <Box display="flex" flexDirection="column" gap={2} mt={2}>
      {options.map((option, idx) => (
        <Box
          key={option}
          display="flex"
          alignItems="center"
          p={2}
          bgcolor="#f3f3fa"
          borderRadius={3}
          border={correctAnswers.includes(option) ? "2px solid #66bb6a" : "2px solid transparent"}
          boxShadow={correctAnswers.includes(option) ? 2 : 0}
          gap={2}
        >
          <Typography variant="body1" flex={1}>
            {option}
          </Typography>
          {correctAnswers.includes(option) && (
            <CheckCircleOutlineIcon color="success" />
          )}
        </Box>
      ))}
    </Box>
  );
}
