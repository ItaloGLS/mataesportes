import { describe,it,expect } from 'vitest';
import { actionSchema,eventSchema,opportunitySchema,validateImage,MAX_IMAGE_BYTES } from './schemas';
const opportunity={tipo:'Bolsa',titulo:'Bolsa-atleta municipal',organizacao:'Prefeitura de Palmares',descricao:'',cidade:'Palmares',modalidade:'',link:'',prazo:''};
const event={nome:'Corrida real',modalidade:'Corrida',cidade:'Palmares',data:'2027-01-01',local:'Centro',vagas:1,valor:'Gratuito',descricao:'',categorias:[]};
describe('Sports input rules',()=>{
 it('requires at least one event place',()=>{expect(eventSchema.safeParse({...event,vagas:0}).success).toBe(false);expect(eventSchema.safeParse(event).success).toBe(true);});
 it('rejects empty posts',()=>{expect(actionSchema.safeParse({kind:'post.create',value:{texto:' ',tipo:'Treino',modalidade:'Corrida',cidade:'Palmares',image_path:null}}).success).toBe(false);});
 it('allows only sports image formats',()=>{expect(()=>validateImage({size:100,type:'text/html'})).toThrow();expect(()=>validateImage({size:100,type:'image/jpeg'})).not.toThrow();});
 it('enforces the 5 MB image limit',()=>{expect(()=>validateImage({size:MAX_IMAGE_BYTES+1,type:'image/png'})).toThrow();expect(()=>validateImage({size:5*1024*1024,type:'image/png'})).not.toThrow();});
 it('accepts a valid opportunity',()=>{expect(opportunitySchema.safeParse(opportunity).success).toBe(true);});
 it('rejects opportunity links without http',()=>{expect(opportunitySchema.safeParse({...opportunity,link:'www.exemplo.com'}).success).toBe(false);expect(opportunitySchema.safeParse({...opportunity,link:'https://exemplo.com/edital'}).success).toBe(true);});
 it('rejects invalid opportunity types and cities',()=>{expect(opportunitySchema.safeParse({...opportunity,tipo:'Sorteio'}).success).toBe(false);expect(opportunitySchema.safeParse({...opportunity,cidade:'Recife'}).success).toBe(false);});
 it('rejects invalid opportunity deadlines',()=>{expect(opportunitySchema.safeParse({...opportunity,prazo:'20/10/2026'}).success).toBe(false);expect(opportunitySchema.safeParse({...opportunity,prazo:'2027-03-01'}).success).toBe(true);});
});
describe('Event schedule and results',()=>{
 it('accepts a valid time and rejects invalid ones',()=>{expect(eventSchema.safeParse({...event,horario:'07:30'}).success).toBe(true);expect(eventSchema.safeParse({...event,horario:'25:00'}).success).toBe(false);});
 it('requires a name in each final result row',()=>{expect(eventSchema.safeParse({...event,encerrado:true,resultado:[{posicao:1,nome:'',marca:'3x1'}]}).success).toBe(false);expect(eventSchema.safeParse({...event,encerrado:true,resultado:[{posicao:1,nome:'Palmares FC',marca:'3x1'}]}).success).toBe(true);});
});
