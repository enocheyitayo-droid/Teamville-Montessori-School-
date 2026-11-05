"use client";

import { BookOpen, HeartHandshake, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import s from "./school-website.module.css";

const values = [
  { icon: BookOpen, title: "A love of learning", text: "Curiosity at every step" },
  { icon: ShieldCheck, title: "Care and belonging", text: "Every child matters" },
  { icon: UsersRound, title: "Learning together", text: "Growing with others" },
  { icon: Sparkles, title: "The whole child", text: "Mind, character and creativity" },
  { icon: HeartHandshake, title: "Family partnership", text: "School and home, connected" },
];

export function SchoolValues() {
  return <section className={s.valuesRibbon} aria-label="What matters to us">
    <div className={s.valuesViewport} aria-label="School values">
      <div className={s.valuesTrack}>
        {[false, true].map(duplicate => <div className={s.valuesGroup} key={String(duplicate)} aria-hidden={duplicate || undefined}>
          {values.map(value => <div className={s.valueItem} key={value.title}>
            <value.icon size={29}/><strong>{value.title}</strong><small>{value.text}</small>
          </div>)}
        </div>)}
      </div>
    </div>
  </section>;
}
