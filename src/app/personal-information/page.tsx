"use client";

import { FormEvent, useState } from "react";

export default function PersonalInformationPage() {
  const [focused, setFocused] = useState("email");
  const [submitted, setSubmitted] = useState(false);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="biloo-personal-page">
      <section className="biloo-personal-card" aria-labelledby="personal-title">
        <header className="biloo-personal-header">
          <button className="biloo-back" type="button" onClick={() => history.back()} aria-label="Go back">←</button>
          <div>
            <p className="biloo-eyebrow">BILOO</p>
            <h1 id="personal-title">Personal Information</h1>
            <p className="biloo-subtitle">Tell us where to deliver your order.</p>
          </div>
        </header>

        <form onSubmit={submit} className="biloo-personal-form">
          <label><span>Full Name</span><input placeholder="Enter your full name" /></label>
          <label><span>Email</span><input type="email" placeholder="example@email.com" onFocus={() => setFocused("email")} className={focused === "email" ? "is-focused" : ""} /></label>
          <label><span>Phone Number</span><input placeholder="+1 000 000 0000" /></label>
          <label><span>Address</span><input placeholder="Enter your delivery address" aria-invalid="true" className="has-error" /><small>This field is required</small></label>
          <label><span>Optional Notes</span><textarea placeholder="Add any special instructions…" rows={3} /></label>

          {submitted && <p className="biloo-success" role="status">Information saved. You can continue your order.</p>}

          <div className="biloo-actions">
            <button className="biloo-primary" type="submit">Save &amp; Continue</button>
            <button className="biloo-secondary" type="button" onClick={() => history.back()}>Go Back</button>
          </div>
          <button className="biloo-skip" type="button">Skip for now</button>
        </form>
      </section>
    </main>
  );
}
