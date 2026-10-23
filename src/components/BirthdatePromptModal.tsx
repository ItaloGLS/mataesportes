import { useState } from 'react';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { useActions } from '@/lib/store';
import { isMinor, calculateAge } from '@/lib/domain/schemas';

interface BirthdatePromptModalProps {
  isOpen: boolean;
  onClose?: () => void;
  mandatory?: boolean;
}

export function BirthdatePromptModal({ isOpen, onClose, mandatory = false }: BirthdatePromptModalProps) {
  const { act, pending } = useActions();
  const [birthdate, setBirthdate] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const under18 = birthdate ? isMinor(birthdate) : false;
  const currentAge = birthdate ? calculateAge(birthdate) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!birthdate) {
      setErrorMsg('Informe sua data de nascimento.');
      return;
    }

    if (currentAge !== null && (currentAge < 5 || currentAge > 120)) {
      setErrorMsg('A idade permitida na plataforma é entre 5 e 120 anos.');
      return;
    }

    try {
      await act({
        kind: 'profile_private.save',
        birthdate,
        parent_email: under18 && parentEmail ? parentEmail.trim() : null,
        consent_given: consentGiven
      });
      toast.success('Data de nascimento confirmada com sucesso!');
      onClose?.();
    } catch {
      setErrorMsg('Não foi possível salvar sua data de nascimento. Confira os dados.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !mandatory) onClose?.(); }}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <ShieldAlert className="h-5 w-5" />
            <DialogTitle className="text-lg">Confirmação de Idade e Segurança</DialogTitle>
          </div>
          <DialogDescription className="text-sm">
            Para garantir um ambiente seguro e cumprir as normas legais de proteção a menores, informe sua data de nascimento.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="birthdate-input" className="text-xs font-semibold">
              Data de Nascimento <span className="text-destructive">*</span>
            </Label>
            <Input
              id="birthdate-input"
              type="date"
              value={birthdate}
              onChange={(e) => {
                setBirthdate(e.target.value);
                setErrorMsg('');
              }}
              max={new Date().toISOString().slice(0, 10)}
              min="1900-01-01"
              required
              className="text-sm"
            />
            {currentAge !== null && currentAge >= 5 && currentAge <= 120 && (
              <p className="text-xs text-muted-foreground">
                Idade calculada: <strong className="text-foreground">{currentAge} anos</strong>
                {under18 && <span className="ml-1 text-seal font-semibold">(Perfil Jovem / Menor de 18)</span>}
              </p>
            )}
          </div>

          {under18 && (
            <div className="space-y-3 rounded-sm border border-seal/30 bg-seal/5 p-3 text-sm">
              <div className="flex items-start gap-2 text-seal">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Proteção de Menores Ativa:</strong> Sua cidade será ocultada em respostas públicas e você fica protegido de contatos não autorizados.
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="parent-email" className="text-xs font-semibold">
                  E-mail do Responsável Legal (opcional)
                </Label>
                <Input
                  id="parent-email"
                  type="email"
                  placeholder="responsavel@email.com"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  className="text-sm"
                />
              </div>

              <label className="flex cursor-pointer items-start gap-2 pt-1">
                <Checkbox
                  checked={consentGiven}
                  onCheckedChange={(checked) => setConsentGiven(Boolean(checked))}
                  className="mt-0.5"
                />
                <span className="text-xs text-muted-foreground leading-tight">
                  Declaro ter autorização dos pais ou responsáveis para participar da rede esportiva Atletar.
                </span>
              </label>
            </div>
          )}

          {errorMsg && (
            <p className="rounded-sm bg-destructive/10 p-2 text-xs text-destructive font-medium">
              {errorMsg}
            </p>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            {!mandatory && (
              <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>
                Lembrar depois
              </Button>
            )}
            <Button type="submit" disabled={pending || !birthdate} className="w-full sm:w-auto">
              Confirmar e Prosseguir
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
