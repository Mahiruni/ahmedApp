import type { Metadata } from "next";

import {
  PublicDocumentSection,
  PublicPageShell,
} from "@/components/public/public-page-shell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the BILOO Privacy Policy, including how account, location, order and Google sign-in information is handled.",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <PublicPageShell
      eyebrow="PRIVACY POLICY"
      title="Your information should be handled clearly and responsibly."
      description="This policy explains what BILOO collects, why it is used, when it may be shared and the choices available to customers, drivers, vendors and administrators."
    >
      <div className="biloo-public-document-meta">
        <span>Effective date</span>
        <strong>August 4, 2026</strong>
        <span>Applies to</span>
        <strong>BILOO web and installable app experiences</strong>
      </div>

      <article className="biloo-public-document">
        <PublicDocumentSection number="01" title="Who we are">
          <p>
            BILOO is operated by BILOO Group in Addis Ababa, Ethiopia. BILOO
            provides a connected platform for ride booking, food delivery,
            supermarket shopping, construction-material ordering and car-parts
            ordering.
          </p>
          <p>
            Questions about this policy may be sent to
            {" "}
            <a href="mailto:yenedeen@gmail.com">yenedeen@gmail.com</a> or by phone
            at <a href="tel:+251924093037">+251 924 093 037</a>.
          </p>
        </PublicDocumentSection>

        <PublicDocumentSection number="02" title="Information we collect">
          <p>Depending on how you use BILOO, we may collect:</p>
          <ul>
            <li>
              Account information such as your name, username, email address,
              Ethiopian mobile number, password credentials and account role.
            </li>
            <li>
              Profile and location information such as region, city, sub-city,
              woreda, saved addresses and device location when you grant permission.
            </li>
            <li>
              Service information such as searches, selected vendors, cart contents,
              ride requests, orders, delivery addresses, status updates and support
              messages.
            </li>
            <li>
              Transaction information such as totals, fees, selected payment method,
              payment status, refunds and receipts. Full card credentials should be
              handled by approved payment processors when card processing is enabled.
            </li>
            <li>
              Technical information such as browser type, device type, IP address,
              application events, security logs and diagnostic information.
            </li>
          </ul>
        </PublicDocumentSection>

        <PublicDocumentSection number="03" title="Google sign-in information">
          <p>
            When you choose “Continue with Google,” Google and Supabase may provide
            BILOO with basic profile information that you authorize, typically your
            name, email address, profile image and a provider-specific account
            identifier.
          </p>
          <p>
            BILOO uses this information to authenticate you, create or connect your
            account, display your basic profile and protect the sign-in process. BILOO
            does not request access to Gmail, Google Drive, contacts, calendars or
            other Google services through the standard sign-in flow.
          </p>
          <p>
            BILOO does not sell Google user data or use it for advertising profiling.
            Access, use, storage and sharing of Google user data are limited to the
            authentication and account functions described in this policy.
          </p>
        </PublicDocumentSection>

        <PublicDocumentSection number="04" title="How we use information">
          <ul>
            <li>Create, authenticate and maintain user accounts.</li>
            <li>Process rides, orders, deliveries, vendor activity and support requests.</li>
            <li>Show relevant locations, availability, estimated progress and status updates.</li>
            <li>Send service, security, order and account notifications.</li>
            <li>Prevent fraud, abuse, unauthorized access and technical failures.</li>
            <li>Improve product reliability, accessibility and customer experience.</li>
            <li>Comply with lawful requests and applicable legal obligations.</li>
          </ul>
        </PublicDocumentSection>

        <PublicDocumentSection number="05" title="How information may be shared">
          <p>BILOO may share information only as reasonably necessary with:</p>
          <ul>
            <li>
              Drivers, delivery partners, vendors or stores involved in completing
              the service you requested.
            </li>
            <li>
              Infrastructure, authentication, mapping, notification, analytics,
              support and payment providers acting on BILOO&apos;s behalf.
            </li>
            <li>
              Government authorities or other parties when disclosure is required by
              law, necessary to protect safety or needed to investigate misuse.
            </li>
            <li>
              A successor organization in connection with a legitimate merger,
              financing, acquisition or transfer of business assets, subject to
              appropriate protections.
            </li>
          </ul>
          <p>BILOO does not sell personal information.</p>
        </PublicDocumentSection>

        <PublicDocumentSection number="06" title="Location information">
          <p>
            Location access is used only after permission is granted. It may support
            pickup and destination selection, nearby service discovery, delivery
            routing and order or ride progress. You can disable location permission in
            your browser or device settings, though some location-dependent features
            may then be unavailable.
          </p>
        </PublicDocumentSection>

        <PublicDocumentSection number="07" title="Retention and security">
          <p>
            BILOO retains information for as long as reasonably needed to provide the
            service, maintain records, resolve disputes, enforce agreements and meet
            legal obligations. Retention periods may differ by information type and
            account status.
          </p>
          <p>
            BILOO uses technical and organizational safeguards intended to reduce the
            risk of unauthorized access, alteration, loss or disclosure. No online
            service can guarantee absolute security, so users should also protect
            passwords, devices and account access.
          </p>
        </PublicDocumentSection>

        <PublicDocumentSection number="08" title="Your choices and rights">
          <p>Subject to applicable law and operational requirements, you may:</p>
          <ul>
            <li>Review and update profile information through your account.</li>
            <li>Withdraw optional device permissions such as location access.</li>
            <li>Request access, correction or deletion of eligible personal information.</li>
            <li>Disconnect Google sign-in through your Google account permissions.</li>
            <li>Contact BILOO with a privacy question or complaint.</li>
          </ul>
          <p>
            Some records may be retained where required for security, fraud prevention,
            financial reporting, dispute resolution or legal compliance.
          </p>
        </PublicDocumentSection>

        <PublicDocumentSection number="09" title="Children">
          <p>
            BILOO is not designed to knowingly collect personal information from
            children who cannot legally consent to the service. A parent or guardian
            should contact BILOO if they believe a child provided information without
            appropriate permission.
          </p>
        </PublicDocumentSection>

        <PublicDocumentSection number="10" title="Policy changes">
          <p>
            This policy may be updated as BILOO services, legal requirements or data
            practices change. The effective date will be revised when a material
            update is published. Continued use after an update means the revised
            policy applies from its effective date.
          </p>
        </PublicDocumentSection>
      </article>
    </PublicPageShell>
  );
}
