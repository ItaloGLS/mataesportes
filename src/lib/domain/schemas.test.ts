import { describe,it,expect } from 'vitest';
import { actionSchema,eventSchema,opportunitySchema,validateImage,MAX_IMAGE_BYTES } from './schemas';
const opportunity={tipo:'Bolsa',titulo:'Bolsa-atleta municipal',organizacao:'Prefeitura de Palmares',descricao:'',cidade:'Palmares',modalidade:'',link:'',prazo:''};
const event={nome:'Corrida real',modalidade:'Corrida',cidade:'Palmares',data:'2027-01-01',local:'Centro',vagas:1,valor:'Gratuito',descricao:'',categorias:[]};
describe('Sports input rules',()=>{
 it('requires at least one event place',()=>{expect(eventSchema.safeParse({...event,vagas:0}).success).toBe(false);expect(eventSchema.safeParse(event).success).toBe(true);});
 it('rejects empty posts',()=>{expect(actionSchema.safeParse({kind:'post.create',value:{texto:' ',tipo:'Treino',modalidade:'Corrida',cidade:'Palmares',image_path:null}}).success).toBe(false);});
 it('allows only sports image formats',()=>{expect(()=>validateImage({size:100,type:'text/html'})).toThrow();expect(()=>validateImage({size:100,type:'image/jpeg'})).not.toThrow();});
 it('enforces the 5 MB image limit',()=>{expect(()=>validateImage({size:MAX_IMAGE_BYTES+1,type:'image/png'})).toThrow();expect(()=>validateImage({size:5*1024*1024,type:'image/png'})).not.toThrow();});
});
