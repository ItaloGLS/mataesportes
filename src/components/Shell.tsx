import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { Home, CalendarDays, Search, User, LogOut, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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

export function Shell({ children, bare }: { children: ReactNode; bare?: boolean }) {
  const { user, ready } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-background/55 backdrop-blur-md">
        <div className={bare ? "mx-auto flex h-20 max-w-6xl items-center px-4 md:px-8" : "mx-auto grid h-20 max-w-6xl grid-cols-[1fr_auto] items-center gap-4 px-4 md:grid-cols-[1fr_auto_1fr] md:px-8"}>
          <Logo />
          {!bare && <nav className="hidden items-center justify-center gap-1 md:flex">
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
          </nav>}
          {!bare && <div className="flex items-center justify-end gap-3">
            {user ? <DropdownMenu><DropdownMenuTrigger asChild><button aria-label="Menu da conta" className="grid h-11 w-11 cursor-pointer place-items-center rounded-full bg-secondary text-secondary-foreground ring-1 ring-border"><User className="h-4 w-4" /></button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={()=>void navigate({to:'/perfil/$id',params:{id:user.id}})}><User className="h-4 w-4" />Meu perfil</DropdownMenuItem><DropdownMenuItem onClick={async()=>{await queryClient.cancelQueries();queryClient.clear();await supabase.auth.signOut();await navigate({to:'/auth',replace:true});}}><LogOut className="h-4 w-4" />Sair</DropdownMenuItem></DropdownMenuContent></DropdownMenu> : <Button className="hidden md:inline-flex" asChild disabled={!ready} variant="outline"><Link to="/auth">Entrar</Link></Button>}
          </div>}
        </div>
      </header>

      <main className={`mx-auto max-w-6xl md:pb-10 ${bare ? "" : "mobile-scroll-space"}`}>{children}</main>

      {!bare && <nav aria-label="Navegação do celular" className="mobile-bottom-nav fixed inset-x-3 bottom-3 z-30 grid grid-cols-5 items-center rounded-touch bg-card/95 p-2 backdrop-blur md:hidden">
        {NAV.slice(0,2).map((n) => <Link key={n.to} to={n.to} activeOptions={{exact:n.to==='/'}} className="flex min-h-12 flex-col items-center gap-1 text-[10px] font-semibold text-muted-foreground">{({isActive})=><><span className={`grid h-7 w-10 place-items-center rounded-full ${isActive?'bg-secondary text-foreground':''}`}><n.icon className="h-5 w-5" strokeWidth={isActive?2.5:2}/></span>{n.label}</>}</Link>)}
        <Button size="icon" className="h-12 w-12 justify-self-center rounded-full bg-accent text-accent-foreground shadow-none hover:bg-accent/80" aria-label="Novo registro" title="Novo registro" onClick={async()=>{if(!user){await navigate({to:'/auth'});return;}await navigate({to:'/',search:{publicar:true}});}}><Plus className="h-6 w-6" /></Button>
        <Link to="/buscar" className="flex min-h-12 flex-col items-center gap-1 text-[10px] font-semibold text-muted-foreground">{({isActive})=><><span className={`grid h-7 w-10 place-items-center rounded-full ${isActive?'bg-secondary text-foreground':''}`}><Search className="h-5 w-5" strokeWidth={isActive?2.5:2}/></span>Buscar</>}</Link>
        {user ? <Link to="/perfil/$id" params={{ id: user.id }} className="flex min-h-12 flex-col items-center gap-1 text-[10px] font-semibold text-muted-foreground">{({isActive})=><><span className={`grid h-7 w-10 place-items-center rounded-full ${isActive?'bg-secondary text-foreground':''}`}><User className="h-5 w-5" /></span>Perfil</>}</Link> : <span aria-label="Perfil indisponível sem conta" className="flex min-h-12 flex-col items-center gap-1 text-[10px] font-semibold text-muted-foreground"><span className="grid h-7 w-10 place-items-center"><User className="h-5 w-5" /></span>Perfil</span>}
      </nav>}
    </div>
  );
}

export function Avatar({ iniciais, size = "md", src }: { iniciais: string; size?: "md" | "lg"; src?: string | undefined }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-full font-display font-bold ${size === "lg" ? "h-24 w-24 bg-primary text-3xl text-accent ring-4 ring-background" : "h-11 w-11 bg-secondary text-lg text-secondary-foreground ring-1 ring-border"}`}>
      {src ? <img src={src} alt="" className="h-full w-full rounded-full object-cover" /> : iniciais}
    </span>
  );
}

export function Chip({ children, active, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <Button type="button" onClick={onClick} variant="ghost" aria-pressed={Boolean(active)}
      className={`shrink-0 rounded-sm px-3.5 py-1.5 text-sm font-bold transition-colors ${active ? "border-0 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : "border border-border bg-background text-foreground hover:bg-secondary"}`}>
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
