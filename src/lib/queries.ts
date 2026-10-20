import { queryOptions } from '@tanstack/react-query';
import { getPlatform } from './platform.functions';
export const platformQuery = queryOptions({queryKey:['platform'],queryFn:()=>getPlatform(),staleTime:30000,refetchInterval:30*60*1000});
