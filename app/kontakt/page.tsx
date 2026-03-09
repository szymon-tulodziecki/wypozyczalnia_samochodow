"use client";

import { useState } from "react";

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