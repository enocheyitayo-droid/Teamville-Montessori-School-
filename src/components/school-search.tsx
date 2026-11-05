"use client";
import {createContext,useContext,useState,type Dispatch,type SetStateAction} from "react";
export const SchoolSearchContext=createContext<{query:string;setQuery:Dispatch<SetStateAction<string>>}|null>(null);
export function SchoolSearchProvider({children}:{children:React.ReactNode}){const [query,setQuery]=useState("");return <SchoolSearchContext.Provider value={{query,setQuery}}>{children}</SchoolSearchContext.Provider>;}
export function useSchoolSearch(){return useContext(SchoolSearchContext);}
