import { useState } from 'react';
import { Flag, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { useActions } from '@/lib/store';

export interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'post' | 'profile' | 'opportunity' | 'comment';
  targetId: string;
  targetTitle?: string;
}

const REASONS = [
  'Golpe, fraude ou link externo suspeito',
  'Risco, assédio ou perigo para menores de idade',
  'Perfil falso ou declaração indevida de treinador/olheiro',
  'Conteúdo ofensivo, discriminatório ou impróprio',
  'Outro motivo grave'
];

export function ReportModal({ isOpen, onClose, targetType, targetId, targetTitle }: ReportModalProps) {
  const { act, pending, user } = useActions();
  const [selectedReason, setSelectedReason] = useState(REASONS[0]);
  const [customDetails, setCustomDetails] = useState('');

  const targetLabel = targetType === 'post'
    ? 'esta publicação'
    : targetType === 'opportunity'
    ? 'esta oportunidade'
    : targetType === 'comment'
    ? 'este comentário'
    : 'este perfil';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Você precisa estar conectado para enviar uma denúncia.');
      return;
    }

    const fullReason = customDetails.trim()
      ? `${selectedReason}: ${customDetails.trim()}`
      : selectedReason;

    try {
      await act({
        kind: 'report',
        value: {
          target_type: targetType,
          target_id: targetId,
          reason: fullReason
        }
      });
      toast.success('Denúncia registrada e encaminhada para a moderação da Atletar.');
      setCustomDetails('');
      onClose();
    } catch {
      toast.error('Não foi possível enviar a denúncia ou você já denunciou este item.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle className="text-lg">Denunciar à Moderação</DialogTitle>
          </div>
          <DialogDescription className="text-sm">
            Ajude a manter a <strong>Atletar</strong> segura e protegida contra golpes e riscos a menores. Sua denúncia é confidencial.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {targetTitle && (
            <div className="rounded-sm bg-muted p-2.5 text-xs text-muted-foreground">
              Alvo: <span className="font-semibold text-foreground">{targetTitle}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Qual é o problema com {targetLabel}?
            </Label>
            <div className="space-y-1.5">
              {REASONS.map((r) => (
                <label
                  key={r}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-sm border p-2.5 text-sm transition-colors ${
                    selectedReason === r
                      ? 'border-primary bg-primary/5 font-medium'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={selectedReason === r}
                    onChange={() => setSelectedReason(r)}
                    className="h-4 w-4 text-primary"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="report-details" className="text-xs font-semibold">
              Detalhes adicionais (opcional)
            </Label>
            <Textarea
              id="report-details"
              placeholder="Explique o que aconteceu ou cole links que ajudem a equipe de moderação..."
              value={customDetails}
              onChange={(e) => setCustomDetails(e.target.value)}
              maxLength={800}
              rows={3}
              className="resize-none text-sm"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>
              Cancelar
            </Button>
            <Button type="submit" variant="destructive" disabled={pending} className="gap-1.5">
              <Flag className="h-4 w-4" />
              Enviar Denúncia
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
