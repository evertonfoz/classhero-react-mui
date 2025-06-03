// src/pages/profile/components/AvatarGallery.tsx
import { Avatar, Box, Typography } from '@mui/material';

interface AvatarGalleryProps {
  avatarUrls: string[];
  activeUrl: string;
  onSelectAvatar: (url: string) => void; // 🆕
}

export default function AvatarGallery({ avatarUrls, activeUrl, onSelectAvatar }: AvatarGalleryProps) {
  return (
    <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
      {avatarUrls.map((url, index) => {
        const isActive = url === activeUrl;

        return (
          <Box key={index} textAlign="center" onClick={() => onSelectAvatar(url)} sx={{ cursor: 'pointer' }}>
            <Avatar
              src={url}
              sx={{
                width: 48,
                height: 48,
                border: isActive ? '2px solid #1976d2' : '1px solid #ccc',
              }}
            />
            {isActive && (
              <Typography variant="caption" color="primary">
                Ativa
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
