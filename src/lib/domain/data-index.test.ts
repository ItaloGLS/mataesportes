import {expect,it} from 'vitest';
import {groupBy} from './data-index';
it('indexes every row once and preserves order and original data',()=>{
 const rows=[{id:'a',value:1},{id:'b',value:2},{id:'a',value:3}];let calls=0;
 const index=groupBy(rows,row=>{calls++;return row.id;});
 expect(calls).toBe(3);
 expect(index.get('a')).toEqual([rows[0],rows[2]]);
 expect(index.get('b')).toEqual([rows[1]]);
 expect(index.get('missing')).toBeUndefined();
 expect(rows).toHaveLength(3);
});