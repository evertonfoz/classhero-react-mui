import {
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Avatar,
  Box
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';

interface Props {
  snackbarOpen: boolean;
  message: string;
  showChoiceDialog: boolean;
  showCaptureDialog: boolean;
  showCancelDialog: boolean;
  showConfirmOldAvatarDialog: boolean;
  selectedOldAvatar: string | null;
  handleCloseSnackbar: () => void;
  handleFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleOpenCamera: () => void;
  stopCamera: () => void;
  iniciarCamera: () => void;
  handleTakePhoto: () => void;
  handleCancel: () => void;
  confirmUseOldAvatar: () => void;
  setShowChoiceDialog: (val: boolean) => void;
  setShowCaptureDialog: (val: boolean) => void;
  setShowCancelDialog: (val: boolean) => void;
  setShowConfirmOldAvatarDialog: (val: boolean) => void;
}

export default function ProfileDialogsSection({
  snackbarOpen,
  message,
  showChoiceDialog,
  showCaptureDialog,
  showCancelDialog,
  showConfirmOldAvatarDialog,
  selectedOldAvatar,
  handleCloseSnackbar,
  handleFileInput,
  handleOpenCamera,
  stopCamera,
  iniciarCamera,
  handleTakePhoto,
  handleCancel,
  confirmUseOldAvatar,
  setShowChoiceDialog,
  setShowCaptureDialog,
  setShowCancelDialog,
  setShowConfirmOldAvatarDialog,
}: Props) {
  return (
    <>
      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>

      {/* Diálogo de escolha de origem da foto */}
      <Dialog open={showChoiceDialog} onClose={() => setShowChoiceDialog(false)}>
        <DialogTitle>Escolher origem da foto</DialogTitle>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" startIcon={<PhotoLibraryIcon />} component="label">
            Do computador
            <input type="file" hidden accept="image/*" onChange={(e) => {
              handleFileInput(e);
              setShowChoiceDialog(false);
            }} />
          </Button>
          <Button variant="contained" startIcon={<CameraAltIcon />} onClick={() => {
            handleOpenCamera();
            setShowChoiceDialog(false);
          }}>
            Tirar foto
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de cancelar edição */}
      <Dialog open={showCancelDialog} onClose={() => setShowCancelDialog(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LogoutIcon color="warning" />
          <Typography variant="h6" component="span" fontWeight="bold">Cancelar edição</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>Tem certeza de que deseja <strong>descartar as alterações</strong>?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={() => setShowCancelDialog(false)}>Voltar</Button>
          <Button variant="contained" onClick={handleCancel} color="inherit">Sim, cancelar</Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmação de avatar antigo */}
      <Dialog open={showConfirmOldAvatarDialog} onClose={() => setShowConfirmOldAvatarDialog(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CameraAltIcon color="primary" />
          <Typography variant="h6" component="span" fontWeight="bold">
            Usar esta imagem?
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Deseja definir esta imagem como sua nova foto de perfil?
          </Typography>
          <Box mt={2} display="flex" justifyContent="center">
            <Avatar src={selectedOldAvatar ?? ''} sx={{ width: 96, height: 96 }} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={() => setShowConfirmOldAvatarDialog(false)}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={confirmUseOldAvatar} color="primary">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de captura de foto */}
      <Dialog
        open={showCaptureDialog}
        onClose={() => {
          setShowCaptureDialog(false);
          stopCamera();
        }}
        TransitionProps={{
          onEntered: () => iniciarCamera(),
        }}
      >
        <DialogTitle>Tirar Foto</DialogTitle>
        <DialogContent>
          <video
            id="camera-preview"
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: 8,
              minHeight: 300,
              backgroundColor: '#000',
              objectFit: 'cover',
            }}
          />
          <canvas hidden />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowCaptureDialog(false);
            stopCamera();
          }}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleTakePhoto}>
            Capturar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}