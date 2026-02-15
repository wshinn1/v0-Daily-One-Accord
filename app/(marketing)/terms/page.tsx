export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

      <div className="space-y-8 text-foreground/90">
        <section>
          <p className="text-sm text-muted-foreground mb-4">
            <strong>Effective Date:</strong> January 28, 2025
            <br />
            <strong>Last Updated:</strong> January 28, 2025
          </p>

          <p className="leading-relaxed">
            Welcome to Daily One Accord. These Terms of Service ("Terms") govern your access to and use of our church
            management platform and services (the "Service"). By accessing or using the Service, you agree to be bound
            by these Terms. If you do not agree to these Terms, please do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="leading-relaxed">
            By creating an account, accessing, or using Daily One Accord, you acknowledge that you have read,
            understood, and agree to be bound by these Terms and our Privacy Policy. If you are using the Service on
            behalf of a church or organization, you represent that you have the authority to bind that entity to these
            Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
          <p className="leading-relaxed mb-4">
            Daily One Accord provides a comprehensive church management platform that includes:
          </p>
          <ul className="list-disc pl-6 space-y-2 leading-relaxed">
            <li>Member and visitor management with attendance tracking</li>
            <li>Event planning and calendar management</li>
            <li>Team scheduling and volunteer coordination</li>
            <li>Service planning with rundowns and worship song management</li>
            <li>Communication tools (email, SMS, Slack integration)</li>
            <li>Giving and donation management with Stripe integration</li>
            <li>Media management with Google Drive integration</li>
            <li>Analytics and reporting</li>
            <li>Custom branding and theming</li>
          </ul>
          <p className="leading-relaxed mt-4">
            We reserve the right to modify, suspend, or discontinue any part of the Service at any time with reasonable
            notice to users.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Account Registration and Security</h2>

          <h3 className="text-xl font-medium mb-3 mt-6">Account Creation</h3>
          <p className="leading-relaxed mb-4">
            To use the Service, you must create an account by providing accurate and complete information. You agree to:
          </p>
          <ul className="list-disc pl-6 space-y-2 leading-relaxed">
            <li>Provide truthful, accurate, and complete registration information</li>
            <li>Maintain and promptly update your account information</li>
            <li>Keep your password secure and confidential</li>
            <li>Notify us immediately of any unauthorized access to your account</li>
            <li>Accept responsibility for all activities that occur under your account</li>
          </ul>

          <h3 className="text-xl font-medium mb-3 mt-6">Account Security</h3>
          <p className="leading-relaxed">
            You are responsible for maintaining the security of your account credentials. Daily One Accord cannot and
            will not be liable for any loss or damage arising from your failure to comply with this security obligation.
            We recommend enabling two-factor authentication for enhanced security.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Subscription Plans and Billing</h2>

          <h3 className="text-xl font-medium mb-3 mt-6">Subscription Tiers</h3>
          <p className="leading-relaxed mb-4">
            Daily One Accord offers multiple subscription tiers with varying features and pricing. Current plans
            include:
          </p>
          <ul className="list-disc pl-6 space-y-2 leading-relaxed">
            <li>
              <strong>Starter Plan:</strong> $49/month for up to 100 members
            </li>
            <li>
              <strong>Growth Plan:</strong> $99/month for up to 300 members
            </li>
            <li>
              <strong>Pro Plan:</strong> $199/month for up to 1,000 members
            </li>
            <li>
              <strong>Enterprise Plan:</strong> Custom pricing for unlimited members
            </li>
          </ul>

          <h3 className="text-xl font-medium mb-3 mt-6">Billing and Payment</h3>
          <ul className="list-disc pl-6 space-y-2 leading-relaxed">
            <li>
              <strong>Payment Processing:</strong> All payments are processed securely through Stripe. By subscribing,
              you authorize us to charge your payment method on a recurring basis.
            </li>
            <li>
              <strong>Billing Cycle:</strong> Subscriptions are billed monthly or annually based on your selected plan.
              Billing occurs on the same day each period.
            </li>
            <li>
              <strong>Setup Fee:</strong> A one-time setup fee may apply based on your selected tier and is
              non-refundable.
            </li>
            <li>
              <strong>Maintenance Fee:</strong> A $99 monthly maintenance fee applies to all active subscriptions. This
              fee covers platform maintenance, security updates, customer support, data backups, and ongoing feature
              improvements. The maintenance fee is billed separately from your subscription plan and is non-refundable.
            </li>
            <li>
              <strong>Price Changes:</strong> We reserve the right to modify pricing with 30 days' advance notice.
              Existing subscribers will be grandfathered at their current rate for 90 days.
            </li>
            <li>
              <strong>Failed Payments:</strong> If a payment fails, we will attempt to process it again. Continued
              payment failure may result in service suspension.
            </li>
            <li>
              <strong>Taxes:</strong> Prices do not include applicable taxes, which will be added to your invoice as
              required by law.
            </li>
          </ul>

          <h3 className="text-xl font-medium mb-3 mt-6">Free Trial</h3>
          <p className="leading-relaxed">
            We may offer a free trial period for new users. A valid payment method is required to start a trial. If you
            do not cancel before the trial ends, you will be automatically charged for your selected subscription plan.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Cancellation and Refunds</h2>

          <h3 className="text-xl font-medium mb-3 mt-6">Cancellation Policy</h3>
          <p className="leading-relaxed mb-4">You may cancel your subscription at any time by:</p>
          <ul className="list-disc pl-6 space-y-2 leading-relaxed">
            <li>Accessing your account settings and selecting "Cancel Subscription"</li>
            <li>Contacting our support team at hello@dailyoneaccord.com</li>
          </ul>
          <p className="leading-relaxed mt-4">
            Upon cancellation, you will retain access to the Service until the end of your current billing period. No
            refunds will be provided for partial months or unused time.
          </p>

          <h3 className="text-xl font-medium mb-3 mt-6">Refund Policy</h3>
          <ul className="list-disc pl-6 space-y-2 leading-relaxed">
            <li>
              <strong>Setup Fees:</strong> Non-refundable
            </li>
            <li>
              <strong>Monthly Subscriptions:</strong> No refunds for partial months
            </li>
            <li>
              <strong>Annual Subscriptions:</strong> Refunds may be provided on a case-by-case basis within 30 days of
              initial purchase
            </li>
            <li>
              <strong>Service Issues:</strong> If you experience significant service disruptions, contact us for
              potential credit or refund
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Acceptable Use Policy</h2>
          <p className="leading-relaxed mb-4">You agree to use the Service only for lawful purposes. You must not:</p>
          <ul className="list-disc pl-6 space-y-2 leading-relaxed">
            <li>Violate any applicable laws, regulations, or third-party rights</li>
            <li>Upload or transmit viruses, malware, or other malicious code</li>
            <li>Attempt to gain unauthorized access to the Service or other users' accounts</li>
            <li>Interfere with or disrupt the Service or servers</li>
            <li>Use the Service to send spam, unsolicited communications, or harassment</li>
            <li>Scrape, crawl, or use automated tools to access the Service without permission</li>
            <li>Reverse engineer, decompile, or attempt to extract source code</li>
            <li>Resell, sublicense, or redistribute the Service without authorization</li>
            <li>Use the Service for any discriminatory, hateful, or harmful purposes</li>
            <li>Impersonate any person or entity or misrepresent your affiliation</li>
          </ul>
          <p className="leading-relaxed mt-4">
            Violation of this Acceptable Use Policy may result in immediate suspension or termination of your account
            without refund.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Data Ownership and Privacy</h2>

          <h3 className="text-xl font-medium mb-3 mt-6">Your Data</h3>
          <p className="leading-relaxed">
            You retain all ownership rights to the data you upload to the Service ("Your Data"). By using the Service,
            you grant us a limited license to store, process, and display Your Data solely for the purpose of providing
            the Service to you.
          </p>

          <h3 className="text-xl font-medium mb-3 mt-6">Data Security</h3>
          <p className="leading-relaxed">
            We implement industry-standard security measures to protect Your Data, including encryption, Row-Level
            Security (RLS), and regular backups. However, no system is completely secure, and we cannot guarantee
            absolute security.
          </p>

          <h3 className="text-xl font-medium mb-3 mt-6">Data Portability</h3>
          <p className="leading-relaxed">
            You may export Your Data at any time through the Service's export features. Upon account termination, you
            have 30 days to export Your Data before it is permanently deleted.
          </p>

          <h3 className="text-xl font-medium mb-3 mt-6">Privacy</h3>
          <p className="leading-relaxed">
            Our collection and use of personal information is governed by our Privacy Policy. By using the Service, you
            consent to our Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Third-Party Integrations</h2>
          <p className="leading-relaxed mb-4">
            Daily One Accord integrates with third-party services to enhance functionality:
          </p>
          <ul className="list-disc pl-6 space-y-2 leading-relaxed">
            <li>
              <strong>Stripe:</strong> Payment processing and giving management
            </li>
            <li>
              <strong>Slack:</strong> Team communication and notifications
            </li>
            <li>
              <strong>Google Drive:</strong> Media storage and management
            </li>
            <li>
              <strong>Telnyx:</strong> SMS messaging
            </li>
            <li>
              <strong>Resend:</strong> Email delivery
            </li>
          </ul>
          <p className="leading-relaxed mt-4">
            Your use of these integrations is subject to their respective terms of service and privacy policies. We are
            not responsible for the practices or policies of third-party services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Intellectual Property</h2>

          <h3 className="text-xl font-medium mb-3 mt-6">Our Intellectual Property</h3>
          <p className="leading-relaxed">
            The Service, including all software, designs, text, graphics, logos, and other content (excluding Your
            Data), is owned by Daily One Accord and protected by copyright, trademark, and other intellectual property
            laws. You may not copy, modify, distribute, or create derivative works without our express written
            permission.
          </p>

          <h3 className="text-xl font-medium mb-3 mt-6">Trademarks</h3>
          <p className="leading-relaxed">
            "Daily One Accord" and our logo are trademarks of Daily One Accord. You may not use our trademarks without
            prior written consent.
          </p>

          <h3 className="text-xl font-medium mb-3 mt-6">Feedback</h3>
          <p className="leading-relaxed">
            If you provide feedback, suggestions, or ideas about the Service, you grant us a perpetual, irrevocable,
            royalty-free license to use and incorporate such feedback without compensation or attribution.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Disclaimers and Limitations of Liability</h2>

          <h3 className="text-xl font-medium mb-3 mt-6">Service Availability</h3>
          <p className="leading-relaxed">
            The Service is provided "as is" and "as available" without warranties of any kind, either express or
            implied. We do not guarantee that the Service will be uninterrupted, error-free, or completely secure.
          </p>

          <h3 className="text-xl font-medium mb-3 mt-6">Limitation of Liability</h3>
          <p className="leading-relaxed">
            To the maximum extent permitted by law, Daily One Accord shall not be liable for any indirect, incidental,
            special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising from your
            use of the Service. Our total liability shall not exceed the amount you paid us in the 12 months preceding
            the claim.
          </p>

          <h3 className="text-xl font-medium mb-3 mt-6">Force Majeure</h3>
          <p className="leading-relaxed">
            We are not liable for any failure or delay in performance due to circumstances beyond our reasonable
            control, including natural disasters, war, terrorism, labor disputes, or internet service provider failures.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">11. Indemnification</h2>
          <p className="leading-relaxed">
            You agree to indemnify, defend, and hold harmless Daily One Accord, its officers, directors, employees, and
            agents from any claims, liabilities, damages, losses, and expenses (including legal fees) arising from:
          </p>
          <ul className="list-disc pl-6 space-y-2 leading-relaxed">
            <li>Your use of the Service</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of any third-party rights</li>
            <li>Your Data or content uploaded to the Service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">12. Termination</h2>

          <h3 className="text-xl font-medium mb-3 mt-6">Termination by You</h3>
          <p className="leading-relaxed">
            You may terminate your account at any time by canceling your subscription through your account settings or
            contacting support.
          </p>

          <h3 className="text-xl font-medium mb-3 mt-6">Termination by Us</h3>
          <p className="leading-relaxed mb-4">We may suspend or terminate your account if:</p>
          <ul className="list-disc pl-6 space-y-2 leading-relaxed">
            <li>You violate these Terms or our Acceptable Use Policy</li>
            <li>Your payment method fails repeatedly</li>
            <li>We are required to do so by law</li>
            <li>We discontinue the Service (with reasonable notice)</li>
          </ul>

          <h3 className="text-xl font-medium mb-3 mt-6">Effect of Termination</h3>
          <p className="leading-relaxed">
            Upon termination, your access to the Service will cease immediately. You will have 30 days to export Your
            Data before it is permanently deleted. Fees paid are non-refundable except as expressly stated in these
            Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">13. Dispute Resolution</h2>

          <h3 className="text-xl font-medium mb-3 mt-6">Governing Law</h3>
          <p className="leading-relaxed">
            These Terms are governed by the laws of the State of [Your State], United States, without regard to conflict
            of law principles.
          </p>

          <h3 className="text-xl font-medium mb-3 mt-6">Arbitration</h3>
          <p className="leading-relaxed">
            Any dispute arising from these Terms or the Service shall be resolved through binding arbitration in
            accordance with the American Arbitration Association's rules, rather than in court. You waive your right to
            participate in class action lawsuits.
          </p>

          <h3 className="text-xl font-medium mb-3 mt-6">Exceptions</h3>
          <p className="leading-relaxed">
            Either party may seek injunctive relief in court to protect intellectual property rights or prevent
            unauthorized access to the Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">14. Changes to Terms</h2>
          <p className="leading-relaxed">
            We may update these Terms from time to time to reflect changes in our practices, legal requirements, or
            Service features. We will notify you of material changes by email or through the Service at least 30 days
            before they take effect. Your continued use of the Service after changes are posted constitutes acceptance
            of the updated Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">15. General Provisions</h2>

          <h3 className="text-xl font-medium mb-3 mt-6">Entire Agreement</h3>
          <p className="leading-relaxed">
            These Terms, together with our Privacy Policy, constitute the entire agreement between you and Daily One
            Accord regarding the Service.
          </p>

          <h3 className="text-xl font-medium mb-3 mt-6">Severability</h3>
          <p className="leading-relaxed">
            If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will
            continue in full force and effect.
          </p>

          <h3 className="text-xl font-medium mb-3 mt-6">Waiver</h3>
          <p className="leading-relaxed">
            Our failure to enforce any provision of these Terms does not constitute a waiver of that provision or our
            right to enforce it in the future.
          </p>

          <h3 className="text-xl font-medium mb-3 mt-6">Assignment</h3>
          <p className="leading-relaxed">
            You may not assign or transfer these Terms or your account without our written consent. We may assign these
            Terms in connection with a merger, acquisition, or sale of assets.
          </p>

          <h3 className="text-xl font-medium mb-3 mt-6">Contact Information</h3>
          <p className="leading-relaxed">
            For questions about these Terms, please contact us at hello@dailyoneaccord.com.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">16. Contact Us</h2>
          <p className="leading-relaxed mb-4">
            If you have questions or concerns about these Terms of Service, please contact us:
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
            By using Daily One Accord, you acknowledge that you have read, understood, and agree to be bound by these
            Terms of Service. Thank you for choosing Daily One Accord to serve your church.
          </p>
        </section>
      </div>
    </div>
  )
}
