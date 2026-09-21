import React from "react";

export default function Legal({ kind }: { kind: "privacy" | "terms" }) {
  const privacy = kind === "privacy";
  if (privacy) {
    return (
      <LegalPage eyebrow="Sika Boafo privacy policy" title="Your data should work for you.">
        <p>
          This Privacy Policy explains how Sika Boafo collects, uses, stores and
          protects information when you visit our website, create an account or
          use our business management service. By using the service, you
          acknowledge this policy.
        </p>
        <p className="text-xs text-sub/80">Last updated: 21 September 2026</p>

        <LegalSection title="1. Information we collect">
          <p>Depending on how you use Sika Boafo, we may collect:</p>
          <ul>
            <li>account information such as your name, email address, phone number and password credentials;</li>
            <li>business information such as your business name, business type and region;</li>
            <li>workspace information such as products, sales, stock, expenses, customers, debts, purchases, receipts and reports that you choose to enter;</li>
            <li>payment and transaction details such as a payment reference, amount, currency, selected plan and verification status. Payment-card and mobile-money credentials are handled by the payment provider and are not stored by Sika Boafo;</li>
            <li>technical information such as browser type, device information, approximate location, pages visited, error logs and security events; and</li>
            <li>messages or support information you send to us.</li>
          </ul>
        </LegalSection>

        <LegalSection title="2. How we use information">
          <p>We use information to:</p>
          <ul>
            <li>create and secure your account and business workspace;</li>
            <li>provide sales, inventory, reporting, receipt and other requested features;</li>
            <li>verify payments, activate paid plans and prevent fraud or unauthorised access;</li>
            <li>send account, security, service and payment-related notices;</li>
            <li>respond to support requests and investigate errors;</li>
            <li>improve performance, reliability, usability and security; and</li>
            <li>comply with legal obligations and enforce our terms.</li>
          </ul>
        </LegalSection>

        <LegalSection title="3. Lawful handling of information">
          <p>
            We handle information where it is needed to provide the service,
            perform a contract with you, comply with legal obligations, protect
            the service and its users, or where you have given consent. Where
            Ghanaian data-protection law applies, we aim to handle personal data
            in accordance with the applicable requirements of the Data Protection
            Act, 2012 (Act 843), as amended, and guidance from the Data
            Protection Commission.
          </p>
        </LegalSection>

        <LegalSection title="4. When we share information">
          <p>
            We do not sell your personal information. We may share limited
            information with trusted providers that help us operate the service,
            including hosting, database, authentication, payment, email,
            analytics and security providers. They may process information only
            to provide services to us and must apply appropriate protections.
          </p>
          <p>
            We may also disclose information when required by law, to protect
            users or the service, to investigate fraud or abuse, or as part of a
            merger, acquisition or transfer of business assets. We will not share
            your business records for unrelated advertising without your consent.
          </p>
        </LegalSection>

        <LegalSection title="5. Our role and service providers">
          <p>
            For information about your account and use of Sika Boafo, we
            generally act as the organisation responsible for deciding why and
            how that information is used. When you enter information about your
            own customers, staff or suppliers, you remain responsible for
            deciding whether you have the right to collect and use it. In those
            situations, we normally process that information only to provide
            the workspace and features you request.
          </p>
          <p>
            Our providers may include Supabase for authentication, database
            hosting and application services; Paystack for payment processing;
            hosting and content-delivery providers; email or notification
            providers; and security, monitoring or error-reporting providers.
            The providers used may change as the service develops.
          </p>
        </LegalSection>

        <LegalSection title="6. Payment information">
          <p>
            Payments are processed by Paystack or another payment provider
            displayed at checkout. We receive confirmation details needed to
            identify and verify a transaction, but we do not request or store
            your full card number, card PIN, mobile-money PIN or payment
            password. The provider’s own privacy policy also applies to its
            handling of payment information.
          </p>
        </LegalSection>

        <LegalSection title="7. International processing">
          <p>
            Some service providers may process or store information outside
            Ghana. Where this happens, we aim to use providers that apply
            appropriate contractual, technical and organisational safeguards.
            By using the service, you acknowledge that information may be
            processed in countries where our providers or their infrastructure
            operate, subject to applicable law.
          </p>
        </LegalSection>

        <LegalSection title="8. Cookies and local storage">
          <p>
            Sika Boafo may use essential cookies, browser storage and similar
            technologies to keep you signed in, remember preferences, protect
            sessions and support reliable navigation. Disabling essential
            storage may prevent account and dashboard features from working.
            We may use limited, privacy-conscious analytics or error reporting
            to understand service performance. We do not use these technologies
            to sell personal information.
          </p>
        </LegalSection>

        <LegalSection title="9. Communications">
          <p>
            We may send service messages to the email address or phone number
            linked to your account, including verification requests, payment
            confirmations, security alerts, important updates and support
            responses. These are necessary service communications and cannot
            always be unsubscribed from while your account remains active.
          </p>
          <p>
            If we introduce optional marketing messages, we will provide an
            appropriate way to opt out. Opting out of marketing will not stop
            essential account or security messages.
          </p>
        </LegalSection>

        <LegalSection title="10. Security">
          <p>
            We use access controls, authentication safeguards, row-level
            database policies, encrypted connections and server-side payment
            verification designed to protect information. No online service is
            completely secure, so you should use a strong unique password,
            protect your devices and notify us immediately about suspected
            unauthorised access.
          </p>
        </LegalSection>

        <LegalSection title="11. Security incidents">
          <p>
            If we become aware of a security incident affecting personal
            information, we will investigate, take reasonable steps to contain
            it, restore the service and provide notices where required by
            applicable law. You should report suspected account compromise
            promptly and change your password if you believe it may have been
            exposed.
          </p>
        </LegalSection>

        <LegalSection title="12. Retention and deletion">
          <p>
            We keep information for as long as needed to provide the service,
            maintain business records, resolve disputes, meet legal or
            accounting requirements and enforce agreements. When information is
            no longer needed, we aim to delete it or securely de-identify it,
            subject to backups, legal retention requirements and legitimate
            security records.
          </p>
        </LegalSection>

        <LegalSection title="13. Your choices and rights">
          <p>
            Subject to applicable law, you may ask us to access, correct,
            update, export or delete personal information associated with your
            account. You may also object to or request restriction of certain
            processing, withdraw consent where processing is based on consent,
            and complain to the relevant data-protection authority. We may need
            to verify your identity before completing a request, and some
            information may need to be retained for legal or security reasons.
          </p>
        </LegalSection>

        <LegalSection title="14. How to make a privacy request">
          <p>
            Send a request through the support contact published in the service
            with the subject “Privacy Request”. Tell us whether you are asking
            for access, correction, export, deletion, restriction or another
            privacy action. We may ask for account or identity details to
            prevent unauthorised disclosure. If we cannot complete a request,
            we will explain the reason and any available next step.
          </p>
        </LegalSection>

        <LegalSection title="15. Business data and staff access">
          <p>
            You remain responsible for the business and customer information
            entered into your workspace, including having a lawful basis and
            appropriate notice for collecting information about your customers
            or staff. If you invite staff members, give them only the access
            they need and remove access when they leave your business.
          </p>
        </LegalSection>

        <LegalSection title="16. Automated checks">
          <p>
            We may use automated checks to detect suspicious sign-ins, payment
            inconsistencies, duplicate transactions, abuse or other security
            risks. These checks help protect the service and are not intended
            to make decisions about your eligibility for employment, credit,
            insurance or other similarly significant matters.
          </p>
        </LegalSection>

        <LegalSection title="17. Third-party links">
          <p>
            The service may contain links to websites or services operated by
            other organisations. Those services have their own terms and
            privacy policies. We are not responsible for their content,
            security or data practices, so review their policies before
            submitting information.
          </p>
        </LegalSection>

        <LegalSection title="18. Children’s information">
          <p>
            Sika Boafo is intended for business owners and authorised business
            users, not children. Do not create an account for a child or enter
            unnecessary information about children. If you believe a child’s
            information has been submitted to us, contact us so we can review
            and remove it where appropriate.
          </p>
        </LegalSection>

        <LegalSection title="19. Changes to this policy">
          <p>
            We may update this Privacy Policy when the service, law or our data
            practices change. We will update the date above and, where a change
            is material, provide reasonable notice through the service or the
            email associated with your account.
          </p>
        </LegalSection>

        <LegalSection title="20. Contact">
          <p>
            For privacy questions, data requests or complaints, contact us
            through the support details published in the service. Please include
            the email address associated with your account and enough information
            for us to understand your request. We aim to respond within a
            reasonable period and will explain if additional time or information
            is needed.
          </p>
        </LegalSection>

        <LegalSection title="21. Accuracy of information">
          <p>
            Please keep your account and business information accurate and
            current. You should review records before relying on them for
            purchasing, stock decisions, tax filings, payroll, credit decisions
            or other important business activity. We are not responsible for
            decisions made from incomplete, outdated or incorrectly entered
            information.
          </p>
        </LegalSection>

        <LegalSection title="22. Account closure">
          <p>
            You may ask us to close your account through the support contact.
            Closing an account may remove your ability to sign in or access your
            workspace. Before requesting closure, export or otherwise preserve
            records that you need for your business. We may retain limited
            information where necessary for fraud prevention, payment
            reconciliation, legal compliance, dispute resolution or security.
          </p>
        </LegalSection>

        <LegalSection title="23. Backups and service recovery">
          <p>
            We use operational backups and recovery procedures intended to
            protect the service against failures. Backups are not a replacement
            for maintaining your own copies of important business records.
            Deleted information may remain temporarily in encrypted backups
            until those backups expire or are securely overwritten.
          </p>
        </LegalSection>

        <LegalSection title="24. Legal and emergency disclosures">
          <p>
            We may preserve or disclose information when we reasonably believe
            it is necessary to comply with a court order, lawful government
            request, regulatory requirement or legal process. We may also
            disclose information without waiting for ordinary consent where
            necessary to prevent imminent harm, investigate suspected fraud,
            protect the rights or safety of a person, or protect the integrity
            of the service.
          </p>
        </LegalSection>

        <LegalSection title="25. Business changes">
          <p>
            If Sika Boafo is reorganised, sold, merged or transfers part of its
            assets, information may be transferred as part of that transaction.
            We will require the receiving organisation to respect applicable
            privacy obligations and will provide notice where required by law.
          </p>
        </LegalSection>

        <LegalSection title="26. Data minimisation">
          <p>
            We aim to collect information that is relevant to operating the
            service and to avoid requesting information that is not needed. Do
            not enter payment-card numbers, account PINs, authentication
            secrets, medical records or other highly sensitive information into
            ordinary business-record fields.
          </p>
        </LegalSection>

        <LegalSection title="27. Regional privacy rights">
          <p>
            Privacy rights can differ depending on where you live and the role
            you have in relation to the information. If you are acting for a
            business, your organisation may have separate responsibilities to
            inform employees, customers or suppliers about how their
            information is used. We will consider requests under the law that
            applies to the relevant person and processing activity.
          </p>
        </LegalSection>

        <LegalSection title="28. Identity verification">
          <p>
            To protect accounts and prevent disclosure to the wrong person, we
            may ask you to confirm the email address, phone number, business
            details or other account information associated with a request. We
            will not normally ask you to send a password, card PIN or full
            payment credentials by email or support message.
          </p>
        </LegalSection>

        <LegalSection title="29. No sale of personal information">
          <p>
            We do not sell personal information for money. We may use service
            providers under contracts or instructions to operate Sika Boafo,
            but that does not give those providers permission to use your
            information for their unrelated advertising or resale.
          </p>
        </LegalSection>

        <LegalSection title="30. Interpretation">
          <p>
            This Privacy Policy should be read together with the Terms and
            Conditions. If a provision of this policy conflicts with a
            mandatory requirement of applicable law, that legal requirement
            will apply to the extent of the conflict and the remaining
            provisions will continue to operate.
          </p>
        </LegalSection>

        <LegalSection title="31. Sources of information">
          <p>
            Most information covered by this policy comes directly from you or
            from authorised people using your workspace. We may also receive
            limited information from authentication systems, payment providers,
            fraud-prevention tools, hosting platforms and public sources where
            needed to secure or operate the service. We do not intentionally
            collect information from unrelated data brokers for advertising.
          </p>
        </LegalSection>

        <LegalSection title="32. Workspace permissions">
          <p>
            Your account may allow you to invite staff or other authorised users.
            Information visible to those users depends on the permissions and
            features configured for the workspace. You are responsible for
            reviewing invitations, assigning appropriate roles and removing
            access that is no longer needed. We may retain access logs to
            investigate security events and support requests.
          </p>
        </LegalSection>

        <LegalSection title="33. Retention categories">
          <p>
            Account and identity information is generally retained while your
            account is active and for a reasonable period afterward. Transaction
            and payment records may be retained longer for accounting, fraud
            prevention, tax, dispute and legal purposes. Support messages and
            security logs are retained for the period needed to resolve the
            matter and protect the service. Actual retention periods may vary
            according to the type of record and applicable obligations.
          </p>
        </LegalSection>

        <LegalSection title="34. Complaints and escalation">
          <p>
            Please contact us first so we can investigate and try to resolve a
            privacy concern. Include the relevant account email, a description
            of the issue and the outcome you are requesting. You may also have
            the right to complain to the Data Protection Commission or another
            competent authority in your jurisdiction if you believe your
            information has been handled unlawfully.
          </p>
        </LegalSection>

        <LegalSection title="35. Cooperation with investigations">
          <p>
            We may cooperate with payment providers, banks, regulators,
            law-enforcement agencies and professional advisers when investigating
            fraud, unauthorised access, money laundering, abuse, security
            incidents or other unlawful activity. We limit disclosures to what
            we reasonably believe is relevant and lawful in the circumstances.
          </p>
        </LegalSection>

        <LegalSection title="36. Changes in account ownership">
          <p>
            If a business changes ownership or an account is transferred to a
            new authorised administrator, the business is responsible for
            ensuring that the transfer is lawful and that affected users are
            informed. We may request evidence of authority before changing an
            account owner or disclosing workspace information.
          </p>
        </LegalSection>

        <LegalSection title="37. Anonymous and aggregated information">
          <p>
            We may create statistics or reports that no longer identify an
            individual or a particular business. We may use and share
            appropriately aggregated or de-identified information for product
            improvement, reliability, security and service planning, provided
            that we do not attempt to re-identify the information.
          </p>
        </LegalSection>

        <LegalSection title="38. Policy scope">
          <p>
            This policy applies to the Sika Boafo website, application,
            account, dashboard and related support interactions. It does not
            apply to independent services operated by Paystack, Supabase,
            social-media platforms, email providers or other third parties.
            Their own terms and privacy notices govern their services.
          </p>
        </LegalSection>

        <LegalSection title="39. Effective date">
          <p>
            This version is effective from the “Last updated” date shown above.
            Earlier versions may apply to information collected before this
            version took effect where required by law or where the earlier
            policy governed the relevant processing.
          </p>
        </LegalSection>

        <LegalSection title="40. Plain-language summary">
          <p>
            In short, we collect information needed to run your account,
            workspace and payments; use it to provide and protect Sika Boafo;
            share it only with necessary providers or where legally required;
            protect it with reasonable safeguards; and give you ways to ask
            about, correct, export or delete eligible information. This summary
            does not replace the full policy above.
          </p>
        </LegalSection>
      </LegalPage>
    );
  }

  return (
    <LegalPage eyebrow="Sika Boafo terms and conditions" title="Clear terms for running your business.">
      <p>
        These Terms and Conditions govern your access to and use of Sika Boafo,
        a business management service for shops, vendors and other small
        businesses. By creating an account, paying for a plan or using the
        service, you agree to these terms.
      </p>
      <p className="text-xs text-sub/80">Last updated: 21 September 2026</p>

      <LegalSection title="1. The service">
        <p>
          Sika Boafo provides tools for recording sales, products, stock,
          expenses, customers, debts, reports and receipts. The service is a
          record-keeping and management tool. It is not accounting, tax, legal,
          financial or business advice, and it does not replace your own
          professional advisers or statutory records.
        </p>
      </LegalSection>

      <LegalSection title="2. Your account">
        <ul>
          <li>You must provide accurate registration and business information.</li>
          <li>You are responsible for keeping your password and devices secure.</li>
          <li>You are responsible for activity carried out through your account and for giving staff only the access they need.</li>
          <li>You must tell us promptly if you believe your account has been accessed without permission.</li>
          <li>One person or business must not use an account to impersonate another person or business.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Plans, prices and payment">
        <ul>
          <li>Access to the Business dashboard requires a successful payment and verified Business plan status.</li>
          <li>Prices, billing periods and any applicable taxes or payment charges are shown at checkout before you pay.</li>
          <li>Where the checkout shows a first month price of GH₵30 and subsequent months at GH₵60, the total is calculated from the number of months selected.</li>
          <li>Payments are processed by Paystack. We do not store your full card or mobile-money credentials.</li>
          <li>A plan is activated only after the payment is verified by our server. A pending, failed, cancelled or reversed payment does not unlock paid features.</li>
          <li>Unless required by law or stated at checkout, payments are not refundable after the paid service has been activated.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Acceptable use">
        <p>You must not use Sika Boafo to:</p>
        <ul>
          <li>break the law, commit fraud or infringe another person's rights;</li>
          <li>upload malware, harmful code or content that could compromise the service;</li>
          <li>attempt to access another account, bypass payment controls or interfere with security;</li>
          <li>copy, resell, reverse engineer or exploit the service except where applicable law permits it; or</li>
          <li>store highly sensitive information that the service does not request, including payment-card numbers, PINs or passwords.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Your business data">
        <p>
          You retain responsibility for the business information you enter,
          including its accuracy, legality, backups and retention. You grant us
          permission to host and process that information only as needed to
          provide, secure and improve the service. You must not enter data that
          you do not have the right to use.
        </p>
      </LegalSection>

      <LegalSection title="6. Availability and changes">
        <p>
          We aim to keep Sika Boafo available and reliable, but uninterrupted
          service cannot be guaranteed. Maintenance, network failures, payment
          provider outages and events outside our reasonable control may affect
          availability. We may update features or these terms when necessary.
          If a change materially affects your rights, we will provide reasonable
          notice through the service or the email associated with your account.
        </p>
      </LegalSection>

      <LegalSection title="7. Suspension and termination">
        <p>
          We may suspend or terminate access where an account is unpaid, used
          unlawfully, creates a security risk or breaches these terms. You may
          stop using the service at any time. Suspension or termination does not
          remove obligations that arose before termination, including payment
          obligations and responsibility for your data.
        </p>
      </LegalSection>

      <LegalSection title="8. Disclaimers and liability">
        <p>
          Sika Boafo is provided on an “as available” basis. To the extent
          permitted by law, we do not promise that the service will be
          error-free, meet every business need or prevent every loss of data.
          You should keep appropriate business backups. To the extent permitted
          by law, Sika Boafo is not liable for indirect, incidental, special or
          consequential losses, loss of profits or loss of business data arising
          from your use of the service. Nothing in these terms excludes
          liability that cannot legally be excluded.
        </p>
      </LegalSection>

      <LegalSection title="9. Governing law and contact">
        <p>
          These terms are governed by the laws of the Republic of Ghana, subject
          to any mandatory consumer protections that apply to you. Please
          contact us through the support details published in the service if you
          have a question, complaint or request about these terms.
        </p>
      </LegalSection>

      <LegalSection title="10. Intellectual property">
        <p>
          Sika Boafo, including its name, branding, software, visual design,
          documentation, logos, text, graphics and underlying technology, is
          owned by or licensed to us. Subject to these terms and your active
          plan, we give you a limited, non-exclusive, non-transferable and
          revocable permission to access and use the service for your own
          business operations. This permission does not transfer ownership or
          give you a right to copy, modify, distribute, publish, sell or create
          competing products from the service.
        </p>
      </LegalSection>

      <LegalSection title="11. Your content and feedback">
        <p>
          You retain ownership of the business information and other content
          that you lawfully submit. You give us the limited permission needed to
          host, store, transmit, display and process that content to provide the
          service, support your account, maintain security and comply with law.
          You also give us permission to use suggestions or feedback you freely
          provide to improve the service without owing you compensation, provided
          that we do not disclose your confidential business information as part
          of that use.
        </p>
      </LegalSection>

      <LegalSection title="12. Staff and invited users">
        <p>
          If you invite staff, accountants, agents or other users to your
          workspace, you confirm that you have authority to give them access.
          You are responsible for their activity, the permissions you assign,
          the accuracy of their entries and removing their access when it is no
          longer appropriate. Users must not share credentials or use another
          person's account.
        </p>
      </LegalSection>

      <LegalSection title="13. Plan periods and renewal">
        <p>
          Your paid access lasts for the plan period confirmed after successful
          payment. A new payment may be required for continued access after
          that period. Unless the checkout specifically says otherwise, plans
          do not renew automatically and we will not charge a payment method
          without a new authorised transaction. We may change future prices,
          features or plan terms with reasonable notice.
        </p>
      </LegalSection>

      <LegalSection title="14. Payment disputes and reversals">
        <p>
          If a payment is reversed, disputed, charged back or identified as
          fraudulent, we may suspend or remove the related paid access while we
          investigate. You agree to cooperate with reasonable verification
          requests and not to submit repeated disputes for a valid transaction.
          Nothing in this section limits rights that cannot legally be waived.
        </p>
      </LegalSection>

      <LegalSection title="15. Refunds and cancellation">
        <p>
          You may stop using the service at any time, but stopping use does not
          automatically create a refund. Refund requests are considered under
          the policy shown at checkout and applicable Ghanaian law. If we offer a
          refund, it may be returned through the original payment provider and
          may take time to appear. We may refuse a request where the service was
          used fraudulently or where a refund would cause an unlawful duplicate
          payment.
        </p>
      </LegalSection>

      <LegalSection title="16. Support and service requests">
        <p>
          We may provide support through the contact details published in the
          service. Support response times are targets, not guaranteed service
          levels, unless a separate written agreement says otherwise. Do not
          send passwords, payment PINs, secret keys or complete card details in
          a support request. We may ask for account information to verify that
          you are authorised to receive help.
        </p>
      </LegalSection>

      <LegalSection title="17. Third-party services">
        <p>
          Sika Boafo may connect to or rely on third-party services, including
          Supabase, Paystack, email providers, hosting services and mobile
          networks. Those services may have their own outages, terms, fees and
          privacy policies. We are not responsible for third-party services
          outside our reasonable control, although we will try to provide
          accurate information about required integrations.
        </p>
      </LegalSection>

      <LegalSection title="18. Prohibited commercial activity">
        <p>
          You must not use the service to operate unlawful schemes, process
          stolen payment instruments, launder money, distribute controlled
          goods unlawfully, impersonate another business, or create accounts
          for deceptive or abusive purposes. We may report suspected unlawful
          activity to appropriate providers or authorities where permitted or
          required.
        </p>
      </LegalSection>

      <LegalSection title="19. Confidentiality">
        <p>
          Each party should protect non-public information received from the
          other party and use it only for the purposes of the service or
          agreement. This does not apply to information that is already public,
          independently developed, lawfully received from another source or
          required to be disclosed by law. You should avoid entering trade
          secrets or highly sensitive information into fields that are not
          designed for them.
        </p>
      </LegalSection>

      <LegalSection title="20. Indemnity">
        <p>
          To the extent permitted by law, you agree to address claims, losses,
          penalties and reasonable costs arising from your unlawful use of the
          service, your breach of these terms, your content, or your failure to
          obtain the permissions needed to process information you enter. This
          does not require you to indemnify us for losses caused by our own
          proven unlawful conduct.
        </p>
      </LegalSection>

      <LegalSection title="21. Force majeure">
        <p>
          We are not responsible for delay or failure caused by events outside
          reasonable control, including internet or telecommunications failure,
          power outages, natural disasters, public-health emergencies, war,
          civil unrest, labour disputes, government action, payment-provider
          interruption or cyber incidents affecting shared infrastructure.
        </p>
      </LegalSection>

      <LegalSection title="22. Notices">
        <p>
          We may send notices to the email address on your account, display them
          in the service or publish them on an official Sika Boafo page. You are
          responsible for keeping contact information current and checking
          important account messages. A notice is treated as received when sent
          or made available, unless applicable law requires a different rule.
        </p>
      </LegalSection>

      <LegalSection title="23. Dispute resolution">
        <p>
          If you have a complaint, please contact us first and give us a
          reasonable opportunity to investigate. The parties should try in good
          faith to resolve a dispute through discussion before starting formal
          proceedings, except where urgent legal relief or a mandatory legal
          process is required. Nothing here removes a right or remedy that
          cannot lawfully be excluded.
        </p>
      </LegalSection>

      <LegalSection title="24. Assignment and transfer">
        <p>
          You may not transfer your account or these terms to another person
          without our written approval, except as part of a genuine transfer of
          the relevant business with proper authorisation. We may transfer our
          rights and obligations as part of a reorganisation, financing, sale
          or transfer of the service, provided applicable customer protections
          continue to apply.
        </p>
      </LegalSection>

      <LegalSection title="25. Severability and no waiver">
        <p>
          If a court or competent authority finds part of these terms invalid or
          unenforceable, the remaining parts will continue in effect and the
          invalid part will be applied as far as legally permitted. If we do
          not immediately enforce a provision, that does not waive our right to
          enforce it later.
        </p>
      </LegalSection>

      <LegalSection title="26. Entire agreement and updates">
        <p>
          These terms, the Privacy Policy, the plan details shown at checkout
          and any separate written agreement form the agreement between you and
          Sika Boafo about the service. We may update these terms from time to
          time. Continued use after an effective update means you accept the
          updated terms, subject to any notice or consent required by law.
        </p>
      </LegalSection>

      <LegalSection title="27. Cybersecurity and responsible use">
        <p>
          We use reasonable technical and organisational safeguards intended to
          protect accounts, business records and payment verification. These
          safeguards may include encrypted connections, authenticated sessions,
          access controls, database policies, server-side payment verification,
          security logging and deployment security headers. Security measures
          reduce risk but cannot guarantee that every attack, outage or
          unauthorised event will be prevented.
        </p>
        <p>
          You must protect your password, devices, recovery email, staff access
          and payment accounts. Do not share passwords, Supabase keys, Paystack
          secret keys, payment PINs or one-time codes. Do not attempt to scan,
          probe, overload, exploit or bypass the service, its authentication,
          payment verification, database policies or other security controls.
        </p>
      </LegalSection>

      <LegalSection title="28. Reporting a security concern">
        <p>
          If you discover suspected unauthorised access, a leaked credential,
          suspicious payment activity, malware or another security weakness,
          contact us through the support details published in the service as
          soon as possible. Please provide the affected account or feature,
          approximate time, steps to reproduce and any relevant evidence. Do
          not access, copy, change or disclose another person's information
          while investigating a concern.
        </p>
      </LegalSection>
    </LegalPage>
  );
}

function LegalPage({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
      <p className="text-sm font-bold uppercase tracking-wider text-brand">{eyebrow}</p>
      <h1 className="font-display font-extrabold text-4xl text-ink mt-3">{title}</h1>
      <div className="mt-10 space-y-6 text-sm text-sub leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_p]:max-w-2xl">
        {children}
      </div>
    </div>
  );
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display font-bold text-lg text-ink">{title}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}
