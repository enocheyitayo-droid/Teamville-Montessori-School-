'use client';
import Link,{useLinkStatus} from 'next/link';
import type {ComponentProps} from 'react';
function Progress(){const {pending}=useLinkStatus();return pending?<span className="sp-navigation-progress" role="status"><i/>Opening page…</span>:null;}
export function SchoolLink({children,...props}:ComponentProps<typeof Link>){return <Link {...props}>{children}<Progress/></Link>;}
