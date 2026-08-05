import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Icon } from "@/components/biloo/ui";
import { getViewer } from "@/lib/biloo/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

const description =
  "BILOO is Ethiopia's connected super app for taxi booking, food delivery, supermarket shopping, construction materials and car parts.";

export const metadata: Metadata = {
  title: { absolute: "BILOO — One app for every move" },
  description,
  applicationName: "BILOO",
  openGraph: {
    title: "BILOO — One app for every move",
    description,
    siteName: "BILOO",
    type: "website",
  },
  robots: { index: true, follow: true },
};

const services = [
  {
    key: "taxi",
    title: "Taxi booking",
    description: "Request a ride, choose pickup and destination, and follow trip progress.",
    icon: "taxi" as const,
    meta: "Move around your city",
  },
  {
    key: "food",
    title: "Food delivery",
    description: "Discover local restaurants and receive preparation and delivery updates.",
    icon: "food" as const,
    meta: "Meals from nearby kitchens",
  },
  {
    key: "market",
    title: "Supermarket shopping",
    description: "Order groceries and household essentials from participating stores.",
    icon: "market" as const,
    meta: "Daily essentials delivered",
  },
  {
    key: "construction",
    title: "Construction materials",
    description: "Find cement, steel, blocks, tools and building supplies from local vendors.",
    icon: "construction" as const,
    meta: "Supplies for every project",
  },
  {
    key: "parts",
    title: "Car parts",
    description: "Browse vehicle parts and connect with trusted automotive suppliers.",
    icon: "parts" as const,
    meta: "Parts matched to your needs",
  },
];

const experiences = [
  {
    title: "For customers",
    description: "One simple home for rides, delivery, shopping, orders and saved places.",
    icon: "customer" as const,
    points: ["Five connected services", "Clear prices and progress", "One account and order history"],
  },
  {
    title: "For vendors",
    description: "A focused command center for incoming orders, inventory and store availability.",
    icon: "vendor" as const,
    points: ["Prioritized order queue", "Inventory health controls", "Store status and performance"],
  },
  {
    title: "For drivers",
    description: "Trips, deliveries, navigation, customer contact and earnings around the next action.",
    icon: "driver" as const,
    points: ["Nearby job requests", "Step-by-step route progress", "Earnings and service rating"],
  },
];

export default async function HomePage() {
  if (isSupabaseConfigured()) {
    const viewer = await getViewer();
    if (viewer) redirect(viewer.onboardingComplete ? "/biloo" : "/onboarding");
  }

  return (
    <main className="biloo-home-page">
      <header className="biloo-home-header">
        <div className="biloo-home-container biloo-home-header-inner">
          <Link aria-label="BILOO homepage" className="biloo-home-brand" href="/">
            <Image alt="BILOO" height={42} priority src="/icons/biloo-mark.svg" width={42} />
            <span><strong>BILOO</strong><small>One app. Every move.</small></span>
          </Link>

          <nav aria-label="BILOO website navigation" className="biloo-home-nav">
            <a href="#services">Services</a>
            <a href="#experience">Who it is for</a>
            <a href="#how-it-works">How it works</a>
            <Link href="/about">About</Link>
          </nav>

          <div className="biloo-home-header-actions">
            <Link className="biloo-home-login" href="/auth/login?next=/biloo">Sign in</Link>
            <Link className="biloo-home-get-started" href="/auth/sign-up">
              Get started <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </header>

      <section className="biloo-home-hero">
        <div className="biloo-home-container biloo-home-hero-grid">
          <div className="biloo-home-hero-copy">
            <span className="biloo-home-kicker"><i /> Built around everyday life in Ethiopia</span>
            <h1>Everything you need. <strong>One BILOO.</strong></h1>
            <p>
              Book a taxi, order food and groceries, find construction materials,
              and shop for car parts through one beautifully connected experience.
            </p>
            <div className="biloo-home-hero-actions">
              <Link className="biloo-home-primary" href="/auth/sign-up">
                Start with BILOO <Icon name="arrow" />
              </Link>
              <a className="biloo-home-secondary" href="#services">
                Explore services
              </a>
            </div>
            <div className="biloo-home-proof-row" aria-label="BILOO platform highlights">
              <span><Icon name="check" /> One secure account</span>
              <span><Icon name="location" /> Location-aware services</span>
              <span><Icon name="bell" /> Progress updates</span>
            </div>
          </div>

          <div className="biloo-home-product-stage" aria-label="Preview of the BILOO application">
            <div className="biloo-home-app-card">
              <div className="biloo-home-app-topbar">
                <span className="biloo-home-mini-brand">B</span>
                <div><small>Good afternoon</small><strong>Where to today?</strong></div>
                <span className="biloo-home-avatar">MA</span>
              </div>

              <div className="biloo-home-location-pill">
                <Icon name="location" />
                <span><small>Your location</small><strong>Bole, Addis Ababa</strong></span>
                <Icon name="arrow" />
              </div>

              <div className="biloo-home-app-services">
                {services.slice(0, 4).map((service) => (
                  <span key={service.key}><i><Icon name={service.icon} /></i><small>{service.title.split(" ")[0]}</small></span>
                ))}
              </div>

              <div className="biloo-home-ride-preview">
                <div>
                  <span className="biloo-home-live-dot"><i /> DRIVER MATCHED</span>
                  <h2>Your ride is 3 min away</h2>
                  <p>Toyota Corolla · Code 4821</p>
                </div>
                <span className="biloo-home-car-icon"><Icon name="taxi" /></span>
                <div className="biloo-home-route-line"><i /><b /><i /></div>
                <div className="biloo-home-ride-meta">
                  <span><small>Pickup</small><strong>Bole Medhanialem</strong></span>
                  <span><small>Destination</small><strong>Meskel Square</strong></span>
                </div>
              </div>

              <div className="biloo-home-bottom-nav" aria-hidden="true">
                <span className="is-active"><Icon name="home" /><small>Home</small></span>
                <span><Icon name="search" /><small>Explore</small></span>
                <span><Icon name="receipt" /><small>Activity</small></span>
                <span><Icon name="customer" /><small>Account</small></span>
              </div>
            </div>

            <div className="biloo-home-floating-card biloo-home-floating-order">
              <span><Icon name="food" /></span>
              <div><small>Food order</small><strong>Preparing now</strong><p>12–18 min</p></div>
            </div>
            <div className="biloo-home-floating-card biloo-home-floating-rating">
              <span><Icon name="star" /></span>
              <div><small>Trusted service</small><strong>4.93 rating</strong></div>
            </div>
          </div>
        </div>

        <div className="biloo-home-container biloo-home-stat-strip">
          <div><strong>5</strong><span>connected services</span></div>
          <div><strong>1</strong><span>account and activity history</span></div>
          <div><strong>3</strong><span>dedicated role experiences</span></div>
          <div><strong>24/7</strong><span>access to your BILOO account</span></div>
        </div>
      </section>

      <section className="biloo-home-section" id="services">
        <div className="biloo-home-container">
          <div className="biloo-home-section-head">
            <div><span className="biloo-home-overline">THE SUPER APP</span><h2>Five essential services, designed as one.</h2></div>
            <p>BILOO removes the friction of switching between separate apps and creates one familiar way to move, order and shop.</p>
          </div>

          <div className="biloo-home-services-grid">
            {services.map((service, index) => (
              <article className={index === 0 ? "is-featured" : ""} key={service.key}>
                <div className="biloo-home-service-top">
                  <span className="biloo-home-service-icon"><Icon name={service.icon} /></span>
                  <small>0{index + 1}</small>
                </div>
                <div>
                  <span>{service.meta}</span>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>
                <Link href="/auth/sign-up" aria-label={`Get started with ${service.title}`}><Icon name="arrow" /></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="biloo-home-experience" id="experience">
        <div className="biloo-home-container">
          <div className="biloo-home-section-head biloo-home-section-head-light">
            <div><span className="biloo-home-overline">ONE PLATFORM, THREE EXPERIENCES</span><h2>Beautiful for customers. Powerful for operators.</h2></div>
            <p>Each role gets a focused interface built around what matters next—without losing the shared BILOO identity.</p>
          </div>

          <div className="biloo-home-experience-grid">
            {experiences.map((experience, index) => (
              <article key={experience.title}>
                <div className="biloo-home-experience-number">0{index + 1}</div>
                <span className="biloo-home-experience-icon"><Icon name={experience.icon} /></span>
                <h3>{experience.title}</h3>
                <p>{experience.description}</p>
                <ul>
                  {experience.points.map((point) => <li key={point}><Icon name="check" />{point}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="biloo-home-section biloo-home-how" id="how-it-works">
        <div className="biloo-home-container biloo-home-how-grid">
          <div className="biloo-home-how-copy">
            <span className="biloo-home-overline">SIMPLE BY DESIGN</span>
            <h2>From need to done in three clear steps.</h2>
            <p>Every service follows a familiar flow, so BILOO feels easy from the first ride or order.</p>
            <Link className="biloo-home-text-link" href="/auth/sign-up">Create your BILOO account <Icon name="arrow" /></Link>
          </div>

          <div className="biloo-home-steps">
            <article><span>01</span><div><strong>Choose what you need</strong><p>Select taxi, food, groceries, construction materials or car parts.</p></div></article>
            <article><span>02</span><div><strong>Review and confirm</strong><p>See the provider, route or items, then confirm your request with confidence.</p></div></article>
            <article><span>03</span><div><strong>Follow every update</strong><p>Track progress and keep your activity organized inside one account.</p></div></article>
          </div>
        </div>
      </section>

      <section className="biloo-home-trust">
        <div className="biloo-home-container biloo-home-trust-grid">
          <div>
            <span className="biloo-home-overline">TRUSTED BY DESIGN</span>
            <h2>Your account, location and activity deserve clear protection.</h2>
            <p>BILOO is designed around secure authentication, transparent data use and clear controls for everyday services.</p>
            <div className="biloo-home-trust-links">
              <Link href="/privacy">Privacy Policy <Icon name="arrow" /></Link>
              <Link href="/terms">Terms of Service <Icon name="arrow" /></Link>
            </div>
          </div>
          <div className="biloo-home-trust-cards">
            <article><Icon name="shield" /><div><strong>Secure sign-in</strong><p>Protected account access through Supabase Auth and optional Google authentication.</p></div></article>
            <article><Icon name="location" /><div><strong>Permission-based location</strong><p>Location is used when you request nearby services, routing or delivery support.</p></div></article>
            <article><Icon name="customer" /><div><strong>Clear user control</strong><p>Public privacy and terms pages explain how BILOO handles account and service data.</p></div></article>
          </div>
        </div>
      </section>

      <section className="biloo-home-final-cta">
        <div className="biloo-home-container">
          <div>
            <span className="biloo-home-overline">WELCOME TO BILOO</span>
            <h2>Move. Order. Shop. One connected experience.</h2>
            <p>Explore the public website freely. Create an account only when you are ready to use BILOO.</p>
          </div>
          <div className="biloo-home-final-actions">
            <Link className="biloo-home-primary" href="/auth/sign-up">Get started <Icon name="arrow" /></Link>
            <Link className="biloo-home-final-login" href="/auth/login?next=/biloo">Sign in to your account</Link>
          </div>
        </div>
      </section>

      <footer className="biloo-home-footer">
        <div className="biloo-home-container biloo-home-footer-grid">
          <div className="biloo-home-footer-brand">
            <Image alt="BILOO" height={42} src="/icons/biloo-mark.svg" width={42} />
            <div><strong>BILOO</strong><span>One app. Every move.</span></div>
            <p>Operated by BILOO Group in Addis Ababa, Ethiopia.</p>
          </div>
          <div><strong>Product</strong><a href="#services">Services</a><a href="#experience">Experiences</a><a href="#how-it-works">How it works</a></div>
          <div><strong>Company</strong><Link href="/about">About BILOO</Link><a href="mailto:yenedeen@gmail.com">Contact</a><Link href="/auth/login?next=/biloo">Sign in</Link></div>
          <div><strong>Legal</strong><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms of Service</Link></div>
        </div>
        <div className="biloo-home-container biloo-home-footer-bottom">
          <span>© 2026 BILOO Group. All rights reserved.</span>
          <span>Addis Ababa · Ethiopia</span>
        </div>
      </footer>
    </main>
  );
}
