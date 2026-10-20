import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { Home, CalendarDays, Search, User, Zap } from "lucide-react";
import { ME, useStore } from "@/lib/store";
import { userById } from "@/lib/data";

const NAV = [
  { to: "/", label: "Feed", icon: Home },
  { to: "/eventos", label: "Eventos", icon: CalendarDays },
  { to: "/buscar", label: "Buscar", icon: Search },
] as const;

export function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-2">
      <motion.span whileHover={{ rotate: -12, scale: 1.1 }} className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-sport text-accent-foreground">
        <Zap className="h-5 w-5 fill-current" />
      </motion.span>
      <span className="font-display text-xl font-extrabold italic leading-none tracking-tight text-primary-foreground">
        MATA<span className="text-gradient-sport">ESPORTES</span>
      </span>
    </Link>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const me = userById(ME)!;
  const { inscricoes } = useStore();
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-primary/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 md:px-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }}
                className="relative rounded-full px-4 py-2 text-sm font-bold text-primary-foreground/70 transition-colors hover:text-primary-foreground">
                {({ isActive }) => (
                  <>
                    {isActive && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-gradient-sport" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                    <span className={`relative flex items-center gap-2 ${isActive ? "text-accent-foreground" : ""}`}><n.icon className="h-4 w-4" />{n.label}</span>
                  </>
                )}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            {inscricoes.size > 0 && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="hidden rounded-full bg-highlight px-3 py-1 text-xs font-bold text-highlight-foreground sm:inline">
                {inscricoes.size} inscrição{inscricoes.size > 1 ? "ões" : ""}
              </motion.span>
            )}
            <Link to="/perfil/$id" params={{ id: ME }} aria-label="Meu perfil">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-sport font-display text-sm font-bold text-accent-foreground ring-2 ring-primary-foreground/20 transition hover:scale-110">{me.iniciais}</span>
            </Link>
          </div>
        </div>
        <div className="h-1 bg-gradient-sport" />
      </header>

      <main className="mx-auto max-w-6xl pb-24 md:pb-10">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t bg-card/95 backdrop-blur md:hidden">
        {NAV.map((n) => (
          <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }} className="flex flex-col items-center gap-1 py-2 text-xs font-bold text-muted-foreground" activeProps={{ className: "text-accent" }}>
            <n.icon className="h-5 w-5" /> {n.label}
          </Link>
        ))}
        <Link to="/perfil/$id" params={{ id: ME }} className="flex flex-col items-center gap-1 py-2 text-xs font-bold text-muted-foreground" activeProps={{ className: "text-accent" }}>
          <User className="h-5 w-5" /> Perfil
        </Link>
      </nav>
    </div>
  );
}

export function Avatar({ iniciais, size = "md" }: { iniciais: string; size?: "md" | "lg" }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-full bg-secondary font-display font-bold text-secondary-foreground ring-2 ring-accent ${size === "lg" ? "h-24 w-24 text-3xl ring-4 ring-card" : "h-11 w-11 text-sm"}`}>
      {iniciais}
    </span>
  );
}

export function Chip({ children, active, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <motion.button type="button" onClick={onClick} whileTap={{ scale: 0.92 }}
      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-bold transition-colors ${active ? "border-accent bg-accent text-accent-foreground" : "bg-card text-foreground hover:border-accent hover:text-accent"}`}>
      {children}
    </motion.button>
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
