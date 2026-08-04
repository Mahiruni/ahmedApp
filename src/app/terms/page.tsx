import type { Metadata } from "next";

import {
  PublicDocumentSection,
  PublicPageShell,
} from "@/components/public/public-page-shell";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the BILOO Terms of Service for accounts, rides, orders, payments, cancellations and acceptable use.",
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <PublicPageShell
      eyebrow="TERMS OF SERVICE"
      title="Clear terms for using the BILOO platform."
      description="These terms govern access to BILOO accounts, rides, orders, vendor services, driver services, payments and related platform features."
    >
      <div className="biloo-public-document-meta">
        <span>Effective date</span>
        <strong>August 4, 2026</strong>
        <span>Operator</span>
        <strong>BILOO Group, Addis Ababa, Ethiopia</strong>
      </div>

      <article className="biloo-public-document">
        <PublicDocumentSection number="01" title="Acceptance of these terms">
          <p>
            By creating an account, signing in or using BILOO, you agree to these
            Terms of Service and the BILOO Privacy Policy. If you do not agree, do not
            use the platform.
          </p>
          <p>
            You must be legally able to enter into these terms. A person who is not
            legally able to consent may use BILOO only with the involvement and
            permission of a parent or legal guardian.
          </p>
        </PublicDocumentSection>

        <PublicDocumentSection number="02" title="BILOO services">
          <p>
            BILOO provides a digital platform that may support taxi booking, food
            delivery, supermarket shopping, construction-material ordering, car-parts
            ordering, notifications, payments and order or ride tracking.
          </p>
          <p>
            Availability varies by location, time, vendor, driver, delivery partner
            and technical capacity. BILOO may add, change, suspend or discontinue a
            feature when reasonably necessary.
          </p>
        </PublicDocumentSection>

        <PublicDocumentSection number="03" title="Accounts and security">
          <ul>
            <li>Provide accurate, current and complete registration information.</li>
            <li>Keep your password and device access confidential.</li>
            <li>Use one account only for lawful, genuine activity.</li>
            <li>Promptly report suspected unauthorized access or account misuse.</li>
            <li>
              Do not impersonate another person, create misleading profiles or use a
              username that infringes another person&apos;s rights.
            </li>
          </ul>
          <p>
            You are responsible for activity performed through your account unless
            you promptly report unauthorized use and BILOO determines otherwise.
          </p>
        </PublicDocumentSection>

        <PublicDocumentSection number="04" title="Orders, rides and service requests">
          <p>
            A request is not final until it is accepted or confirmed by the relevant
            driver, vendor, store, delivery partner or BILOO system. Availability,
            preparation time, route, estimated arrival and delivery times are
            estimates and may change.
          </p>
          <p>
            You must provide a reachable phone number, accurate pickup or delivery
            details and any information reasonably needed to complete the service.
            Additional charges may apply when incorrect information causes delay,
            redelivery, route changes or cancellation.
          </p>
        </PublicDocumentSection>

        <PublicDocumentSection number="05" title="Prices, fees and payments">
          <p>
            Prices, taxes, delivery fees, service fees, estimated fares and other
            charges should be displayed before confirmation where practical. Final
            charges may change when the request changes, actual distance differs,
            items are substituted, quantities change or applicable fees are updated.
          </p>
          <p>
            You authorize BILOO and its payment providers to process the selected
            payment method for confirmed charges. Failed or reversed payments may
            result in an unpaid balance, service restriction or cancellation.
          </p>
        </PublicDocumentSection>

        <PublicDocumentSection number="06" title="Cancellations, refunds and substitutions">
          <p>
            Cancellation and refund eligibility depends on service type, preparation
            status, driver or vendor assignment, payment method and the reason for the
            request. A cancellation charge may apply after work has started or a
            driver, vendor or delivery partner has committed resources.
          </p>
          <p>
            Grocery, food, materials and parts orders may require approved
            substitutions when an item is unavailable. BILOO will aim to provide clear
            options, but perishable, custom, opened or already-delivered items may not
            be refundable except where required by law or where the item is defective,
            incorrect or materially different from the confirmed order.
          </p>
        </PublicDocumentSection>

        <PublicDocumentSection number="07" title="Drivers, vendors and delivery partners">
          <p>
            Drivers, stores, restaurants, suppliers and delivery partners may be
            independent service providers. They are responsible for their own lawful
            operation, licenses, product descriptions, inventory, service quality and
            fulfillment obligations, subject to BILOO platform rules and applicable
            law.
          </p>
          <p>
            BILOO may review provider activity, investigate complaints and restrict or
            remove access when necessary to protect users, safety or platform trust.
          </p>
        </PublicDocumentSection>

        <PublicDocumentSection number="08" title="Acceptable use">
          <p>You may not use BILOO to:</p>
          <ul>
            <li>Break the law, facilitate fraud or create unsafe situations.</li>
            <li>Harass, threaten, discriminate against or harm another person.</li>
            <li>Order prohibited, stolen, counterfeit or unlawfully restricted goods.</li>
            <li>Interfere with platform security, availability or other users.</li>
            <li>Scrape data, reverse engineer protected systems or bypass access controls.</li>
            <li>Submit false reviews, fake orders, payment disputes or misleading reports.</li>
          </ul>
        </PublicDocumentSection>

        <PublicDocumentSection number="09" title="Location, communications and notifications">
          <p>
            BILOO may use location information that you authorize to support pickup,
            delivery, nearby discovery, routing and progress features. You may disable
            location access, though some services may not function correctly.
          </p>
          <p>
            You agree to receive transactional communications necessary for account
            security, ride or order status, payment, support and service delivery.
            Optional promotional communications may be controlled separately where
            available.
          </p>
        </PublicDocumentSection>

        <PublicDocumentSection number="10" title="Intellectual property">
          <p>
            BILOO&apos;s name, logo, software, interface, design system, text and other
            platform materials are owned by or licensed to BILOO Group. These terms
            grant you a limited, personal, non-transferable right to use the platform
            for its intended purpose. They do not transfer ownership of BILOO
            intellectual property.
          </p>
        </PublicDocumentSection>

        <PublicDocumentSection number="11" title="Service limitations">
          <p>
            BILOO aims to provide a reliable service but cannot guarantee that every
            feature will always be uninterrupted, error-free, available in every
            location or accurate in every estimate. Maps, routes, inventory,
            availability and arrival times may be supplied by third parties or depend
            on changing real-world conditions.
          </p>
          <p>
            To the extent permitted by applicable law, BILOO is not responsible for
            indirect or consequential loss arising from delays, unavailable services,
            third-party conduct or circumstances outside reasonable control.
          </p>
        </PublicDocumentSection>

        <PublicDocumentSection number="12" title="Suspension and termination">
          <p>
            BILOO may investigate, restrict, suspend or terminate access where there is
            suspected fraud, unsafe behavior, non-payment, repeated policy violation,
            unlawful activity or a material risk to users or the platform. You may stop
            using BILOO at any time and may request eligible account deletion under the
            Privacy Policy.
          </p>
        </PublicDocumentSection>

        <PublicDocumentSection number="13" title="Governing law and disputes">
          <p>
            These terms are governed by the applicable laws of Ethiopia. The parties
            should first attempt to resolve concerns through BILOO support. Unresolved
            disputes may be submitted to the competent courts or authorities in
            Ethiopia, subject to any mandatory consumer rights.
          </p>
        </PublicDocumentSection>

        <PublicDocumentSection number="14" title="Changes and contact">
          <p>
            BILOO may update these terms when services, legal requirements or platform
            practices change. The effective date will be updated when revised terms are
            published. Material changes may also be communicated through the platform.
          </p>
          <p>
            Questions may be sent to
            {" "}
            <a href="mailto:yenedeen@gmail.com">yenedeen@gmail.com</a> or by phone at
            {" "}
            <a href="tel:+251924093037">+251 924 093 037</a>.
          </p>
        </PublicDocumentSection>
      </article>
    </PublicPageShell>
  );
}
