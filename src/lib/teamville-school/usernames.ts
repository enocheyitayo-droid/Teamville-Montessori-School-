export function normaliseSchoolUsername(value:string){const username=value.trim().toUpperCase();return /^[A-Z][A-Z0-9_]{2,39}$/.test(username)?username:null;}
export function directorySurname(name:string){return normaliseSchoolUsername(name.trim().split(/\s+/).at(-1)||'');}
