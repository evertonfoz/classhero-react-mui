// components/ThemesList.tsx
import { List, Typography } from '@mui/material';
import ThemeItem from './ThemeItem';
import type { Material } from '../../../types/material';

interface Theme {
  id: string;
  title: string;
  description: string;
  order: number;
}

interface Props {
  themes: Theme[];
  expandedThemeId: string | null;
  materialsMap: Record<string, Material[]>;
  onExpand: (themeId: string) => void;
  onOpenMaterialDialog: (themeId: string) => void;
  onEditMaterial: (material: Material) => void;
  onDeleteMaterial: (materialId: string) => void;
  onDeleteThemeClick: (themeId: string) => void;
  onEditTheme: (themeId: string) => void;
}

export default function ThemesList({
  themes,
  expandedThemeId,
  materialsMap,
  onExpand,
  onOpenMaterialDialog,
  onEditMaterial,
  onDeleteMaterial,
  onDeleteThemeClick,
  onEditTheme,
}: Props) {
  return (
    <>
      <List>
        {themes.map((t, index) => (
          <ThemeItem
            key={t.id}
            themeId={t.id}
            title={t.title}
            description={t.description}
            expanded={expandedThemeId === t.id}
            materials={materialsMap[t.id] || []}
            onExpand={onExpand}
            onOpenMaterialDialog={onOpenMaterialDialog}
            zebraIndex={index}
            onEditMaterial={onEditMaterial}
            handleDeleteMaterialClick={onDeleteMaterial}
            onDeleteThemeClick={onDeleteThemeClick}
            order={t.order}
            onEditTheme={onEditTheme}
          />
        ))}
      </List>

      {themes.length === 0 && (
        <Typography variant="body1" color="text.secondary" textAlign="center" mt={0}>
          Nenhum tema cadastrado ainda. Clique no botão <strong>+</strong> para adicionar o primeiro tema.
        </Typography>
      )}
    </>
  );
}
