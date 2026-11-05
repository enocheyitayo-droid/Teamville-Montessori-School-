// CSV remains a class score-entry format, never a way to assign identities or roles.
export function parseResultCsv(input:string){
 const text=input.replace(/^\uFEFF/,''),rows:string[][]=[];let row:string[]=[],field='',quoted=false,closed=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(quoted){if(c==='"'){if(text[i+1]==='"'){field+='"';i++;}else{quoted=false;closed=true;}}else field+=c;continue;}
  if(c==='"'){if(field||closed)throw new Error('Invalid CSV quotes');quoted=true;}else if(c===','){row.push(field.trim());field='';closed=false;}else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field.trim());if(row.some(Boolean))rows.push(row);row=[];field='';closed=false;}else{if(closed&&!/\s/.test(c))throw new Error('Invalid CSV field');field+=c;}if(rows.length>5000)throw new Error('Too many rows');
 }if(quoted)throw new Error('Unclosed CSV quote');row.push(field.trim());if(row.some(Boolean))rows.push(row);return rows;
}
