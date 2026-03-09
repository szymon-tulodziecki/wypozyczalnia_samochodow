'use client';
import { useState, useEffect, useRef } from 'react';

const KEYWORDS = [
  {
    match: ['rezerwacja', 'zarezerwuj', 'wynajm', 'wynajem', 'book'],
    reply: 'Rezerwacji dokonasz klikając przycisk „Zarezerwuj" w menu górnym lub dzwoniąc do nas. Potwierdzimy w ciągu 15 minut!',
  },
  {
    match: ['cena', 'cennik', 'koszt', 'ile', 'price'],
    reply: 'Ceny zależą od modelu i czasu wynajmu. Pełny cennik znajdziesz w zakładce Nasza Flota — możemy też dopasować ofertę indywidualnie.',
  },
  {
    match: ['samochod', 'samochód', 'auto', 'flota', 'pojazd', 'model', 'auta'],
    reply: 'Mamy szeroki wybór: sedany, SUV-y, kabriolety i GT. Każdy pojazd w nienagannym stanie. Sprawdź zakładkę Nasza Flota!',
  },
  {
    match: ['kontakt', 'telefon', 'email', 'adres', 'biuro', 'godziny'],
    reply: 'Działamy 7 dni w tygodniu, 8:00–20:00. Napisz na biuro@motiondrive.pl lub odwiedź stronę Kontakt.',
  },
  {
    match: ['ubezpieczenie', 'oc', 'ac', 'szkoda'],
    reply: 'Wszystkie pojazdy objęte są pełnym pakietem OC/AC/NNW. Szczegóły omawiamy przed podpisaniem umowy.',
  },
  {
    match: ['prawo jazdy', 'dokumenty', 'wiek', 'wymagania'],
    reply: 'Potrzebne: ważne prawo jazdy (min. 2 lata) + dowód osobisty. Minimalny wiek kierowcy to 21 lat.',
  },
  {
    match: ['dziekuje', 'dziękuję', 'dzięki', 'thanks', 'super', 'ok'],
    reply: 'Zawsze do usług! Życzymy przyjemnej jazdy 🚗',
  },
  {
    match: ['cześć', 'hej', 'hello', 'hi', 'siema', 'witaj'],
    reply: 'Hej! Witaj w Motion Drive 👋 Jak mogę pomóc?',
  },
];

const FALLBACK = [
  'Hmm, najlepiej skontaktuj się z nami bezpośrednio — odpiszemy tego samego dnia!',
  'To pytanie lepiej przekazać naszemu zespołowi. Zajrzyj na stronę Kontakt.',
  'Nie jestem pewien — napisz do nas przez formularz, a na pewno pomożemy!',
];

function getReply(text: string): string {
  const n = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const e of KEYWORDS) {
    if (e.match.some(k => n.includes(k))) return e.reply;
  }
  return FALLBACK[Math.floor(Math.random() * FALLBACK.length)];
}

const QUICK = ['Cennik', 'Nasza Flota', 'Rezerwacja', 'Kontakt'];
const fmt = (ts: number) => ts ? new Date(ts).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }) : '';

const INITIAL_MSGS: Message[] = [
  { id: 0, from: 'bot', text: 'Cześć! 👋 Jestem asystentem Motion Drive. W czym mogę pomóc?', ts: 0 },
];

let _idCounter = 1;
const nextId = () => _idCounter++;

interface Message {
  id: number;
  from: 'bot' | 'user';
  text: string;
  ts: number;
}

export default function ChatBot() {
  const [open, setOpen]     = useState(false);
  const [msgs, setMsgs]     = useState<Message[]>(INITIAL_MSGS);
  const [input, setInput]   = useState('');
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(1);
  const bottomRef           = useRef<HTMLDivElement>(null);
  const inputRef            = useRef<HTMLInputElement>(null);
  const wrapRef             = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => {
      setUnread(0);
      inputRef.current?.focus();
    }, 300);
  }, [open]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, typing]);

  const dispatch = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const uid = nextId();
    setMsgs(p => [...p, { id: uid, from: 'user', text: trimmed, ts: 0 }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const bid = nextId();
      setMsgs(p => [...p, { id: bid, from: 'bot', text: getReply(trimmed), ts: 0 }]);
      setTyping(false);
    }, 900);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); dispatch(input); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

        .cb {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          z-index: 9999;
          font-family: 'DM Sans', sans-serif;
        }

        /* FAB */
        .cb-fab {
          width: 52px; height: 52px;
          border-radius: 50%;
          border: none;
          background: #111;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.25);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          position: relative;
        }
        .cb-fab:hover {
          transform: scale(1.08);
          box-shadow: 0 8px 28px rgba(0,0,0,0.3);
        }
        .cb-badge {
          position: absolute; top: -2px; right: -2px;
          width: 18px; height: 18px; border-radius: 50%;
          background: #4ade80; color: #111;
          font-size: 0.6rem; font-weight: 600;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid #fff;
          animation: pop 0.25s ease;
        }
        @keyframes pop { from { transform: scale(0); } to { transform: scale(1); } }

        /* Window */
        .cb-win {
          position: absolute; bottom: 64px; right: 0;
          width: 320px; max-height: 480px;
          background: #fff;
          border-radius: 16px;
          border: 1px solid #e8e8e8;
          box-shadow: 0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
          display: flex; flex-direction: column;
          transform-origin: bottom right;
          transform: scale(0.92) translateY(8px);
          opacity: 0; pointer-events: none;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.22s ease;
          overflow: hidden;
        }
        .cb-win.open {
          transform: scale(1) translateY(0);
          opacity: 1; pointer-events: all;
        }

        /* Header */
        .cb-head {
          display: flex; align-items: center; gap: 0.6rem;
          padding: 0.85rem 1rem;
          border-bottom: 1px solid #f0f0f0;
          background: #fff;
          flex-shrink: 0;
        }
        .cb-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: #111;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          font-size: 0.65rem; font-weight: 600; color: #fff;
          letter-spacing: 0.02em;
        }
        .cb-head-info { flex: 1; }
        .cb-head-name {
          font-size: 0.82rem; font-weight: 600; color: #111;
          line-height: 1;
        }
        .cb-head-sub {
          display: flex; align-items: center; gap: 4px;
          font-size: 0.65rem; color: #888; margin-top: 2px;
        }
        .cb-online {
          width: 6px; height: 6px; border-radius: 50%;
          background: #4ade80;
        }
        .cb-close {
          background: none; border: none; cursor: pointer;
          color: #bbb; width: 28px; height: 28px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%;
          transition: background 0.15s, color 0.15s;
        }
        .cb-close:hover { background: #f5f5f5; color: #555; }

        /* Messages */
        .cb-msgs {
          flex: 1; overflow-y: auto;
          padding: 0.85rem 0.85rem 0.5rem;
          display: flex; flex-direction: column; gap: 0.55rem;
          background: #fafafa;
          scrollbar-width: thin; scrollbar-color: #e0e0e0 transparent;
        }
        .cb-msgs::-webkit-scrollbar { width: 3px; }
        .cb-msgs::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 2px; }

        .cb-row {
          display: flex; gap: 0.4rem;
          animation: slide 0.25s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes slide {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cb-row.user { flex-direction: row-reverse; }

        .cb-mini-avatar {
          width: 24px; height: 24px; border-radius: 50%;
          background: #111;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.48rem; font-weight: 600; color: #fff;
          flex-shrink: 0; margin-top: auto;
        }

        .cb-bwrap { display: flex; flex-direction: column; max-width: 80%; }
        .cb-row.user .cb-bwrap { align-items: flex-end; }

        .cb-bubble {
          font-size: 0.8rem; line-height: 1.5;
          padding: 0.45rem 0.7rem;
          word-break: break-word;
          border-radius: 12px;
        }
        .cb-row.bot .cb-bubble {
          background: #fff;
          border: 1px solid #ebebeb;
          color: #222;
          border-bottom-left-radius: 4px;
        }
        .cb-row.user .cb-bubble {
          background: #111;
          color: #f0f0f0;
          border-bottom-right-radius: 4px;
        }
        .cb-ts {
          font-size: 0.5rem; color: #bbb;
          margin-top: 3px; letter-spacing: 0.04em;
        }

        /* Typing */
        .cb-typing {
          display: flex; align-items: center; gap: 3px;
          padding: 0.45rem 0.65rem;
          background: #fff; border: 1px solid #ebebeb;
          border-radius: 12px; border-bottom-left-radius: 4px;
          width: fit-content;
        }
        .cb-typing span {
          width: 5px; height: 5px; border-radius: 50%;
          background: #ccc; display: block;
          animation: tdot 1.1s ease infinite;
        }
        .cb-typing span:nth-child(2) { animation-delay: 0.16s; }
        .cb-typing span:nth-child(3) { animation-delay: 0.32s; }
        @keyframes tdot {
          0%,80%,100% { transform: translateY(0); opacity: 0.4; }
          40%          { transform: translateY(-4px); opacity: 1; }
        }

        /* Quick replies */
        .cb-quick {
          display: flex; flex-wrap: wrap; gap: 0.3rem;
          padding: 0.5rem 0.85rem; flex-shrink: 0;
          background: #fafafa;
          border-top: 1px solid #f0f0f0;
        }
        .cb-quick button {
          background: #fff; border: 1px solid #e0e0e0;
          color: #444; font-family: 'DM Sans', sans-serif;
          font-size: 0.67rem; font-weight: 500;
          padding: 0.22rem 0.6rem; border-radius: 20px;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
        }
        .cb-quick button:hover {
          background: #111; border-color: #111; color: #fff;
        }

        /* Input */
        .cb-input-row {
          display: flex; align-items: center; gap: 0.4rem;
          padding: 0.6rem 0.75rem;
          border-top: 1px solid #f0f0f0;
          background: #fff; flex-shrink: 0;
        }
        .cb-input {
          flex: 1; background: #f5f5f5;
          border: 1px solid transparent; border-radius: 20px;
          padding: 0.4rem 0.75rem;
          font-family: 'DM Sans', sans-serif; font-size: 0.8rem;
          color: #222; outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .cb-input::placeholder { color: #aaa; }
        .cb-input:focus {
          background: #fff; border-color: #ddd;
        }
        .cb-send {
          width: 34px; height: 34px; border-radius: 50%;
          background: #111; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: transform 0.2s ease, background 0.2s;
        }
        .cb-send:hover:not(:disabled) { transform: scale(1.08); background: #333; }
        .cb-send:disabled { opacity: 0.25; cursor: not-allowed; }

        @media (max-width: 480px) {
          .cb { bottom: 1rem; right: 1rem; }
          .cb-win { width: calc(100vw - 2rem); }
        }
      `}</style>

      <div className="cb" ref={wrapRef}>
        {/* Window */}
        <div className={`cb-win${open ? ' open' : ''}`} role="dialog">

          <div className="cb-head">
            <div className="cb-avatar">MD</div>
            <div className="cb-head-info">
              <div className="cb-head-name">Motion Drive</div>
              <div className="cb-head-sub">
                <span className="cb-online" /> Online
              </div>
            </div>
            <button className="cb-close" onClick={() => setOpen(false)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          <div className="cb-msgs">
            {msgs.map(m => (
              <div key={m.id} className={`cb-row ${m.from}`}>
                {m.from === 'bot' && <div className="cb-mini-avatar">MD</div>}
                <div className="cb-bwrap">
                  <div className="cb-bubble">{m.text}</div>
                  <span className="cb-ts">{fmt(m.ts)}</span>
                </div>
              </div>
            ))}
            {typing && (
              <div className="cb-row bot">
                <div className="cb-mini-avatar">MD</div>
                <div className="cb-typing"><span /><span /><span /></div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="cb-quick">
            {QUICK.map(q => (
              <button key={q} onClick={() => dispatch(q)}>{q}</button>
            ))}
          </div>

          <div className="cb-input-row">
            <input
              ref={inputRef}
              className="cb-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Napisz wiadomość…"
              maxLength={300}
            />
            <button className="cb-send" onClick={() => dispatch(input)} disabled={!input.trim()}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

        </div>

        {/* FAB */}
        <button className="cb-fab" onClick={() => setOpen(v => !v)} aria-label="Chat">
          {open
            ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.2" strokeLinecap="round"/></svg>
            : <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="white"/></svg>
          }
          {unread > 0 && !open && <span className="cb-badge">{unread}</span>}
        </button>
      </div>
    </>
  );
}
