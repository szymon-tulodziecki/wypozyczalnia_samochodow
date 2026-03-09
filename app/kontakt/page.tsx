"use client";

import { useState } from "react";
import Image from "next/image";

export default function Kontakt() {

export default function kontakt() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:ital,wght@0,300;0,600;1,300&family=Barlow:wght@300;400&display=swap');

        :root {
          --blue:       #2e7ab5;
          --blue-light: #4fa3d4;
          --green:      #6dbf45;
          --green-dark: #4e9930;
          --text-muted: #5a6270;
          --text-dim:   #9aa3ae;
        }

        .knt-page {
          position: relative;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 5rem 2rem 1.5rem;
          background: #08090b;
          overflow: hidden;
        }

        .knt-page::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(46,122,181,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(46,122,181,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        .knt-glow-blue {
          position: absolute;
          top: -15%; left: -5%;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(46,122,181,0.12) 0%, transparent 65%);
          pointer-events: none;
        }

        .knt-glow-green {
          position: absolute;
          bottom: -10%; right: -5%;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(109,191,69,0.07) 0%, transparent 65%);
          pointer-events: none;
        }

        .knt-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 440px;
          background: rgba(14, 18, 24, 0.85);
          backdrop-filter: blur(20px) saturate(1.6);
          -webkit-backdrop-filter: blur(20px) saturate(1.6);
          border: 1px solid rgba(46, 122, 181, 0.15);
          border-radius: 2px;
          overflow: hidden;
        }

        .knt-card-accent {
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            var(--blue) 25%,
            var(--blue-light) 48%,
            var(--green) 72%,
            transparent 100%
          );
        }

        .knt-card-body {
          padding: 1.4rem 1.8rem 1.6rem;
        }

        .knt-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.9rem;
          letter-spacing: 0.18em;
          background: linear-gradient(100deg, var(--blue-light) 0%, #c8dde8 45%, var(--green) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 0.2rem;
        }

        .knt-subtitle {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 300;
          font-style: italic;
          font-size: 0.7rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin: 0 0 1rem;
        }

        .knt-field {
          margin-bottom: 0.65rem;
        }

        .knt-label {
          display: block;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 0.65rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--text-dim);
          margin-bottom: 0.28rem;
        }

        .knt-input,
        .knt-textarea {
          width: 100%;
          padding: 0.45rem 0.85rem;
          font-family: 'Barlow', sans-serif;
          font-size: 0.88rem;
          font-weight: 300;
          color: #dce8f0;
          background: rgba(8, 9, 11, 0.7);
          border: 1px solid #1e2830;
          border-radius: 1px;
          outline: none;
          transition: border-color 0.3s, box-shadow 0.3s;
          box-sizing: border-box;
        }

        .knt-textarea {
          resize: vertical;
          min-height: 64px;
        }

        .knt-input::placeholder,
        .knt-textarea::placeholder {
          color: #2a3440;
        }

        .knt-input:focus,
        .knt-textarea:focus {
          border-color: var(--blue);
          box-shadow: 0 0 0 2px rgba(46,122,181,0.12), 0 0 20px rgba(46,122,181,0.06);
        }

        .knt-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          width: 100%;
          margin-top: 0.4rem;
          padding: 0.55rem 1.6rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 0.78rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #fff;
          border: none;
          cursor: pointer;
          clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
          background: linear-gradient(110deg, var(--blue) 0%, var(--green-dark) 100%);
          transition: filter 0.3s, transform 0.25s;
        }

        .knt-btn:hover {
          filter: brightness(1.15);
          transform: translateY(-2px);
        }

        .knt-success {
          text-align: center;
          padding: 1.5rem 0;
        }

        .knt-success-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .knt-success h2 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.8rem;
          letter-spacing: 0.15em;
          color: var(--green);
          margin: 0 0 0.5rem;
        }

        .knt-success p {
          font-family: 'Barlow', sans-serif;
          font-size: 0.85rem;
          font-weight: 300;
          color: var(--text-dim);
          margin: 0 0 1.5rem;
        }

        /* ── Decorative tires ── */
        .knt-tire {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 200px;
          height: auto;
          pointer-events: none;
          z-index: 0;
        }

        .knt-tire-left {
          left: -20px;
          -webkit-mask-image: linear-gradient(to right, black 0%, transparent 85%);
          mask-image: linear-gradient(to right, black 0%, transparent 85%);
          opacity: 0.1;
        }

        .knt-tire-right {
          right: -20px;
          -webkit-mask-image: linear-gradient(to left, black 0%, transparent 85%);
          mask-image: linear-gradient(to left, black 0%, transparent 85%);
          opacity: 0.1;
        }

        @media (max-width: 1080px) {
          .knt-tire { display: none; }
        }

        @media (max-width: 520px) {
          .knt-card-body { padding: 2rem 1.4rem; }
          .knt-title { font-size: 1.8rem; }
        }
      `}</style>

      <div className="knt-page">
        <div className="knt-glow-blue" />
        <div className="knt-glow-green" />

        {/* Tires — fading left and right */}
        <div className="knt-tire knt-tire-left">
          <Image src="/tires.jpg" alt="" width={200} height={200} style={{ width: '100%', height: 'auto' }} aria-hidden />
        </div>
        <div className="knt-tire knt-tire-right">
          <Image src="/tires.jpg" alt="" width={200} height={200} style={{ width: '100%', height: 'auto' }} aria-hidden />
        </div>

        <div className="knt-card">
          <div className="knt-card-accent" />
          <div className="knt-card-body">
            <h1 className="knt-title">Kontakt</h1>
            <p className="knt-subtitle">Napisz do nas — odpiszemy najszybciej jak to możliwe</p>

            {submitted ? (
              <div className="knt-success">
                <div className="knt-success-icon">✓</div>
                <h2>Wiadomość wysłana!</h2>
                <p>Dziękujemy za kontakt. Odezwiemy się wkrótce.</p>
                <button
                  className="knt-btn"
                  onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", phone: "", message: "" }); }}
                >
                  Wyślij kolejną
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="knt-field">
                  <label className="knt-label" htmlFor="name">Imię i nazwisko</label>
                  <input id="name" name="name" type="text" className="knt-input" placeholder="Jan Kowalski" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="knt-field">
                  <label className="knt-label" htmlFor="email">Adres e-mail</label>
                  <input id="email" name="email" type="email" className="knt-input" placeholder="jan@example.com" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="knt-field">
                  <label className="knt-label" htmlFor="phone">Numer telefonu</label>
                  <input id="phone" name="phone" type="tel" className="knt-input" placeholder="+48 123 456 789" value={formData.phone} onChange={handleChange} />
                </div>
                <div className="knt-field">
                  <label className="knt-label" htmlFor="message">Wiadomość</label>
                  <textarea id="message" name="message" className="knt-textarea" placeholder="Opisz swoje zapytanie..." value={formData.message} onChange={handleChange} required rows={3} />
                </div>
                <button type="submit" className="knt-btn">
                  Wyślij wiadomość
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a0a0f 0%, #0d1117 50%, #0a0f1e 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "100px 20px 60px",
        fontFamily: "'Barlow', sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
        }}
      >
        <h1
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            background: "linear-gradient(135deg, #00d4ff, #00ff88)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "8px",
            letterSpacing: "2px",
          }}
        >
          Kontakt
        </h1>
        <p
          style={{
            color: "#d0d8e4",
            fontSize: "1rem",
            marginBottom: "40px",
          }}
        >
          Masz pytania? Napisz do nas — odpowiemy najszybciej jak to możliwe.
        </p>

        {submitted ? (
          <div
            style={{
              background: "linear-gradient(135deg, rgba(0,212,255,0.1), rgba(0,255,136,0.1))",
              border: "1px solid rgba(0,255,136,0.4)",
              borderRadius: "16px",
              padding: "40px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>✅</div>
            <h2
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "2rem",
                color: "#00ff88",
                letterSpacing: "2px",
                marginBottom: "8px",
              }}
            >
              Wiadomość wysłana!
            </h2>
            <p style={{ color: "#d0d8e4" }}>
              Dziękujemy za kontakt. Odezwiemy się wkrótce.
            </p>
            <button
              onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", phone: "", message: "" }); }}
              style={{
                marginTop: "24px",
                padding: "12px 32px",
                background: "linear-gradient(135deg, #00d4ff, #00ff88)",
                border: "none",
                borderRadius: "8px",
                color: "#0a0a0f",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "1rem",
                fontWeight: "700",
                letterSpacing: "1px",
                cursor: "pointer",
              }}
            >
              Wyślij kolejną
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(0,212,255,0.15)",
              borderRadius: "16px",
              padding: "40px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {[
              { label: "Imię i nazwisko", name: "name", type: "text", placeholder: "Jan Kowalski" },
              { label: "Adres e-mail", name: "email", type: "email", placeholder: "jan@example.com" },
              { label: "Numer telefonu", name: "phone", type: "tel", placeholder: "+48 123 456 789" },
            ].map((field) => (
              <div key={field.name} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label
                  htmlFor={field.name}
                  style={{
                    color: "#00d4ff",
                    fontSize: "0.85rem",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                  }}
                >
                  {field.label}
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formData[field.name as keyof typeof formData]}
                  onChange={handleChange}
                  required={field.name !== "phone"}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(0,212,255,0.2)",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    color: "#e8eaf0",
                    fontSize: "1rem",
                    fontFamily: "'Barlow', sans-serif",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(0,212,255,0.6)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(0,212,255,0.2)")}
                />
              </div>
            ))}

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label
                htmlFor="message"
                style={{
                  color: "#00d4ff",
                  fontSize: "0.85rem",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                Wiadomość
              </label>
              <textarea
                id="message"
                name="message"
                placeholder="Opisz swoje zapytanie..."
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(0,212,255,0.2)",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  color: "#e8eaf0",
                  fontSize: "1rem",
                  fontFamily: "'Barlow', sans-serif",
                  outline: "none",
                  resize: "vertical",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(0,212,255,0.6)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(0,212,255,0.2)")}
              />
            </div>

            <button
              type="submit"
              style={{
                padding: "14px 32px",
                background: "linear-gradient(135deg, #00d4ff, #00ff88)",
                border: "none",
                borderRadius: "8px",
                color: "#0a0a0f",
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "1.2rem",
                letterSpacing: "2px",
                cursor: "pointer",
                transition: "opacity 0.2s, transform 0.2s",
                marginTop: "8px",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.opacity = "0.85";
                (e.target as HTMLButtonElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.opacity = "1";
                (e.target as HTMLButtonElement).style.transform = "translateY(0)";
              }}
            >
              Wyślij wiadomość
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
