import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { Home, CalendarDays, Search, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";

const NAV = [
  { to: "/", label: "Feed", icon: Home },
  { to: "/eventos", label: "Eventos", icon: CalendarDays },
  { to: "/buscar", label: "Buscar", icon: Search },
] as const;

export function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-2">
      <motion.span whileHover={{ rotate: -4 }} className="grid h-9 w-9 place-items-center rounded-sm bg-primary font-display text-2xl font-black text-accent">
        M
      </motion.span>
      <span className="font-logo text-2xl font-extrabold leading-none text-foreground sm:text-3xl">
        MATA<span className="ml-1">ESPORTES</span>
      </span>
    </Link>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const { user, ready } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-background/55 backdrop-blur-md">
        <div className="mx-auto grid h-20 max-w-6xl grid-cols-[1fr_auto] items-center gap-4 px-4 md:grid-cols-[1fr_auto_1fr] md:px-8">
          <Logo />
          <nav className="hidden items-center justify-center gap-1 md:flex">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }}
                className="relative px-4 py-3 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground">
                {({ isActive }) => (
                  <>
                    {isActive && <motion.span layoutId="nav-pill" className="absolute inset-x-4 bottom-0 h-1 bg-accent" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                    <span className={`relative flex items-center gap-2 ${isActive ? "text-foreground" : ""}`}><n.icon className="h-4 w-4" />{n.label}</span>
                  </>
                )}
              </Link>
            ))}
          </nav>
          <div className="flex items-center justify-end gap-3">
            {user ? <><Link to="/perfil/$id" params={{ id: user.id }} aria-label="Meu perfil"><span className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-secondary-foreground ring-1 ring-border"><User className="h-4 w-4" /></span></Link><Button variant="ghost" size="icon" aria-label="Sair da conta" title="Sair da conta" onClick={async()=>{await queryClient.cancelQueries();queryClient.clear();await supabase.auth.signOut();await navigate({to:'/auth',replace:true});}}><LogOut /></Button></> : <Button asChild disabled={!ready} variant="outline"><Link to="/auth">Entrar</Link></Button>}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl pb-24 md:pb-10">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t bg-card/95 backdrop-blur md:hidden">
        {NAV.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }} className="flex flex-col items-center gap-1 py-2 text-xs font-bold text-muted-foreground" activeProps={{ className: "text-foreground bg-accent/20" }}>
            <n.icon className="h-5 w-5" /> {n.label}
          </Link>
        ))}
        {user ? <Link to="/perfil/$id" params={{ id: user.id }} className="flex flex-col items-center gap-1 py-2 text-xs font-bold text-muted-foreground" activeProps={{ className: "text-foreground bg-accent/20" }}><User className="h-5 w-5" /> Perfil</Link> : <Link to="/auth" className="flex flex-col items-center gap-1 py-2 text-xs font-bold text-muted-foreground"><User className="h-5 w-5" /> Entrar</Link>}
      </nav>
    </div>
  );
}

export function Avatar({ iniciais, size = "md", src }: { iniciais: string; size?: "md" | "lg"; src?: string }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-full bg-secondary font-display font-bold text-secondary-foreground ring-1 ring-border ${size === "lg" ? "h-24 w-24 text-3xl ring-4 ring-card" : "h-11 w-11 text-lg"}`}>
      {src ? <img src={src} alt="" className="h-full w-full rounded-full object-cover" /> : iniciais}
    </span>
  );
}

export function Chip({ children, active, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <Button type="button" onClick={onClick} variant="ghost" aria-pressed={Boolean(active)}
      className={`shrink-0 rounded-sm border px-3.5 py-1.5 text-sm font-bold transition-colors ${active ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : "border-border bg-transparent text-foreground hover:border-primary hover:bg-secondary"}`}>
      {children}
    </Button>
  );
}

export function FadeIn({ children, i = 0, className }: { children: ReactNode; i?: number; className?: string }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, delay: Math.min(i, 8) * 0.05, ease: "easeOut" }} className={className}>
      {children}
    </motion.div>
  );
}
