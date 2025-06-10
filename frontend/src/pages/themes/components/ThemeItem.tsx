// components/ThemeItem.tsx
import {
  Box, ListItem, ListItemText, IconButton, Typography, Collapse, Button
} from '@mui/material';
import { ExpandLess, ExpandMore, Edit, Delete, Add } from '@mui/icons-material';
import type { Material } from '../../../types/material';

interface ThemeItemProps {
  themeId: string;
  title: string;
  description: string;
  expanded: boolean;
  materials: Material[];
  onExpand: (themeId: string) => void;
  onDeleteThemeClick: (themeId: string) => void;

  onOpenMaterialDialog: (themeId: string) => void;
  zebraIndex: number;
  onEditMaterial: (material: Material) => void;
  handleDeleteMaterialClick: (materialId: string) => void;

}

export default function ThemeItem({
  themeId, title, description, expanded, zebraIndex,
  materials, onExpand, onDeleteThemeClick, onOpenMaterialDialog, handleDeleteMaterialClick, onEditMaterial
}: ThemeItemProps) {
  return (
    <Box key={themeId} bgcolor={zebraIndex % 2 === 0 ? '#fafafa' : '#ffffff'}>

      <ListItem
  alignItems="flex-start" // <- garante alinhamento ao topo
  divider
  sx={{ cursor: 'pointer' }}
  onClick={() => onExpand(themeId)}
  secondaryAction={
    <Box
      display="flex"
      flexDirection="row"
      alignItems="flex-start"  // <- alinha os ícones no topo
      sx={{ mt: '4px' }}        // <- leve ajuste para alinhar melhor visualmente
    >
      <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEditMaterial({ material_id: themeId } as any); }}>
        <Edit fontSize="small" />
      </IconButton>
      <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); onDeleteThemeClick(themeId); }}>
        <Delete fontSize="small" />
      </IconButton>
      <IconButton size="small" onClick={(e) => { e.stopPropagation(); onExpand(themeId); }}>
        {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
      </IconButton>
    </Box>
  }
>
  <ListItemText
    primary={<Typography variant="h6" fontWeight="bold">{title}</Typography>}
    secondary={description}
    sx={{ pr: 8 }}
  />
</ListItem>


      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box px={4} py={2} bgcolor="#ffffff">
          {materials.length > 0 ? (
            materials.map((m, index) => (
              <Box key={m.material_id} mb={2} display="flex" justifyContent="space-between" alignItems="flex-start" bgcolor={index % 2 === 0 ? '#f5f5f5' : '#ffffff'}>
                {/* Coluna da Esquerda: Título e descrição */}
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {m.name}
                  </Typography>
                  {m.description && (
                    <Typography variant="body2" color="text.secondary" mb={0.5}>
                      {m.description}
                    </Typography>
                  )}
                </Box>

                {/* Coluna da Direita: Tipo, link e ações */}
                <Box display="flex" flexDirection="column" alignItems="flex-end" minWidth="180px">
                  <Typography variant="body2">
                    Tipo: <strong>{m.type.toUpperCase()}</strong>
                  </Typography>
                  {m.content && (
                    <Typography variant="body2" mt={0.5}>
                      <a href={m.content} target="_blank" rel="noopener noreferrer">
                        Abrir material
                      </a>
                    </Typography>
                  )}
                  <Box mt={1}>
                    <IconButton size="small" onClick={() => onEditMaterial(m)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteMaterialClick(m.material_id)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>


                  </Box>
                </Box>


              </Box>

            ))
          ) : (
            <Typography variant="body2" color="text.secondary">Nenhum material disponível.</Typography>
          )}

          <Box mt={3} px={0} py={0} display="flex" justifyContent="flex-start">
            <Button
              variant="outlined"
              size="small"
              startIcon={<Add />}
              onClick={() => onOpenMaterialDialog(themeId)}
            >
              Novo Material
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}
