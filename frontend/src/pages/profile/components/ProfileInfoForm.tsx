import {
  Box,
  Grid,
  Switch,
  TextField,
  Typography,
} from '@mui/material';

interface FormData {
  name: string;
  email: string;
  is_a_teacher: boolean;
  is_a_admin: boolean;
  is_a_student: boolean;
  is_validated: boolean;
}

interface ProfileInfoFormProps {
  formData: FormData;
  isEditing: boolean;
  currentUserEmail: string;
  isCurrentUserAdmin: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSwitchChange: (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ProfileInfoForm({
  formData,
  isEditing,
  isCurrentUserAdmin,
  handleInputChange,
  handleSwitchChange,
}: ProfileInfoFormProps) {
  const switches = [
    { label: 'Professor', key: 'is_a_teacher' },
    { label: 'Admin', key: 'is_a_admin' },
    { label: 'Estudante', key: 'is_a_student' },
  ];

  const renderSwitches = () => {
    if (isCurrentUserAdmin) {
      return switches.map((item) => (
        <Grid key={item.key} size={{ xs: 12, sm: 6 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Switch
              checked={formData[item.key as keyof typeof formData] as boolean}
              onChange={handleSwitchChange(item.key as keyof typeof formData)}
              disabled={!isEditing}
            />
            <Typography>{item.label}</Typography>
          </Box>
        </Grid>
      ));
    }

    return switches
      .filter((item) => formData[item.key as keyof typeof formData])
      .map((item) => (
        <Grid key={item.key} size={{ xs: 12, sm: 6 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Switch checked disabled />
            <Typography>{item.label}</Typography>
          </Box>
        </Grid>
      ));
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
      <TextField
        fullWidth
        label="Nome"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        disabled={!isEditing}
      />
      <TextField
        fullWidth
        label="Email"
        name="email"
        value={formData.email}
        disabled
      />
      <Grid container spacing={2}>
        {renderSwitches()}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Switch
              checked={formData.is_validated}
              onChange={handleSwitchChange('is_validated')}
              disabled={!isEditing || !isCurrentUserAdmin}
            />
            <Typography>Conta Validada</Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
