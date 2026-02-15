export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

      <div className="space-y-8 text-foreground/90">
        <section>
          <p className="text-sm text-muted-foreground mb-4">
            <strong>Effective Date:</strong> January 22, 2025
            <br />
            <strong>Last Updated:</strong> October 28, 2025
          </p>

          <p className="leading-relaxed">
            Daily One Accord ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your information when you use our church management
            platform and services (the "Service"). Please read this privacy policy carefully. If you do not agree with
            the terms of this privacy policy, please do not access the Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>

          <h3 className="text-xl font-medium mb-3 mt-6">Personal Information</h3>
          <p className="leading-relaxed mb-4">We collect information that you provide directly to us when you:</p>
          <ul className="list-disc pl-6 space-y-2 leading-relaxed">
            <li>Create an account (name, email address, phone number, church affiliation)</li>
            <li>Subscribe to a paid plan (billing information processed through Stripe)</li>
            <li>Use our Service (attendance records, event registrations, volunteer schedules)</li>
            <li>Contact our support team (support tickets, feedback, inquiries)</li>
            <li>Communicate through the platform (messages, emails, SMS communications)</li>
          </ul>

          <h3 className="text-xl font-medium mb-3 mt-6">Church and Ministry Data</h3>
          <p className="leading-relaxed mb-4">
            When you use Daily One Accord, we collect and store data related to your church operations:
          </p>
          <ul className="list-disc pl-6 space-y-2 leading-relaxed">
            <li>Member and visitor information (names, contact details, attendance history)</li>
            <li>Event and calendar data (service times, ministry events, registrations)</li>
            <li>Team and volunteer information (schedules, roles, availability)</li>
            <li>Service planning data (rundowns, worship songs, team assignments)</li>
            <li>Communication records (emails sent, SMS messages, Slack notifications)</li>
            <li>
              Giving and donation data (donor information, donation amounts, payment methods, recurring gifts,
              campaigns)
            </li>
            <li>Blog engagement data (page views, reading time, social sharing activity)</li>
            <li>Business plan access (NDA signatures, document viewing history, access timestamps)</li>
          </ul>

          <h3 className="text-xl font-medium mb-3 mt-6">Automatically Collected Information</h3>
          <p className="leading-relaxed mb-4">
            When you access our Service, we automatically collect certain information:
          </p>
          <ul className="list-disc pl-6 space-y-2 leading-relaxed">
            <li>Device information (IP address, browser type, operating system)</li>
            <li>Usage data (pages visited, features used, time spent on platform)</li>
            <li>Log data (access times, error logs, performance metrics)</li>
            <li>Cookies and similar tracking technologies (see Section 8)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
          <p className="leading-relaxed mb-4">We use the information we collect for the following purposes:</p>
          <ul className="list-disc pl-6 space-y-2 leading-relaxed">
            <li>
              <strong>Provide and maintain the Service:</strong> Enable core features like attendance tracking, event
              management, and team coordination
            </li>
            <li>
              <strong>Process transactions:</strong> Handle subscription payments and giving transactions through Stripe
            </li>
            <li>
              <strong>Send communications:</strong> Deliver service notifications, updates, and support messages
            </li>
            <li>
              <strong>Improve our Service:</strong> Analyze usage patterns to enhance features and user experience
            </li>
            <li>
              <strong>Ensure security:</strong> Detect and prevent fraud, abuse, and security incidents
            </li>
            <li>
              <strong>Comply with legal obligations:</strong> Meet regulatory requirements and respond to legal requests
            </li>
            <li>
              <strong>Customer support:</strong> Respond to inquiries, troubleshoot issues, and provide assistance
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Data Sharing and Third-Party Services</h2>
          <p className="leading-relaxed mb-4">
            We share your information with trusted third-party service providers who help us operate our Service:
          </p>

          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <h4 className="font-semibold mb-2">Supabase (Database & Authentication)</h4>
              <p className="text-sm leading-relaxed">
                All user and church data is stored securely on Supabase infrastructure with Row-Level Security (RLS)
                ensuring tenant isolation. Data is encrypted at rest and in transit.
              </p>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <h4 className="font-semibold mb-2">Stripe (Payment Processing)</h4>
              <p className="text-sm leading-relaxed">
                Payment and billing information is processed through Stripe. We do not store credit card numbers on our
                servers. Stripe's privacy policy:{" "}
                <a
                  href="https://stripe.com/privacy"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  stripe.com/privacy
                </a>
              </p>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <h4 className="font-semibold mb-2">Slack (Team Collaboration)</h4>
              <p className="text-sm leading-relaxed">
                If you connect your Slack workspace, we send notifications and enable bot interactions. Slack's privacy
                policy:{" "}
                <a
                  href="https://slack.com/privacy-policy"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  slack.com/privacy-policy
                </a>
              </p>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <h4 className="font-semibold mb-2">Google Drive (Media Storage)</h4>
              <p className="text-sm leading-relaxed">
                If you integrate Google Drive, we access files you authorize for media management. Google's privacy
                policy:{" "}
                <a
                  href="https://policies.google.com/privacy"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  policies.google.com/privacy
                </a>
              </p>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <h4 className="font-semibold mb-2">Telnyx (SMS Communications)</h4>
              <p className="text-sm leading-relaxed">
                SMS messages are sent through Telnyx. We do not share contact information beyond what's necessary to
                deliver messages. Telnyx's privacy policy:{" "}
                <a
                  href="https://telnyx.com/privacy-policy"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  telnyx.com/privacy-policy
                </a>
              </p>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <h4 className="font-semibold mb-2">Resend (Email Delivery)</h4>
              <p className="text-sm leading-relaxed">
                Transactional and marketing emails are sent through Resend. Resend's privacy policy:{" "}
                <a
                  href="https://resend.com/legal/privacy-policy"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  resend.com/legal/privacy-policy
                </a>
              </p>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <h4 className="font-semibold mb-2">Vercel Blob (File Storage)</h4>
              <p className="text-sm leading-relaxed">
                Files, images, and media uploads are stored securely on Vercel Blob infrastructure. Vercel's privacy
                policy:{" "}
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  vercel.com/legal/privacy-policy
                </a>
              </p>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <h4 className="font-semibold mb-2">Upstash Redis (Caching & Session Management)</h4>
              <p className="text-sm leading-relaxed">
                We use Upstash Redis for caching and session management to improve performance. Session data is
                encrypted and automatically expires. Upstash's privacy policy:{" "}
                <a
                  href="https://upstash.com/privacy"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  upstash.com/privacy
                </a>
              </p>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <h4 className="font-semibold mb-2">Inngest (Background Jobs & Workflows)</h4>
              <p className="text-sm leading-relaxed">
                Automated tasks and scheduled workflows are processed through Inngest. This includes scheduled emails,
                recurring donation processing, and data synchronization. Inngest's privacy policy:{" "}
                <a
                  href="https://www.inngest.com/privacy"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  inngest.com/privacy
                </a>
              </p>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <h4 className="font-semibold mb-2">Sentry (Error Monitoring)</h4>
              <p className="text-sm leading-relaxed">
                We use Sentry to monitor application errors and performance issues. Error reports may include technical
                information about your device and the actions that led to the error, but we do not send sensitive
                personal information. Sentry's privacy policy:{" "}
                <a
                  href="https://sentry.io/privacy/"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  sentry.io/privacy
                </a>
              </p>
            </div>
          </div>

          <p className="leading-relaxed mt-6">
            <strong>We do not sell your personal information to third parties.</strong> We only share data with service
            providers who are contractually obligated to protect your information and use it solely for providing
            services to us.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
          <p className="leading-relaxed mb-4">
            We implement industry-standard security measures to protect your information:
          </p>
          <ul className="list-disc pl-6 space-y-2 leading-relaxed">
            <li>
              <strong>Encryption:</strong> All data is encrypted in transit using TLS 1.3 and at rest using AES-256
              encryption
            </li>
            <li>
              <strong>Row-Level Security (RLS):</strong> Database-level tenant isolation ensures churches can only
              access their own data
            </li>
            <li>
              <strong>Access Controls:</strong> Role-based permissions and principle of least privilege
            </li>
            <li>
              <strong>Regular Backups:</strong> Automated daily backups with disaster recovery procedures
            </li>
            <li>
              <strong>Security Monitoring:</strong> Real-time error tracking and intrusion detection via Sentry
            </li>
            <li>
              <strong>Secure Authentication:</strong> Password hashing with bcrypt and optional two-factor
              authentication
            </li>
            <li>
              <strong>Giving Data Isolation:</strong> Donor and donation data is strictly isolated per church tenant.
              Platform administrators have no access to sensitive giving information.
            </li>
          </ul>
          <p className="leading-relaxed mt-4 text-sm text-muted-foreground">
            While we strive to protect your information, no method of transmission over the internet or electronic
            storage is 100% secure. We cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Your Data Rights</h2>
          <p className="leading-relaxed mb-4">
            Depending on your location, you may have the following rights regarding your personal information:
          </p>

          <h3 className="text-xl font-medium mb-3 mt-6">GDPR Rights (European Union)</h3>
          <ul className="list-disc pl-6 space-y-2 leading-relaxed">
            <li>
              <strong>Right to Access:</strong> Request a copy of your personal data
            </li>
            <li>
              <strong>Right to Rectification:</strong> Correct inaccurate or incomplete data
            </li>
            <li>
              <strong>Right to Erasure:</strong> Request deletion of your personal data ("right to be forgotten")
            </li>
            <li>
              <strong>Right to Restrict Processing:</strong> Limit how we use your data
            </li>
            <li>
              <strong>Right to Data Portability:</strong> Receive your data in a machine-readable format
            </li>
            <li>
              <strong>Right to Object:</strong> Opt-out of certain data processing activities
            </li>
            <li>
              <strong>Right to Withdraw Consent:</strong> Revoke consent for data processing at any time
            </li>
          </ul>

          <h3 className="text-xl font-medium mb-3 mt-6">CCPA/CPRA Rights (California)</h3>
          <ul className="list-disc pl-6 space-y-2 leading-relaxed">
            <li>
              <strong>Right to Know:</strong> Request disclosure of personal information collected
            </li>
            <li>
              <strong>Right to Delete:</strong> Request deletion of personal information
            </li>
            <li>
              <strong>Right to Opt-Out:</strong> Opt-out of the sale or sharing of personal information (we do not sell
              data)
            </li>
            <li>
              <strong>Right to Non-Discrimination:</strong> Equal service regardless of privacy rights exercise
            </li>
            <li>
              <strong>Right to Correct:</strong> Request correction of inaccurate personal information
            </li>
          </ul>

          <p className="leading-relaxed mt-6">
            To exercise any of these rights, please contact us at{" "}
            <a href="mailto:privacy@dailyoneaccord.com" className="text-primary hover:underline">
              privacy@dailyoneaccord.com
            </a>
            . We will respond to your request within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
          <p className="leading-relaxed">
            We retain your personal information for as long as necessary to provide the Service and fulfill the purposes
            outlined in this Privacy Policy. When you delete your account or request data deletion, we will permanently
            remove your personal information within 30 days, except where we are required to retain it for legal,
            regulatory, or security purposes. Backup copies may persist for up to 90 days before permanent deletion.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. International Data Transfers</h2>
          <p className="leading-relaxed">
            Daily One Accord is based in the United States. If you access our Service from outside the U.S., your
            information may be transferred to, stored, and processed in the United States or other countries where our
            service providers operate. By using the Service, you consent to the transfer of your information to
            countries that may have different data protection laws than your country of residence.
          </p>
          <p className="leading-relaxed mt-4">
            For users in the European Economic Area (EEA), we ensure appropriate safeguards are in place for
            international data transfers, including Standard Contractual Clauses approved by the European Commission.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Cookies and Tracking Technologies</h2>
          <p className="leading-relaxed mb-4">
            We use cookies and similar tracking technologies to enhance your experience:
          </p>
          <ul className="list-disc pl-6 space-y-2 leading-relaxed">
            <li>
              <strong>Essential Cookies:</strong> Required for authentication and core functionality
            </li>
            <li>
              <strong>Analytics Cookies:</strong> Help us understand how users interact with the Service
            </li>
            <li>
              <strong>Preference Cookies:</strong> Remember your settings and preferences
            </li>
            <li>
              <strong>Session Cookies:</strong> Stored in Upstash Redis for secure session management and caching
            </li>
          </ul>
          <p className="leading-relaxed mt-4">
            You can control cookies through your browser settings. Note that disabling cookies may limit your ability to
            use certain features of the Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
          <p className="leading-relaxed">
            Daily One Accord is not intended for children under the age of 13. We do not knowingly collect personal
            information from children under 13. If you are a parent or guardian and believe your child has provided us
            with personal information, please contact us at{" "}
            <a href="mailto:hello@dailyoneaccord.com" className="text-primary hover:underline">
              hello@dailyoneaccord.com
            </a>
            , and we will delete such information from our systems.
          </p>
          <p className="leading-relaxed mt-4">
            Churches may use our Service to manage children's ministry programs. In such cases, the church is
            responsible for obtaining appropriate parental consent and complying with applicable laws regarding
            children's data.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Changes to This Privacy Policy</h2>
          <p className="leading-relaxed">
            We may update this Privacy Policy from time to time to reflect changes in our practices or legal
            requirements. We will notify you of any material changes by posting the new Privacy Policy on this page and
            updating the "Last Updated" date. We encourage you to review this Privacy Policy periodically. Your
            continued use of the Service after changes are posted constitutes your acceptance of the updated Privacy
            Policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
          <p className="leading-relaxed mb-4">
            If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please
            contact us:
          </p>
          <div className="bg-muted p-6 rounded-lg">
            <p className="leading-relaxed">
              <strong>Daily One Accord</strong>
              <br />
              Email:{" "}
              <a href="mailto:hello@dailyoneaccord.com" className="text-primary hover:underline">
                hello@dailyoneaccord.com
              </a>
              <br />
              Support:{" "}
              <a href="mailto:hello@dailyoneaccord.com" className="text-primary hover:underline">
                hello@dailyoneaccord.com
              </a>
              <br />
              Website:{" "}
              <a
                href="https://dailyoneaccord.com"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                dailyoneaccord.com
              </a>
            </p>
          </div>
        </section>

        <section className="border-t pt-8 mt-12">
          <p className="text-sm text-muted-foreground leading-relaxed">
            This Privacy Policy is designed to comply with the General Data Protection Regulation (GDPR), California
            Consumer Privacy Act (CCPA), and other applicable privacy laws. We are committed to transparency and
            protecting your privacy rights.
          </p>
        </section>
      </div>
    </div>
  )
}
