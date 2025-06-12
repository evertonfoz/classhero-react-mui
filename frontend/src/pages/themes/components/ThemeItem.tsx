// components/ThemeItem.tsx
import {
  Box, ListItem, ListItemText, IconButton, Typography, Collapse, Button,
  Tooltip
} from '@mui/material';
import { ExpandLess, ExpandMore, Edit, Delete, Add } from '@mui/icons-material';
import type { Material } from '../../../types/material';
import YouTubeIcon from '@mui/icons-material/YouTube';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import MicIcon from '@mui/icons-material/Mic';

interface ThemeItemProps {
  themeId: string;
  title: string;
  description: string;
  expanded: boolean;
  materials: Material[];
  order: number;

  onExpand: (themeId: string) => void;
  onDeleteThemeClick: (themeId: string) => void;

  onOpenMaterialDialog: (themeId: string) => void;
  zebraIndex: number;
  onEditMaterial: (material: Material) => void;
  handleDeleteMaterialClick: (materialId: string) => void;
  onEditTheme: (themeId: string) => void;

}

export default function ThemeItem({
  themeId, title, description, expanded, zebraIndex, order,
  materials, onExpand, onDeleteThemeClick, onOpenMaterialDialog, handleDeleteMaterialClick, onEditMaterial, onEditTheme
}: ThemeItemProps) {
  return (
    <Box key={themeId} bgcolor={zebraIndex % 2 === 0 ? '#fafafa' : '#ffffff'}>

      <ListItem
        alignItems="flex-start"
        divider
        sx={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'stretch',
        }}
        onClick={() => onExpand(themeId)}
        secondaryAction={
          <Box
            display="flex"
            flexDirection="row"
            alignItems="flex-start"
            sx={{ mt: '4px' }}
          >
            <IconButton onClick={(e) => { e.stopPropagation(); onEditTheme(themeId); }}>
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
        {/* Número rotacionado */}
        <Box width={48}
          // height={80}
          sx={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            color: '#ffffff',
            backgroundColor: '#212121',
            fontWeight: 'bold',
            fontSize: '2.625rem',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 1.5,
            borderTopLeftRadius: '4px',
            borderBottomLeftRadius: '4px',
            flexShrink: 0,
          }}
        >
          {order}
        </Box>

        {/* Conteúdo com ajuste de espaço */}
        <Box sx={{ flex: 1, pl: 2, pr: 10 }}> {/* pr: 6 garante espaço para os ícones */}
          <ListItemText
            primary={<Typography variant="h6" fontWeight="bold">{title}</Typography>}
            secondary={description}
          />
        </Box>
      </ListItem>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box px={4} py={2} bgcolor="#ffffff">
          {materials.length > 0 ? (
            materials.map((m, index) => (
              <Box
                key={m.material_id}
                display="flex"
                alignItems="stretch"
                minHeight={72}
                mb={2}
                bgcolor={index % 2 === 0 ? '#f5f5f5' : '#ffffff'}
              >

                {/* Coluna da Esquerda: Título e descrição */}
                <Box display="flex" alignItems="center" gap={1}>
                  <Box
                    sx={{
                      bgcolor: '#9e9e9e', // cinza médio (mais escuro que antes)
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: '0.875rem',
                      borderRadius: 1,
                      px: 1.5,
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 32,
                    }}
                  >
                    {m.order}
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {m.name}
                    </Typography>
                    {m.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        mb={0.5}
                        sx={{ fontSize: '0.725rem' }}
                      >
                        {m.description}
                      </Typography>


                    )}
                  </Box>
                </Box>


                {/* Coluna da Direita: Tipo, link e ações */}
                <Box display="flex" flexDirection="column" alignItems="flex-end" minWidth="180px">
                  <Typography variant="body2">
                    Tipo: <strong>{m.type.toUpperCase()}</strong>
                  </Typography>

                  {/* Grupo de botões para links */}
                  <Box display="flex" gap={0.5} mt={0.5}>
                    {/* Ícone principal do material (condicional por tipo) */}
                    {m.type === 'pdf' && m.content && (
                      <Tooltip title="Abrir PDF">
                        <IconButton
                          size="small"
                          component="a"
                          href={m.content}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <PictureAsPdfIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                    {m.type === 'video' && m.content && (
                      <Tooltip title="Assistir vídeo">
                        <IconButton
                          size="small"
                          component="a"
                          href={m.content}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <YouTubeIcon sx={{ color: '#FF0000' }} fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}


                   {m.type === 'podcast' && m.url && (
  <Tooltip title="Ouvir Podcast">
    <IconButton
      size="small"
      href={m.url}
      target="_blank"
      rel="noopener noreferrer"
    >
        <MicIcon sx={{ color: '#1976d2', fontSize: 24 }} /> {/* Azul padrão MUI */}
    </IconButton>
  </Tooltip>
)}




                    {m.youtube_pt_url && (
                      <Tooltip title="Ver no YouTube (PT)">
                        <IconButton
                          size="small"
                          href={m.youtube_pt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Box display="flex" flexDirection="column" alignItems="center" gap={0.2}>
                            <YouTubeIcon sx={{ color: '#FF0000', fontSize: 24 }} />
                            <Typography variant="caption" fontSize="1.1rem">🇧🇷</Typography>
                          </Box>
                        </IconButton>
                      </Tooltip>

                    )}

                    {m.youtube_en_url && (
                      <Tooltip title="Watch on YouTube (EN)">
                        <IconButton
                          size="small"
                          href={m.youtube_en_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Box display="flex" flexDirection="column" alignItems="center" gap={0.2}>
                            <YouTubeIcon sx={{ color: '#8E24AA', fontSize: 24 }} />
                            <Typography variant="caption" fontSize="1.1rem">🇺🇸</Typography>
                          </Box>
                        </IconButton>
                      </Tooltip>

                    )}
                  </Box>

                  {/* Botões de ação */}
                  <Box mt={1}>
                    <IconButton size="small" onClick={() => onEditMaterial({ ...m, theme_id: themeId })}>
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
