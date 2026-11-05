"use client";
export default function SchoolError({reset}:{reset:()=>void}){return <main id="main-content" className="sp-login"><h1>Records are temporarily unavailable.</h1><p>Your information has not been changed. Please try again.</p><button className="sp-button" onClick={reset}>Try again</button></main>;}
