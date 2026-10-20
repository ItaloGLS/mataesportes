/** Index a collection once instead of scanning it for each parent row. */
export function groupBy<T>(rows:readonly T[], key:(row:T)=>string):Map<string,T[]> {
 const groups=new Map<string,T[]>();
 for(const row of rows){
  const id=key(row);const group=groups.get(id);
  if(group)group.push(row);else groups.set(id,[row]);
 }
 return groups;
}