import { Box, Divider, Typography } from '@mui/material';
import AvatarGallery from './AvatarGallery';

interface Props {
  avatarGallery: string[];
  activeUrl: string;
  onSelectAvatar: (url: string) => void;
}

export default function ProfileDetailsSection({ avatarGallery, activeUrl, onSelectAvatar }: Props) {
  if (!avatarGallery || avatarGallery.length === 0) return null;

  return (
    <Box mt={4}>
      <Divider sx={{ mb: 2, borderColor: '#bbb', borderBottomWidth: 2 }} />
      <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" sx={{ mb: 1 }}>
        Fotos anteriores
      </Typography>
      <AvatarGallery
        avatarUrls={avatarGallery}
        activeUrl={activeUrl}
        onSelectAvatar={onSelectAvatar}
      />
    </Box>
  );
}
