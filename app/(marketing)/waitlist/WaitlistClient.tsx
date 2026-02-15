"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, CheckCircle2 } from "lucide-react"
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema"

export default function WaitlistClient() {
  const breadcrumbItems = [
    { name: "Home", url: "https://dailyoneaccord.com" },
    { name: "Waitlist", url: "https://dailyoneaccord.com/waitlist" },
  ]

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />

      <div className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <Badge variant="secondary" className="mb-6">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Coming Soon
                </Badge>
                <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">Join the Waitlist</h1>
                <p className="text-xl text-muted-foreground text-pretty">
                  The wait won't be long. Be the first to know when Daily One Accord launches.
                </p>
              </div>

              {/* Waitlist Form Card */}
              <Card className="p-8 md:p-12 max-w-2xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4 text-center">Get Exclusive Early Access</h2>
                  <p className="text-muted-foreground text-center">
                    Join our waitlist to receive updates and be among the first to experience the future of church
                    management.
                  </p>
                </div>

                {/* Flodesk Form Embed */}
                <div className="waitlist-form-container">
                  <link rel="preload" href="https://assets.flodesk.com/flodesk-sans.css" as="style" />
                  <link rel="stylesheet" href="https://assets.flodesk.com/flodesk-sans.css" />

                  <div
                    className="ff-68bb1ac4691898b1e0a8d6b1"
                    data-ff-el="root"
                    data-ff-version="3"
                    data-ff-type="inline"
                    data-ff-name="ribbonBanner"
                    data-ff-stage="default"
                  >
                    <div
                      data-ff-el="config"
                      data-ff-config="eyJ0cmlnZ2VyIjp7Im1vZGUiOiJpbW1lZGlhdGVseSIsInZhbHVlIjowfSwib25TdWNjZXNzIjp7Im1vZGUiOiJtZXNzYWdlIiwibWVzc2FnZSI6IiIsInJlZGlyZWN0VXJsIjoiIn0sImNvaSI6ZmFsc2UsInNob3dGb3JSZXR1cm5WaXNpdG9ycyI6dHJ1ZSwibm90aWZpY2F0aW9uIjp0cnVlfQ=="
                      style={{ display: "none" }}
                    ></div>

                    <div className="ff-68bb1ac4691898b1e0a8d6b1__container">
                      <form
                        className="ff-68bb1ac4691898b1e0a8d6b1__form"
                        action="https://form.flodesk.com/forms/68bb1ac4691898b1e0a8d6b1/submit"
                        method="post"
                        data-ff-el="form"
                      >
                        <div className="ff-68bb1ac4691898b1e0a8d6b1__content fd-form-content" data-ff-el="content">
                          <div className="ff-68bb1ac4691898b1e0a8d6b1__fields" data-ff-el="fields">
                            <div className="ff-68bb1ac4691898b1e0a8d6b1__field fd-form-group">
                              <input
                                id="ff-68bb1ac4691898b1e0a8d6b1-firstName"
                                className="ff-68bb1ac4691898b1e0a8d6b1__control fd-form-control"
                                type="text"
                                maxLength={255}
                                name="firstName"
                                placeholder="First name"
                                data-ff-tab="firstName::lastName"
                              />
                              <label
                                htmlFor="ff-68bb1ac4691898b1e0a8d6b1-firstName"
                                className="ff-68bb1ac4691898b1e0a8d6b1__label fd-form-label"
                              >
                                <div>
                                  <div>First name</div>
                                </div>
                              </label>
                            </div>

                            <div className="ff-68bb1ac4691898b1e0a8d6b1__field fd-form-group">
                              <input
                                id="ff-68bb1ac4691898b1e0a8d6b1-lastName"
                                className="ff-68bb1ac4691898b1e0a8d6b1__control fd-form-control"
                                type="text"
                                maxLength={255}
                                name="lastName"
                                placeholder="Last name"
                                data-ff-tab="lastName:firstName:email"
                              />
                              <label
                                htmlFor="ff-68bb1ac4691898b1e0a8d6b1-lastName"
                                className="ff-68bb1ac4691898b1e0a8d6b1__label fd-form-label"
                              >
                                <div>
                                  <div>Last name</div>
                                </div>
                              </label>
                            </div>

                            <div className="ff-68bb1ac4691898b1e0a8d6b1__field fd-form-group">
                              <input
                                id="ff-68bb1ac4691898b1e0a8d6b1-email"
                                className="ff-68bb1ac4691898b1e0a8d6b1__control fd-form-control"
                                type="text"
                                maxLength={255}
                                name="email"
                                placeholder="Email address"
                                data-ff-tab="email:lastName:submit"
                                required
                              />
                              <label
                                htmlFor="ff-68bb1ac4691898b1e0a8d6b1-email"
                                className="ff-68bb1ac4691898b1e0a8d6b1__label fd-form-label"
                              >
                                <div>
                                  <div>Email address</div>
                                </div>
                              </label>
                            </div>

                            <input
                              type="text"
                              maxLength={255}
                              name="confirm_email_address"
                              style={{ display: "none" }}
                            />
                          </div>

                          <div className="ff-68bb1ac4691898b1e0a8d6b1__footer" data-ff-el="footer">
                            <button
                              type="submit"
                              className="ff-68bb1ac4691898b1e0a8d6b1__button fd-btn"
                              data-ff-el="submit"
                              data-ff-tab="submit"
                            >
                              <span>Join Waitlist</span>
                            </button>
                          </div>
                        </div>

                        <div className="ff-68bb1ac4691898b1e0a8d6b1__success fd-form-success" data-ff-el="success">
                          <div className="ff-68bb1ac4691898b1e0a8d6b1__success-message">
                            <div>
                              <div>
                                <div data-paragraph="true">
                                  Thank you for joining our waitlist! We'll be in touch soon.
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="ff-68bb1ac4691898b1e0a8d6b1__error fd-form-error" data-ff-el="error"></div>
                      </form>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Benefits Section */}
              <div className="mt-16 grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Early Access</h3>
                  <p className="text-sm text-muted-foreground">
                    Be among the first to experience Daily One Accord when we launch
                  </p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Exclusive Updates</h3>
                  <p className="text-sm text-muted-foreground">
                    Get behind-the-scenes updates and sneak peeks of new features
                  </p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Special Pricing</h3>
                  <p className="text-sm text-muted-foreground">
                    Lock in exclusive launch pricing when you join the waitlist
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function(w, d, t, h, s, n) {
              w.FlodeskObject = n;
              var fn = function() {
                (w[n].q = w[n].q || []).push(arguments);
              };
              w[n] = w[n] || fn;
              var f = d.getElementsByTagName(t)[0];
              var v = '?v=' + Math.floor(new Date().getTime() / (120 * 1000)) * 60;
              var sm = d.createElement(t);
              sm.async = true;
              sm.type = 'module';
              sm.src = h + s + '.mjs' + v;
              f.parentNode.insertBefore(sm, f);
              var sn = d.createElement(t);
              sn.async = true;
              sn.noModule = true;
              sn.src = h + s + '.js' + v;
              f.parentNode.insertBefore(sn, f);
            })(window, document, 'script', 'https://assets.flodesk.com', '/universal', 'fd');
            
            window.fd('form:handle', {
              formId: '68bb1ac4691898b1e0a8d6b1',
              rootEl: '.ff-68bb1ac4691898b1e0a8d6b1',
            });
          `,
        }}
      />

      <style jsx global>{`
        .waitlist-form-container .ff-68bb1ac4691898b1e0a8d6b1 {
          background: transparent;
        }
        
        .waitlist-form-container .ff-68bb1ac4691898b1e0a8d6b1__container {
          background: transparent;
          max-width: 100%;
        }
        
        .waitlist-form-container .ff-68bb1ac4691898b1e0a8d6b1__form {
          padding: 0;
          font-family: inherit;
        }
        
        .waitlist-form-container .ff-68bb1ac4691898b1e0a8d6b1__content {
          margin: 0;
        }
        
        .waitlist-form-container .ff-68bb1ac4691898b1e0a8d6b1__fields {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          max-width: 100%;
          margin: 0;
        }
        
        .waitlist-form-container .ff-68bb1ac4691898b1e0a8d6b1__field {
          max-width: 100%;
          min-width: 0;
          margin: 0;
        }
        
        .waitlist-form-container .ff-68bb1ac4691898b1e0a8d6b1__control {
          height: 2.75rem;
          border-radius: 0.5rem;
          border: 1px solid hsl(var(--border));
          background: hsl(var(--background));
          color: hsl(var(--foreground));
          font-size: 0.875rem;
        }
        
        .waitlist-form-container .ff-68bb1ac4691898b1e0a8d6b1__control:focus {
          outline: none;
          border-color: hsl(var(--ring));
          box-shadow: 0 0 0 2px hsl(var(--ring) / 0.2);
        }
        
        .waitlist-form-container .ff-68bb1ac4691898b1e0a8d6b1__label {
          color: hsl(var(--muted-foreground));
          font-size: 0.875rem;
        }
        
        .waitlist-form-container .ff-68bb1ac4691898b1e0a8d6b1__footer {
          margin-top: 1.5rem;
          margin-left: 0;
          margin-right: 0;
        }
        
        .waitlist-form-container .ff-68bb1ac4691898b1e0a8d6b1__button {
          width: 100%;
          height: 2.75rem;
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          border: none;
          border-radius: 0.5rem;
          font-weight: 500;
          font-size: 0.875rem;
          transition: background-color 0.2s;
        }
        
        .waitlist-form-container .ff-68bb1ac4691898b1e0a8d6b1__button:hover {
          background: hsl(var(--primary) / 0.9);
        }
        
        .waitlist-form-container .ff-68bb1ac4691898b1e0a8d6b1__success-message {
          color: hsl(var(--foreground));
          font-family: inherit;
          font-size: 1rem;
          padding: 1rem;
          background: hsl(var(--muted));
          border-radius: 0.5rem;
        }
        
        .waitlist-form-container .fd-form-group.fd-has-error .fd-form-control {
          border-color: hsl(var(--destructive)) !important;
        }
        
        .waitlist-form-container .fd-form-group.fd-has-error .fd-form-feedback {
          color: hsl(var(--destructive)) !important;
        }
      `}</style>
    </>
  )
}
