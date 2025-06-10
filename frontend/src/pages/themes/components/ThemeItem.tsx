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
  onDelete: (themeId: string) => void;
  onOpenMaterialDialog: (themeId: string) => void;
  zebraIndex: number;
  onEditMaterial: (material: Material) => void;
  onDeleteMaterial: (materialId: string) => void;

}

export default function ThemeItem({
  themeId, title, description, expanded, zebraIndex,
  materials, onExpand, onDelete, onOpenMaterialDialog, onDeleteMaterial, onEditMaterial
}: ThemeItemProps) {
  return (
    <Box key={themeId} bgcolor={zebraIndex % 2 === 0 ? '#fafafa' : '#ffffff'}>

      <ListItem
        divider
        sx={{ cursor: 'pointer' }}
        onClick={() => onExpand(themeId)}
        secondaryAction={
          <>
            <IconButton onClick={(e) => { e.stopPropagation(); }}><Edit /></IconButton>
            <IconButton onClick={(e) => { e.stopPropagation(); onDelete(themeId); }} color="error">
              <Delete />
            </IconButton>
            <IconButton onClick={(e) => { e.stopPropagation(); onExpand(themeId); }}>
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </>
        }
      >
        <ListItemText
          primary={<Typography variant="h6" fontWeight="bold">{title}</Typography>}
          secondary={description}
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
                    <IconButton size="small" color="error" onClick={() => onDeleteMaterial(m.material_id)}>
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
