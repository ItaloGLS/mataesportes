import { useRouter, Link } from '@tanstack/react-router';
import { Button } from './ui/button';
export function LoadError(){const router=useRouter();return <div role="alert" className="mx-auto max-w-md space-y-4 px-6 py-16"><h1 className="text-3xl font-bold">Não foi possível carregar</h1><Button onClick={()=>void router.invalidate()}>Tentar novamente</Button><Button variant="link" asChild><Link to="/">Voltar ao feed</Link></Button></div>;}
export function Missing(){return <div className="p-8">Não encontrado.</div>;}
export function SignInPrompt(){return <Button variant="outline" className="touch-control mobile-primary" asChild><Link to="/auth">Entrar na conta</Link></Button>;}
export function metadata(title:string,description:string){return {meta:[{title:`${title} — Mata Esportes`},{name:'description',content:description},{property:'og:title',content:`${title} — Mata Esportes`},{property:'og:description',content:description},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]};}
