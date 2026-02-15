// import { Facebook, Twitter, Linkedin, Mail } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Bottom Section - Copyright Only */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Daily One Accord. All rights reserved.
          </div>
          {/* <div className="flex items-center gap-4">
            <Link
              href="https://facebook.com/dailyoneaccord"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </Link>
            <Link
              href="https://twitter.com/dailyoneaccord"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </Link>
            <Link
              href="https://linkedin.com/company/dailyoneaccord"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </Link>
            <Link
              href="mailto:support@dailyoneaccord.com"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Email"
            >
              <Mail className="h-5 w-5" />
            </Link>
          </div> */}
        </div>
      </div>
    </footer>
  )
}
