import Image from 'next/image';
export default function Loading(){return <main className="sp-main sp-route-loading" aria-busy="true" role="status"><div className="sp-loading-logo"><Image src="/brand/teamville-logo.png" alt="Teamville" width={68} height={68}/></div><p>Loading your school workspace…</p><div className="sp-skeleton"/><div className="sp-skeleton"/></main>;}
