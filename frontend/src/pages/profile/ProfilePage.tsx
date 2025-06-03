import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Paper,
  CircularProgress,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProfileImageSection from './components/ProfileImageSection';
import ProfileInfoForm from './components/ProfileInfoForm';
import ProfileActionButtons from './components/ProfileActionButtons';
import ProfileDetailsSection from './components/ProfileDetailsSection';
import ProfileDialogsSection from './components/ProfileDialogsSection';




export default function ProfilePage() {
  const { email: emailParam } = useParams();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCaptureDialog, setShowCaptureDialog] = useState(false);
  const [showChoiceDialog, setShowChoiceDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [message, setMessage] = useState('');
  const { user: currentUser, updateUser } = useAuth();
  const [avatarGallery, setAvatarGallery] = useState<string[]>([]);
  const [selectedOldAvatar, setSelectedOldAvatar] = useState<string | null>(null);
  const [showConfirmOldAvatarDialog, setShowConfirmOldAvatarDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);




  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatar: '',
    is_a_teacher: false,
    is_a_admin: false,
    is_a_student: false,
    is_validated: false,
  });

  const [originalData, setOriginalData] = useState(formData);

  useEffect(() => {
    const email = emailParam || localStorage.getItem('user_email');
    if (!email) return setIsLoading(false);

    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:3000/users/by-email?email=${encodeURIComponent(email)}`);
        const result = await response.json();
        if (!response.ok) return;

        const userData = result.data;

        const gallery = Array.isArray(userData.users_avatars)
          ? userData.users_avatars.map((a: any) => a.avatar_url)
          : userData.users_avatars?.avatar_url
            ? [userData.users_avatars.avatar_url]
            : [];

        const formattedData = {
          name: userData.name ?? '',
          email: userData.email ?? '',
          is_a_teacher: userData.is_a_teacher ?? false,
          is_a_admin: userData.is_a_admin ?? false,
          is_a_student: userData.is_a_student ?? false,
          is_validated: userData.is_validated ?? false,
          avatar: Array.isArray(userData.users_avatars)
            ? (userData.users_avatars.find((a: any) => a.is_active)?.avatar_url ?? '')
            : userData.users_avatars?.is_active
              ? userData.users_avatars.avatar_url
              : '',
        };

        setFormData(formattedData);
        setOriginalData(formattedData);
        setAvatarGallery(gallery);

      } catch (_) {
        // ignora erro
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [emailParam]);


  const updateUserInfo = async () => {
  try {
    await fetch('http://localhost:3000/users/update-info', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.email,
        name: formData.name,
        is_a_teacher: formData.is_a_teacher,
        is_a_admin: formData.is_a_admin,
        is_a_student: formData.is_a_student,
        is_validated: formData.is_validated,
      }),
    });

    setMessage('Dados atualizados com sucesso!');
    setSnackbarOpen(true);
    setOriginalData(formData);
    setIsEditing(false);

   if (formData.email === currentUser?.email) {
  updateUser({
    name: formData.name,
    avatar: formData.avatar,
    is_a_teacher: formData.is_a_teacher,
    is_a_admin: formData.is_a_admin,
    is_a_student: formData.is_a_student,
    is_validated: formData.is_validated,
  });
}
  } catch (err) {
    alert('Erro ao atualizar dados. Tente novamente.');
  }
};



  const handleSelectOldAvatar = (url: string) => {
    if (!url || url === formData.avatar) return;
    setSelectedOldAvatar(url);
    setShowConfirmOldAvatarDialog(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [name]: e.target.checked }));
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const confirmUseOldAvatar = async () => {
    if (!selectedOldAvatar) return;

    try {
      const response = await fetch('http://localhost:3000/users/avatar/url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          avatar_url: selectedOldAvatar,
        }),
      });

      const result = await response.json();
      const validated = result?.user?.is_validated ?? formData.is_validated;

      setFormData((prev) => ({ ...prev, avatar: selectedOldAvatar, is_validated: validated }));
      setOriginalData((prev) => ({ ...prev, avatar: selectedOldAvatar, is_validated: validated }));
      setMessage('Foto alterada com sucesso!');
      setSnackbarOpen(true);

      if (formData.email === currentUser?.email) {
        updateUser({ avatar: selectedOldAvatar });
      }
    } catch (err) {
      alert('Erro ao atualizar imagem antiga');
    } finally {
      setShowConfirmOldAvatarDialog(false);
      setSelectedOldAvatar(null);
    }
  };


  const handleSaveImage = async () => {
    if (!selectedFile) return;
    setIsUploading(true);

    const form = new FormData();
    form.append('file', selectedFile);
    form.append('email', formData.email);

    try {
      const response = await fetch('http://localhost:3000/users/avatar', {
        method: 'POST',
        body: form,
      });

      const result = await response.json();
      const updatedValidatedStatus = result?.user?.is_validated ?? false;

      setOriginalData({ ...formData, avatar: previewUrl ?? '', is_validated: updatedValidatedStatus });
      setFormData((prev) => ({ ...prev, avatar: previewUrl ?? '', is_validated: updatedValidatedStatus }));
      setMessage('Foto atualizada com sucesso!');
      setSnackbarOpen(true);

      if (formData.email === currentUser?.email) {
        updateUser({ avatar: previewUrl ?? '' });
      }
    } catch (_) {
      // erro silencioso
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const handleCancelImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleOpenCamera = () => {
    setShowCaptureDialog(true);
  };

  const handleTakePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'captured.png', { type: 'image/png' });
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        stopCamera();
        setShowCaptureDialog(false);
      }
    }, 'image/png');
  };

  const stopCamera = () => {
    const video = videoRef.current;
    if (!video) return;

    const stream = video.srcObject as MediaStream | null;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    video.srcObject = null;
  };


  const handleOpenChoice = () => {
    setShowChoiceDialog(true);
  };


  const handleCancel = () => {
    setFormData(originalData);
    setPreviewUrl(null);
    setSelectedFile(null);
    setIsEditing(false);
    setShowCancelDialog(false);
  };




  const handleCloseSnackbar = () => setSnackbarOpen(false);
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  // fora do JSX, dentro do componente ProfilePage
  const iniciarCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;
        await video.play();
      }
    } catch (err) {
      console.error('Erro ao acessar a câmera:', err);
      alert('Não foi possível acessar a câmera');
      setShowCaptureDialog(false);
    }
  };


  return (
    <Box sx={{ flexGrow: 1, width: '100%', height: '100%', pt: 0.5, px: 0 }}>
      <Paper sx={{ width: '100%', maxWidth: 800, ml: 0, p: 4, borderRadius: 3, boxShadow: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          <ProfileImageSection
            avatarUrl={formData.avatar}
            previewUrl={previewUrl}
            selectedFile={selectedFile}
            isUploading={isUploading}
            onOpenChoice={handleOpenChoice}
            onSaveImage={handleSaveImage}
            onCancelImage={handleCancelImage}
          />

          <ProfileInfoForm
            formData={formData}
            isEditing={isEditing}
            currentUserEmail={currentUser?.email ?? ''}
            isCurrentUserAdmin={!!currentUser?.is_a_admin}
            handleInputChange={handleInputChange}
            handleSwitchChange={handleSwitchChange}
          />

        </Box>

        <ProfileActionButtons
          isEditing={isEditing}
          selectedFile={selectedFile}
          isAdmin={!!currentUser?.is_a_admin}
          isSelf={formData.email === currentUser?.email}
          showDeleteButton={true}
          onEdit={() => setIsEditing(true)}
          onSave={updateUserInfo}
          onCancel={() => setShowCancelDialog(true)}
          onDelete={() => setShowDeleteDialog(true)}
          disabled={isDeleting}
        />

        <ProfileDetailsSection
          avatarGallery={avatarGallery}
          activeUrl={formData.avatar}
          onSelectAvatar={handleSelectOldAvatar}
        />

      </Paper>

      <ProfileDialogsSection
        snackbarOpen={snackbarOpen}
        message={message}
        showChoiceDialog={showChoiceDialog}
        showCaptureDialog={showCaptureDialog}
        showCancelDialog={showCancelDialog}
        showConfirmOldAvatarDialog={showConfirmOldAvatarDialog}
        selectedOldAvatar={selectedOldAvatar}
        handleCloseSnackbar={handleCloseSnackbar}
        handleFileInput={handleFileInput}
        handleOpenCamera={handleOpenCamera}
        stopCamera={stopCamera}
        iniciarCamera={iniciarCamera}
        handleTakePhoto={handleTakePhoto}
        handleCancel={handleCancel}
        confirmUseOldAvatar={confirmUseOldAvatar}
        setShowChoiceDialog={setShowChoiceDialog}
        setShowCaptureDialog={setShowCaptureDialog}
        setShowCancelDialog={setShowCancelDialog}
        setShowConfirmOldAvatarDialog={setShowConfirmOldAvatarDialog}
      />



    </Box>
  );
}
