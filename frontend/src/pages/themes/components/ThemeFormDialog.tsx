import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Box
} from '@mui/material';
import { useEffect, useState } from 'react';

interface ThemeFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: { title: string; description: string; order: number }) => void;
    isEditing?: boolean;
    initialData?: { title: string; description: string; order: number };
}

export default function ThemeFormDialog({
    open,
    onClose,
    onSubmit,
    isEditing = false,
    initialData,
}: ThemeFormDialogProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [order, setOrder] = useState<number | ''>('');
    const [isModified, setIsModified] = useState(false);

    useEffect(() => {
        const isChanged =
            title !== (initialData?.title || '') ||
            description !== (initialData?.description || '') ||
            order !== (initialData?.order ?? '');

        setIsModified(isChanged);
    }, [title, description, order, initialData]);


    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setDescription(initialData.description);
            setOrder(initialData.order);
        } else {
            setTitle('');
            setDescription('');
            setOrder('');
        }
    }, [initialData, open]);

    const isValid = title.trim() && description.trim() && order !== '' && !isNaN(Number(order));

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{isEditing ? 'Editar Tema' : 'Novo Tema'}</DialogTitle>
            <DialogContent sx={{ mt: 1 }}>
                <Box pt={1}>
                    <TextField
                        label="Ordem"
                        type="number"
                        value={order}
                        onChange={(e) => setOrder(e.target.value === '' ? '' : Number(e.target.value))}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Título"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        fullWidth
                        autoFocus
                        margin="normal"
                    />
                    <TextField
                        label="Descrição"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        multiline
                        rows={4}
                        fullWidth
                        margin="normal"
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                {(!isValid || !isModified) ? (
                    <Button onClick={onClose}>Fechar</Button>
                ) : (
                    <>
                        <Button
                            disabled={!isValid || !isModified}
                            onClick={() => {
                                if (initialData) {
                                    setTitle(initialData.title);
                                    setDescription(initialData.description);
                                    setOrder(initialData.order);
                                } else {
                                    setTitle('');
                                    setDescription('');
                                    setOrder('');
                                }
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={() => onSubmit({
      title: title.trim(),
      description: description.trim(),
      order: Number(order),
    })}
                            disabled={!isValid || !isModified}
                            variant="contained"
                        >
                            Salvar
                        </Button>
                    </>
                )}

            </DialogActions>

        </Dialog>
    );
}
