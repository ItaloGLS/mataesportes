import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Home, CalendarDays, Search, User } from "lucide-react";
import { ME } from "@/lib/store";

const NAV = [
  { to: "/", label: "Feed", icon: Home },
  { to: "/eventos", label: "Eventos", icon: CalendarDays },
  { to: "/buscar", label: "Buscar", icon: Search },
] as const;

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary font-display text-lg font-extrabold text-accent">M</span>
      <span className="font-display text-xl font-extrabold leading-none text-primary">Mata<span className="text-highlight">Esportes</span></span>
    </Link>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const item = "flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-muted-foreground transition hover:bg-secondary hover:text-primary";
  const active = { className: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" };
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-8 border-r p-6 md:flex">
        <Logo />
        <nav className="flex flex-col gap-1">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className={item} activeProps={active} activeOptions={{ exact: n.to === "/" }}>
              <n.icon className="h-5 w-5" /> {n.label}
            </Link>
          ))}
          <Link to="/perfil/$id" params={{ id: ME }} className={item} activeProps={active}>
            <User className="h-5 w-5" /> Meu perfil
          </Link>
        </nav>
        <div className="mt-auto rounded-2xl bg-primary p-4 text-sm text-primary-foreground">
          <p className="font-display text-base font-bold text-accent">Mata Sul em movimento</p>
          <p className="mt-1 opacity-80">10 cidades, 8 modalidades, um só time.</p>
        </div>
      </aside>
      <div className="min-w-0 flex-1 pb-24 md:pb-8">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/90 px-4 py-3 backdrop-blur md:hidden">
          <Logo />
        </header>
        {children}
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t bg-card md:hidden">
        {NAV.map((n) => (
          <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }} className="flex flex-col items-center gap-1 py-2 text-xs font-semibold text-muted-foreground" activeProps={{ className: "text-primary" }}>
            <n.icon className="h-5 w-5" /> {n.label}
          </Link>
        ))}
        <Link to="/perfil/$id" params={{ id: ME }} className="flex flex-col items-center gap-1 py-2 text-xs font-semibold text-muted-foreground" activeProps={{ className: "text-primary" }}>
          <User className="h-5 w-5" /> Perfil
        </Link>
      </nav>
    </div>
  );
}

export function Avatar({ iniciais, size = "md" }: { iniciais: string; size?: "md" | "lg" }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-full bg-secondary font-display font-bold text-primary ring-2 ring-accent ${size === "lg" ? "h-24 w-24 text-3xl" : "h-11 w-11 text-sm"}`}>
      {iniciais}
    </span>
  );
}

export function Chip({ children, active, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${active ? "border-primary bg-primary text-primary-foreground" : "bg-card text-foreground hover:border-primary"}`}>
      {children}
    </button>
  );
}
