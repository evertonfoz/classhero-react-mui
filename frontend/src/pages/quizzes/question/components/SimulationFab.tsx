import { Fab, Typography, Box } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CloseIcon from "@mui/icons-material/Close";

interface SimulationFabProps {
  simulando: boolean;
  onStart: () => void;
  onEnd: () => void;
}

export default function SimulationFab({ simulando, onStart, onEnd }: SimulationFabProps) {
  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 24,
        right: 24,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 10,
      }}
    >
      <Fab
        color="primary"
        aria-label={simulando ? "Encerrar teste" : "Testar como aluno"}
        onClick={simulando ? onEnd : onStart}
        sx={{ boxShadow: 4, width: 56, height: 56 }}
      >
        {simulando
          ? <CloseIcon sx={{ fontSize: 32 }} />
          : <PlayArrowIcon sx={{ fontSize: 32 }} />
        }
      </Fab>
      <Typography variant="caption" color="primary" mt={0.5} fontWeight="bold">
        {simulando ? "Encerrar" : "Testar"}
      </Typography>
    </Box>
  );
}
