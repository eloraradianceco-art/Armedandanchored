import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";

/* ─────────────────────────────────────────────────────────────
   ARMED & ANCHORED — DAILY DRILL + UNDER ATTACK
   Daily Drill: one weapon a day in seven short cards (scripture,
   the enemy's tactics, the teaching, memorize, declare, pray,
   battle plan). Under Attack: pick what you're facing and get the
   right weapon in about a minute.
   Saves into the existing aa_weapon_entries keys for each weapon:
     declared · mem_<scripture index> · journal (battle plan appended)
   Day-level records live on weapon_id 0:
     drill_<YYYY-MM-DD> = weapon id drilled that day
     battles = JSON list of Under Attack responses
   ───────────────────────────────────────────────────────────── */

const pad = n => String(n).padStart(2, "0");
const localDay = (d = new Date()) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const shortRef = r => String(r || "").replace(/\s*\([^)]*\)\s*$/, "");
const plural = (n, one, many) => n + " " + (n === 1 ? one : many);
const paras = t => String(t || "").replace(/\t+/g, " ").split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
function shuffle(a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }

function chunkVerse(text) {
  const words = String(text).trim().split(/\s+/);
  if (words.length <= 7) return words;
  const phrases = []; let cur = [];
  words.forEach(w => { cur.push(w); if (/[,;:.!?—–]["'”’)]*$/.test(w)) { phrases.push(cur); cur = []; } });
  if (cur.length) phrases.push(cur);
  const out = [];
  phrases.forEach(p => {
    let i = 0;
    while (i < p.length) { const rem = p.length - i; const size = rem <= 3 ? rem : rem === 4 ? 2 : 3; out.push(p.slice(i, i + size).join(" ")); i += size; }
  });
  return out;
}
// The shortest passage is the one to memorize and to stand on in a hurry
const shortestIdx = w => w.scriptures.reduce((best, s, i) => (s.text.length < w.scriptures[best].text.length ? i : best), 0);
// "Name — explanation" → { head, body }; tactics without a dash are just the body
const splitTactic = t => {
  const m = String(t || "").split(/\s+[—–]\s+|\s+-\s+/);
  if (m.length < 2) return { head: "", body: String(t || "") };
  const body = m.slice(1).join(" — ");
  return { head: m[0], body: body.charAt(0).toUpperCase() + body.slice(1) };
};
const lines = t => (String(t || "").match(/[^.!?]+[.!?]+["'”’)]*/g) || [String(t || "")]).map(s => s.trim()).filter(Boolean);

function speakText(text) {
  try {
    const s = window.speechSynthesis;
    if (!s || !window.SpeechSynthesisUtterance) return false;
    s.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate = 0.92; s.speak(u); return true;
  } catch (e) { return false; }
}
const hush = () => { try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {} };

/* What people face, and the weapon that answers it */
export const ATTACKS = [
  { id: "fear", label: "Fear or anxiety", weapon: 8 },
  { id: "hopeless", label: "Hopeless, like nothing will change", weapon: 26 },
  { id: "temptation", label: "Temptation", weapon: 14 },
  { id: "shame", label: "Guilt, shame or accusation", weapon: 17 },
  { id: "lies", label: "Lies running through my head", weapon: 7 },
  { id: "sword", label: "I need a word to fight back with", weapon: 24 },
  { id: "voice", label: "Confusion about whose voice this is", weapon: 11 },
  { id: "anger", label: "Anger or unforgiveness", weapon: 19 },
  { id: "quit", label: "Wanting to give up", weapon: 15 },
  { id: "forget", label: "Forgetting what God has done", weapon: 25 },
  { id: "heavy", label: "Heaviness or discouragement", weapon: 18 },
  { id: "pride", label: "Pride or needing control", weapon: 22 },
  { id: "conflict", label: "Conflict with someone", weapon: 20 },
  { id: "words", label: "Words I can’t take back", weapon: 21 },
  { id: "tired", label: "Exhausted and striving", weapon: 23 },
];

/* ---------- icons ---------- */
const Shield = () => (<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M24 5l15 6v11c0 10-6.5 17.5-15 21-8.5-3.5-15-11-15-21V11z" /><path d="M24 15v18M17 22h14" /></svg>);
const Check = () => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>);
const Close = () => (<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>);
const Flame = () => (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.6 2.5c.5 2.9 2.4 4.4 3.9 6.3 1.2 1.5 1.9 3.2 1.9 5.1A6.4 6.4 0 0 1 12 20.3a6.4 6.4 0 0 1-6.4-6.4c0-2.3 1.1-4 2.6-5.3.1 1.7.8 2.9 2 3.6-.3-3.7 1-6.9 2.4-9.7z" /></svg>);
const Speaker = () => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" /><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" /></svg>);

/* ---------- shared cards ---------- */
const verseCard = (w, i, kicker) => ({
  render: c => (<>
    <p className="dr-kicker">{kicker}</p>
    <blockquote className="dr-verse">{w.scriptures[i].text}</blockquote>
    <p className="dr-ref">{w.scriptures[i].ref}</p>
    <button className="dr-chip" onClick={() => c.speak(w.scriptures[i].text)}><Speaker />Listen</button>
  </>),
});

const declareCard = (w, cta) => ({
  ready: c => !!c.u.said,
  cta,
  render: c => (<>
    <p className="dr-kicker">Declare it out loud</p>
    <blockquote className="dr-verse dr-declare">{w.declaration}</blockquote>
    <button className={"dr-chip" + (c.u.said ? " is-on" : "")} aria-pressed={!!c.u.said} onClick={() => c.setU({ ...c.u, said: !c.u.said })}>
      {c.u.said ? <><Check />Declared</> : "I declared it"}
    </button>
  </>),
  onLeave: c => { if (c.u.said) c.declare(w.id); },
});

/* ---------- Daily Drill: seven cards on one weapon ---------- */
function buildDrill(w) {
  const mi = shortestIdx(w);
  const chunks = chunkVerse(w.scriptures[mi].text);
  const teach = paras(w.teaching);
  const prayer = lines(w.prayer);
  return [
    verseCard(w, 0, "Today’s weapon: " + w.title),
    { top: true,
      render: c => {
        const seen = c.u.seen || [];
        const toggle = i => c.setU({ ...c.u, seen: seen.includes(i) ? seen.filter(x => x !== i) : [...seen, i] });
        return (<>
          <p className="dr-kicker">Know the attack</p>
          <h2 className="dr-q">Which of these have you felt this week?</h2>
          <p className="dr-hint">Tap any that fit. Naming it is half the fight.</p>
          {w.tactics.map((t, i) => {
            const { head, body } = splitTactic(t);
            return <button key={i} className={"dr-opt" + (seen.includes(i) ? " is-sel" : "")} aria-pressed={seen.includes(i)} onClick={() => toggle(i)}>
              {head && <small>{head}</small>}{body}
            </button>;
          })}
        </>);
      } },
    { top: true,
      render: c => {
        const shown = c.u.more ? teach : teach.slice(0, 2);
        return (<>
          <p className="dr-kicker">The truth behind the weapon</p>
          <div className="dr-notes">{shown.map((p, i) => <p key={i}>{p}</p>)}</div>
          {!c.u.more && teach.length > 2 && <button className="dr-link dr-left" onClick={() => c.setU({ ...c.u, more: true })}>Keep reading</button>}
        </>);
      } },
    { top: true,
      init: () => {
        let o; let g = 0;
        do { o = shuffle(chunks.map((_, i) => i)); g++; } while (chunks.length > 1 && g < 20 && o.every((v, i) => chunks[v] === chunks[i]));
        return { order: o, placed: [], miss: 0, bad: null };
      },
      ready: c => !!c.u.placed && c.u.placed.length === chunks.length,
      render: c => {
        const u = c.u; const done = u.placed.length === chunks.length;
        const tap = i => {
          if (chunks[i] === chunks[u.placed.length]) c.setU({ ...u, placed: [...u.placed, i], bad: null });
          else { c.setU({ ...u, miss: u.miss + 1, bad: i }); setTimeout(() => c.setU(p => (p.bad === i ? { ...p, bad: null } : p)), 450); }
        };
        return (<>
          <p className="dr-kicker">Sharpen the sword</p>
          <h2 className="dr-q">Rebuild the verse.</h2>
          <p className="dr-hint" aria-live="polite">{done ? "Rebuilt with " + plural(u.miss, "miss", "misses") + "." : "Tap the phrases in order."}</p>
          <p className={"dr-built" + (done ? " is-complete" : "")}>{u.placed.map(i => chunks[i]).join(" ")}{!done && <span className="dr-slot" aria-hidden="true" />}</p>
          <p className="dr-ref">{w.scriptures[mi].ref}</p>
          <div className="dr-chunks">
            {u.order.filter(i => !u.placed.includes(i)).map(i => (
              <button key={i} className={"dr-chunk" + (u.bad === i ? " is-bad" : "")} onClick={() => tap(i)}>{chunks[i]}</button>
            ))}
          </div>
        </>);
      },
      onLeave: c => { if (c.u.placed && c.u.placed.length === chunks.length) c.set(w.id, "mem_" + mi, "true"); } },
    declareCard(w),
    { top: true,
      init: () => ({ line: 0 }),
      next: c => { if (c.u.line < prayer.length - 1) { c.setU({ ...c.u, line: c.u.line + 1 }); return true; } return false; },
      cta: c => (c.u.line < prayer.length - 1 ? "Next line" : "Amen"),
      render: c => (<>
        <p className="dr-kicker">Pray it, one line at a time</p>
        <div className="dr-pray">{prayer.slice(0, c.u.line + 1).map((l, i) => <p key={i} className={i < c.u.line ? "is-past" : ""}>{l}</p>)}</div>
      </>) },
    { top: true,
      cta: "Deploy it",
      skip: true,
      ready: c => !!String(c.u.plan || "").trim(),
      render: c => (<>
        <p className="dr-kicker">Battle plan</p>
        <div className="dr-chal">{w.challenge}</div>
        <h2 className="dr-q">Where will you use this weapon today?</h2>
        <textarea className="dr-textarea" rows={4} value={c.u.plan || ""} placeholder="Today, when…" aria-label="Your battle plan"
          onChange={e => c.setU({ ...c.u, plan: e.target.value })} />
        <p className="dr-hint dr-after">Saved to this weapon{"’"}s journal.</p>
      </>),
      onLeave: c => { if (String(c.u.plan || "").trim()) c.appendJournal(w.id, c.u.plan.trim()); } },
  ];
}

/* ---------- Under Attack: about a minute ---------- */
function buildSos(w) {
  const si = shortestIdx(w);
  return [
    verseCard(w, si, "Stand on this"),
    { top: true,
      render: () => (<>
        <p className="dr-kicker">See it for what it is</p>
        <h2 className="dr-q">This is how the enemy works here.</h2>
        {w.tactics.slice(0, 3).map((t, i) => {
          const { head, body } = splitTactic(t);
          return <div key={i} className="dr-tac">{head ? <><b>{head}</b><br />{body}</> : body}</div>;
        })}
        <p className="dr-hint dr-after">Naming the attack takes away its cover.</p>
      </>) },
    declareCard(w),
    { top: true,
      render: () => (<>
        <p className="dr-kicker">Pray</p>
        <div className="dr-pray">{lines(w.prayer).map((l, i) => <p key={i}>{l}</p>)}</div>
      </>) },
    { cta: "I’m standing",
      render: () => (<>
        <p className="dr-kicker">One move, right now</p>
        <div className="dr-chal">{w.challenge}</div>
      </>) },
  ];
}

/* ─────────────────────────────────────────────────────────────
   COMPONENT: the home panel plus the full-screen sessions
   ───────────────────────────────────────────────────────────── */
export default function Drill({ weapons, entries = [], getFor, setFor, onDeclare, onOpenWeapon, lightMode = false }) {
  const [session, setSession] = useState(null);   // { flow: 'drill'|'sos'|'pick'|'attack', weaponId, attackId, card }
  const [u, setU] = useState({});
  const [done, setDone] = useState(null);         // { flow, weaponId, attackId }
  const [toast, setToast] = useState("");
  const ovRef = useRef(null);
  const closeRef = useRef(null);
  const today = localDay();
  const theme = "dr-root " + (lightMode ? "dr-light" : "dr-dark");
  const byId = id => weapons.find(w => w.id === id);

  /* ---- records on weapon 0 ---- */
  const drillDays = useMemo(() => {
    const m = {};
    entries.forEach(e => { if (String(e.weapon_id) === "0" && /^drill_\d{4}-\d{2}-\d{2}$/.test(e.field_key || "")) m[e.field_key.slice(6)] = +e.field_value; });
    return m;
  }, [entries]);
  const drilledSet = useMemo(() => new Set(Object.values(drillDays)), [drillDays]);
  const streak = useMemo(() => {
    const d = new Date(); let n = 0;
    if (!drillDays[localDay(d)]) d.setDate(d.getDate() - 1);
    while (drillDays[localDay(d)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }, [drillDays]);
  const doneToday = drillDays[today] ? byId(drillDays[today]) : null;
  const suggested = useMemo(() => {
    const next = weapons.find(w => !drilledSet.has(w.id));
    if (next) return next;
    // Every weapon drilled: start the round again from the one drilled longest ago
    const last = {}; Object.entries(drillDays).forEach(([d, id]) => { if (!last[id] || d > last[id]) last[id] = d; });
    return weapons.slice().sort((a, b) => String(last[a.id] || "").localeCompare(String(last[b.id] || "")))[0];
  }, [weapons, drilledSet, drillDays]);
  const [pick, setPick] = useState(null);
  const todayWeapon = pick ? byId(pick) : suggested;

  /* ---- toast ---- */
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 2600); return () => clearTimeout(t); }, [toast]);

  /* ---- session control ---- */
  const cardsFor = s => (s.flow === "drill" ? buildDrill(byId(s.weaponId)) : buildSos(byId(s.weaponId)));
  const cards = session && (session.flow === "drill" || session.flow === "sos") ? cardsFor(session) : null;
  const card = cards ? cards[session.card] : null;

  const ctx = () => ({
    u, setU,
    get: getFor, set: setFor,
    declare: id => onDeclare && onDeclare(id),
    appendJournal: (id, text) => {
      const prev = getFor(id, "journal");
      const stamp = new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" });
      setFor(id, "journal", (prev ? prev.trim() + "\n\n" : "") + "Battle plan, " + stamp + ": " + text);
    },
    speak: t => { if (!speakText(t)) setToast("Listening isn’t supported in this browser."); },
  });
  const c = ctx();

  const enter = (s, idx) => {
    const list = cardsFor(s);
    hush();
    setSession({ ...s, card: idx });
    setU(list[idx].init ? list[idx].init() : {});
    if (ovRef.current) ovRef.current.scrollTop = 0;
  };
  const startDrill = w => { setDone(null); enter({ flow: "drill", weaponId: w.id }, 0); };
  const startSos = a => { setDone(null); enter({ flow: "sos", weaponId: a.weapon, attackId: a.id }, 0); };
  const openAttack = () => { setDone(null); setSession({ flow: "attack" }); setU({}); };
  const openPick = () => { setDone(null); setSession({ flow: "pick" }); setU({}); };
  const close = () => { hush(); setSession(null); setDone(null); setU({}); };
  closeRef.current = close;

  const finish = () => {
    const s = session;
    if (s.flow === "drill") setFor(0, "drill_" + today, String(s.weaponId));
    if (s.flow === "sos") {
      let list = []; try { list = JSON.parse(getFor(0, "battles") || "[]"); } catch (e) { list = []; }
      list.push({ d: new Date().toISOString(), a: s.attackId, w: s.weaponId });
      setFor(0, "battles", JSON.stringify(list.slice(-200)));
    }
    hush();
    setSession(null); setU({});
    setDone({ flow: s.flow, weaponId: s.weaponId, attackId: s.attackId });
    if (ovRef.current) ovRef.current.scrollTop = 0;
  };

  const ready = card ? (card.ready ? card.ready(c) : true) : false;
  const ctaLabel = card ? (typeof card.cta === "function" ? card.cta(c) : card.cta || "Continue") : "";
  const leave = () => { if (card && card.onLeave) card.onLeave(c); };
  const goNext = () => {
    if (card.next && card.next(c)) return;
    leave();
    if (session.card < cards.length - 1) { enter(session, session.card + 1); return; }
    finish();
  };
  const skip = () => {
    if (session.card < cards.length - 1) { enter(session, session.card + 1); return; }
    finish();
  };

  /* ---- overlay: lock page scroll, Escape closes ---- */
  const overlayOpen = !!session || !!done;
  useEffect(() => {
    if (!overlayOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = e => { if (e.key === "Escape" && closeRef.current) closeRef.current(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [overlayOpen]);
  useEffect(() => () => hush(), []);

  const head = (title, count) => (
    <div className="dr-top">
      <div className="dr-head">
        <button className="dr-icon" onClick={close} aria-label="Close"><Close /></button>
        <div className="dr-stitle">{title}</div>
        <div className="dr-count">{count || ""}</div>
      </div>
      {cards && <div className="dr-segs" aria-hidden="true">{cards.map((_, i) => <span key={i} className={i <= session.card ? "is-on" : ""} />)}</div>}
    </div>
  );

  const sw = session && session.weaponId ? byId(session.weaponId) : null;
  const overlay = overlayOpen ? createPortal(
    <div className={theme + " dr-overlay"} ref={ovRef} role="dialog" aria-modal="true" aria-label={session ? (session.flow === "attack" ? "Under attack" : sw ? sw.title : "Choose a weapon") : "Done"}>
      {session && session.flow === "attack" && (
        <div className="dr-session">
          {head("Under Attack")}
          <main className="dr-card is-top">
            <h2 className="dr-q">What are you facing right now?</h2>
            <p className="dr-hint">Pick the closest one. You{"’"}ll have the right weapon in about a minute.</p>
            <div className="dr-attacks">
              {ATTACKS.map(a => <button key={a.id} className="dr-attack" onClick={() => startSos(a)}>{a.label}<small>{byId(a.weapon).icon} {byId(a.weapon).title}</small></button>)}
            </div>
          </main>
        </div>
      )}
      {session && session.flow === "pick" && (
        <div className="dr-session">
          {head("Choose your weapon")}
          <main className="dr-card is-top">
            <h2 className="dr-q">Which weapon do you need today?</h2>
            <div className="dr-grid">
              {weapons.map(w => (
                <button key={w.id} className={"dr-wpn" + (drilledSet.has(w.id) ? " is-done" : "") + (todayWeapon && w.id === todayWeapon.id ? " is-sel" : "")}
                  onClick={() => { setPick(w.id); close(); }}>
                  <span className="dr-wpn-ic">{w.icon}</span><span className="dr-wpn-t">{w.title}</span>
                  {drilledSet.has(w.id) && <span className="dr-wpn-d"><Check /></span>}
                </button>
              ))}
            </div>
          </main>
        </div>
      )}
      {session && card && (
        <div className="dr-session">
          {head(session.flow === "sos" ? "Under Attack" : sw.icon + " " + sw.tag, (session.card + 1) + " / " + cards.length)}
          <main key={session.flow + session.card} className={"dr-card" + (card.top ? " is-top" : "")}>{card.render(c)}</main>
          <div className="dr-foot">
            <button className="dr-btn dr-primary" disabled={!ready} onClick={goNext}>{ctaLabel}</button>
            {card.skip && !ready && <button className="dr-link" onClick={skip}>Skip for now</button>}
          </div>
        </div>
      )}
      {done && (() => {
        const w = byId(done.weaponId);
        const sos = done.flow === "sos";
        const nextUp = weapons.find(x => !drilledSet.has(x.id) && x.id !== w.id);
        return (
          <div className="dr-done">
            <div className="dr-badge"><Shield /></div>
            {sos ? (<>
              <h1 className="dr-dtitle">You stood your ground</h1>
              <p className="dr-dsub">{shortRef(w.scriptures[shortestIdx(w)].ref)} is yours to carry today. Come back here any time it hits again.</p>
            </>) : (<>
              <p className="dr-dcount">{w.icon} {w.title}</p>
              <h1 className="dr-dtitle">Weapon deployed</h1>
              <p className="dr-dsub">{streak > 0 ? <><b>{streak}</b>-day streak. Stay ready.</> : "Drilled and ready."}</p>
              <div className="dr-arsenal" role="img" aria-label={drilledSet.size + " of " + weapons.length + " weapons drilled"}>
                {weapons.map(x => <span key={x.id} className={drilledSet.has(x.id) ? "is-done" : ""} />)}
              </div>
              <p className="dr-meta">{drilledSet.size} of {weapons.length} weapons drilled{nextUp ? " · Tomorrow: " + nextUp.title : ""}</p>
            </>)}
            <button className="dr-btn dr-primary dr-wide" onClick={close}>Done</button>
            <button className="dr-link" onClick={() => { close(); onOpenWeapon && onOpenWeapon(w.id); }}>Open the full weapon</button>
          </div>
        );
      })()}
    </div>, document.body) : null;

  const w = todayWeapon;
  return (
    <div className={theme}>
      <style>{CSS}</style>
      <div className="dr-panel">
        <div className="dr-today">
          <div className="dr-today-row">
            <span className="dr-label">Today{"\u2019"}s drill {"\u00B7"} 5 min</span>
            <span className="dr-streak"><Flame />{streak > 0 ? <span><b>{streak}</b>-day streak</span> : <span>Start a streak</span>}</span>
          </div>
          {doneToday && !pick ? (<>
            <div className="dr-wrow"><span className="dr-wic">{doneToday.icon}</span><span><span className="dr-wt">{doneToday.title}</span><span className="dr-ws">Drilled today. Stay ready.</span></span><span className="dr-ok"><Check /></span></div>
            <div className="dr-actions"><button className="dr-link dr-quiet" onClick={openPick}>Drill another weapon</button></div>
          </>) : (<>
            <div className="dr-wrow"><span className="dr-wic">{w.icon}</span><span><span className="dr-wt">{w.title}</span><span className="dr-ws">{w.subtitle}</span></span></div>
            <div className="dr-actions">
              <button className="dr-btn dr-primary" onClick={() => startDrill(w)}>Start drill</button>
              <button className="dr-link dr-quiet" onClick={openPick}>Change</button>
            </div>
          </>)}
        </div>

        <button className="dr-sos" onClick={openAttack}>
          <span className="dr-sos-ic"><Shield /></span>
          <span><span className="dr-sos-t">Under attack?</span><span className="dr-sos-s">The right weapon in a minute</span></span>
        </button>
      </div>
      {overlay}
      {toast && createPortal(<div className={theme}><div className="dr-toast" role="status">{toast}</div></div>, document.body)}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STYLES (scoped to .dr-root) — Armed & Anchored palette
   ───────────────────────────────────────────────────────────── */
const CSS = `
.dr-root{--bg:#070E17;--panel:#0D1B2A;--ink:#EDE6D6;--body:#C8BEAA;--muted:#8A9CAD;--line:rgba(255,255,255,.09);--red:#9E2828;--redL:#C94848;--redSoft:rgba(158,40,40,.16);--gold:#B08A4E;--goldL:#D4A853;--goldSoft:rgba(176,138,78,.14);--onRed:#F5EFE3;--sage:#8FA697;--sageSoft:rgba(124,146,132,.18);font-family:"EB Garamond",Garamond,Georgia,serif;color:var(--body);-webkit-font-smoothing:antialiased;font-size:18px;line-height:1.55}
.dr-root.dr-light{--bg:#F2EDE3;--panel:#FBF8F2;--ink:#1A1209;--body:#3D2E1A;--muted:#6E5E4E;--line:rgba(0,0,0,.1);--red:#9E2828;--redL:#9E2828;--redSoft:rgba(158,40,40,.1);--gold:#8B6A30;--goldL:#8B6A30;--goldSoft:rgba(139,106,48,.12);--onRed:#FBF8F2;--sage:#4A7A5A;--sageSoft:rgba(74,122,90,.12)}
.dr-root *,.dr-root *::before,.dr-root *::after{box-sizing:border-box}
.dr-root p,.dr-root h1,.dr-root h2,.dr-root h3,.dr-root blockquote{margin:0;padding:0}
.dr-root button{font-family:inherit;color:inherit;-webkit-tap-highlight-color:transparent}
.dr-root :focus-visible{outline:2px solid var(--gold);outline-offset:3px;border-radius:8px}

.dr-panel{display:grid;grid-template-columns:1fr;gap:10px}
.dr-sos{display:grid;grid-template-columns:40px 1fr;gap:12px;align-items:center;width:100%;text-align:left;border:1.5px solid rgba(201,72,72,.5);background:linear-gradient(135deg,rgba(158,40,40,.34),rgba(158,40,40,.12));border-radius:16px;padding:10px 14px;cursor:pointer;min-height:60px}
.dr-sos-ic{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:rgba(158,40,40,.35);color:var(--onRed)}
.dr-sos-ic svg{width:24px;height:24px}
.dr-sos-t{display:block;font-family:Cinzel,Georgia,serif;font-weight:600;font-size:17px;letter-spacing:.04em;color:var(--ink)}
.dr-sos-s{display:block;font-size:15px;color:var(--body);opacity:.85}
.dr-light .dr-sos{background:linear-gradient(135deg,rgba(158,40,40,.14),rgba(158,40,40,.05))}
.dr-light .dr-sos-ic{color:var(--red);background:rgba(158,40,40,.14)}
@media (min-width:640px){
  .dr-panel{grid-template-columns:1.75fr 1fr;align-items:stretch}
  .dr-sos{grid-template-columns:1fr;justify-items:center;align-content:center;text-align:center;gap:10px;padding:18px}
}

.dr-today{border:1px solid var(--line);background:linear-gradient(145deg,rgba(255,255,255,.04),rgba(255,255,255,.012));border-radius:16px;padding:16px}
.dr-light .dr-today{background:var(--panel)}
.dr-today-row{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px}
.dr-label{font-family:Cinzel,Georgia,serif;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--gold)}
.dr-streak{display:inline-flex;align-items:center;gap:5px;font-size:15px;color:var(--muted)}
.dr-streak svg{width:14px;height:14px;color:var(--redL)}
.dr-streak b,.dr-dsub b{color:var(--ink);font-weight:600}
.dr-wrow{display:grid;grid-template-columns:40px 1fr auto;gap:12px;align-items:center;margin-bottom:14px}
.dr-wic{font-size:28px;line-height:1;text-align:center}
.dr-wt{display:block;font-family:Cinzel,Georgia,serif;font-weight:600;font-size:17px;color:var(--ink);line-height:1.25}
.dr-ws{display:block;font-size:16px;color:var(--muted);font-style:italic;line-height:1.35;margin-top:2px}
.dr-ok{width:32px;height:32px;border-radius:50%;display:grid;place-items:center;background:var(--sageSoft);color:var(--sage)}
.dr-actions{display:flex;gap:6px;align-items:center}
.dr-actions .dr-primary{flex:1}
.dr-quiet{font-size:16px;text-decoration:none!important;padding:12px 10px;white-space:nowrap}
.dr-arsenal{display:flex;gap:3px;width:100%}
.dr-arsenal span{flex:1;height:8px;border-radius:2px;background:var(--line)}
.dr-arsenal span.is-done{background:var(--redL)}
.dr-meta{font-size:15px;color:var(--muted);margin-top:8px!important}

.dr-btn{flex:1}
.dr-arsenal{display:flex;gap:3px;width:100%}
.dr-arsenal span{flex:1;height:8px;border-radius:2px;background:var(--line)}
.dr-arsenal span.is-done{background:var(--redL)}
.dr-meta{font-size:15px;color:var(--muted);margin-top:8px!important}

.dr-btn{appearance:none;border:0;border-radius:12px;padding:13px 16px;font-size:18px;font-weight:600;cursor:pointer;min-height:50px;font-family:Cinzel,Georgia,serif;letter-spacing:.04em}
.dr-primary{background:linear-gradient(135deg,#B33232,#8A2222);color:var(--onRed)!important;border:1px solid rgba(201,72,72,.6)}
.dr-primary:disabled{background:var(--line);border-color:transparent;color:var(--muted)!important;cursor:not-allowed}
.dr-ghost{background:transparent;border:1.5px solid var(--line);color:var(--ink)!important;font-size:16px}
.dr-wide{width:100%}
.dr-link{background:none;border:0;color:var(--muted)!important;font-size:17px;text-decoration:underline;text-underline-offset:3px;padding:10px;cursor:pointer}
.dr-left{padding-left:0;margin-top:12px;display:inline-block}

.dr-overlay{position:fixed;inset:0;z-index:1000;background:var(--bg);overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
.dr-session{min-height:100%;display:flex;flex-direction:column;max-width:480px;margin:0 auto;padding:0 22px}
.dr-top{position:sticky;top:0;background:var(--bg);z-index:5;padding-top:calc(8px + env(safe-area-inset-top,0px))}
.dr-head{display:grid;grid-template-columns:44px 1fr 52px;align-items:center;padding-bottom:8px}
.dr-icon{width:44px;height:44px;border-radius:50%;border:0;background:transparent;display:grid;place-items:center;color:var(--muted)!important;cursor:pointer;margin-left:-10px}
.dr-stitle{text-align:center;font-family:Cinzel,Georgia,serif;font-weight:600;font-size:14px;color:var(--ink);letter-spacing:.08em;text-transform:uppercase}
.dr-count{text-align:right;font-size:15px;color:var(--muted)}
.dr-segs{display:flex;gap:4px;padding-bottom:6px}
.dr-segs span{flex:1;height:3px;border-radius:2px;background:var(--line)}
.dr-segs span.is-on{background:var(--redL)}
.dr-card{flex:1;display:flex;flex-direction:column;justify-content:center;padding:26px 0 18px;animation:dr-in .28s ease}
.dr-card.is-top{justify-content:flex-start}
.dr-foot{position:sticky;bottom:0;padding:14px 0 calc(16px + env(safe-area-inset-bottom,0px));background:linear-gradient(to top,var(--bg) 72%,transparent);display:flex;flex-direction:column;gap:2px;z-index:5}

.dr-kicker{margin-bottom:14px!important;color:var(--muted);font-style:italic;font-size:17px}
.dr-verse{margin-bottom:14px!important;font-size:26px;line-height:1.42;color:var(--ink);font-style:italic;border:0}
.dr-declare{font-style:normal;font-family:Cinzel,Georgia,serif;font-size:21px;line-height:1.5;letter-spacing:.01em}
.dr-ref{font-family:Cinzel,Georgia,serif;font-size:14px;letter-spacing:.07em;color:var(--gold);margin-bottom:22px!important}
.dr-chip{display:inline-flex;align-items:center;gap:8px;border:1.5px solid var(--line);background:var(--panel);border-radius:999px;padding:10px 18px;font-size:17px;color:var(--ink)!important;cursor:pointer;align-self:flex-start;min-height:44px}
.dr-chip.is-on{border-color:var(--redL);background:var(--redSoft);color:var(--redL)!important}
.dr-q{font-size:26px;line-height:1.3;color:var(--ink);font-weight:500;margin-bottom:10px!important}
.dr-hint{color:var(--muted);font-size:17px;margin-bottom:18px!important;font-style:italic}
.dr-after{margin-top:14px}
.dr-notes p{margin-bottom:14px!important;font-size:19px;line-height:1.6;color:var(--body)}
.dr-opt{display:block;width:100%;text-align:left;border:1.5px solid var(--line);background:var(--panel);border-radius:14px;padding:14px 16px;font-size:18px;line-height:1.4;color:var(--body)!important;margin-bottom:10px;cursor:pointer}
.dr-opt small{display:block;font-family:Cinzel,Georgia,serif;font-size:14px;letter-spacing:.03em;color:var(--ink);margin-bottom:4px;font-weight:600}
.dr-opt.is-sel{border-color:var(--redL);background:var(--redSoft)}
.dr-opt.is-sel small{color:var(--redL)}
.dr-tac{border-left:3px solid var(--redL);padding:2px 0 2px 14px;margin-bottom:16px;font-size:19px;line-height:1.45;color:var(--body)}
.dr-tac b{color:var(--ink);font-weight:600}
.dr-chal{border-left:3px solid var(--gold);padding:2px 0 2px 16px;margin-bottom:22px;font-size:20px;line-height:1.5;color:var(--ink)}
.dr-textarea{width:100%;background:var(--panel);border:1.5px solid var(--line);border-radius:12px;padding:14px;font-family:inherit;font-size:18px;line-height:1.5;color:var(--ink);resize:vertical;min-height:110px;display:block}
.dr-textarea:focus{outline:none;border-color:var(--gold)}
.dr-built{min-height:120px;font-size:24px;line-height:1.45;font-style:italic;color:var(--ink);margin-bottom:6px!important}
.dr-built.is-complete{color:var(--goldL)}
.dr-slot{display:inline-block;width:40px;border-bottom:2px dashed var(--redL);margin-left:4px;height:1em;vertical-align:baseline;animation:dr-blink 1.2s steps(2) infinite}
.dr-chunks{display:flex;flex-wrap:wrap;gap:8px}
.dr-chunk{border:1.5px solid var(--line);background:var(--panel);border-radius:10px;padding:10px 14px;font-size:18px;color:var(--ink)!important;cursor:pointer;min-height:44px}
.dr-root .is-bad{border-color:var(--redL)!important;background:var(--redSoft)!important;animation:dr-shake .35s}
.dr-pray p{font-size:22px;line-height:1.45;font-style:italic;margin-bottom:16px!important;color:var(--ink);transition:opacity .4s}
.dr-pray p.is-past{opacity:.38}

.dr-attacks{display:grid;grid-template-columns:1fr;gap:8px}
.dr-attack{display:block;text-align:left;border:1.5px solid var(--line);background:var(--panel);border-radius:14px;padding:13px 16px;font-size:19px;line-height:1.3;color:var(--ink)!important;cursor:pointer}
.dr-attack small{display:block;font-size:15px;color:var(--muted);margin-top:3px;font-style:italic}
.dr-attack:active{border-color:var(--redL);background:var(--redSoft)}
.dr-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.dr-wpn{position:relative;display:flex;flex-direction:column;gap:6px;text-align:left;border:1.5px solid var(--line);background:var(--panel);border-radius:14px;padding:12px;cursor:pointer;min-height:96px}
.dr-wpn.is-sel{border-color:var(--gold)}
.dr-wpn-ic{font-size:24px;line-height:1}
.dr-wpn-t{font-size:16px;line-height:1.25;color:var(--ink)}
.dr-wpn-d{position:absolute;top:10px;right:10px;color:var(--sage)}

.dr-done{min-height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:calc(36px + env(safe-area-inset-top,0px)) 22px calc(28px + env(safe-area-inset-bottom,0px));max-width:480px;margin:0 auto}
.dr-badge{width:120px;height:120px;border-radius:50%;display:grid;place-items:center;color:var(--onRed);background:radial-gradient(circle at 50% 35%,#B33232,#6E1A1A);box-shadow:0 0 0 6px var(--redSoft),0 12px 40px rgba(158,40,40,.35);margin-bottom:24px;animation:dr-pop .5s cubic-bezier(.2,.8,.2,1)}
.dr-badge svg{width:62px;height:62px}
.dr-dcount{font-size:17px;color:var(--muted);margin-bottom:6px!important;font-style:italic}
.dr-dtitle{font-family:Cinzel,Georgia,serif;font-size:29px!important;line-height:1.2;font-weight:600;color:var(--ink);margin-bottom:10px!important}
.dr-dsub{font-size:19px;color:var(--muted);margin-bottom:22px!important;max-width:34ch}
.dr-done .dr-arsenal{margin-top:2px}
.dr-done .dr-meta{margin-bottom:24px!important}
.dr-toast{position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);background:var(--ink);color:var(--bg);padding:12px 18px;border-radius:12px;font-size:17px;max-width:88vw;width:max-content;z-index:1100;text-align:center}

@keyframes dr-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes dr-pop{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:none}}
@keyframes dr-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
@keyframes dr-blink{50%{opacity:0}}
@media (prefers-reduced-motion:reduce){.dr-root *,.dr-root *::before,.dr-root *::after{animation:none!important;transition:none!important}}
`;
