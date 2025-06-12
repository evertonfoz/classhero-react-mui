import { Box, TextField, IconButton, Tooltip } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function YoutubeLinkField({ label, value, onChange, disabled = false }: Props) {
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <TextField
        fullWidth
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
      <Tooltip title="Abrir no YouTube">
        <span>
          <IconButton
            component="a"
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            disabled={disabled || !value}
          >
            <OpenInNewIcon />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}
