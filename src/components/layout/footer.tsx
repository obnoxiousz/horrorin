import Link from "next/link";
import { Ghost, Instagram, Twitter, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/40 bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Ghost className="w-7 h-7 text-primary" />
              <span className="text-xl font-bold">
                Horror<span className="text-primary">in</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Tempatnya komunitas cerita horror Indonesia. Bikin cerita kek pros pake template kece, tayangin ke ribuan pembaca. Tanpa perlu skill desain.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a href="#" className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm">Jelajah</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">Beranda</Link></li>
              <li><Link href="/trending" className="hover:text-primary transition-colors">Trending</Link></li>
              <li><Link href="/kategori" className="hover:text-primary transition-colors">Kategori</Link></li>
              <li><Link href="/kreator" className="hover:text-primary transition-colors">Kreator</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm">Horrorin</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/gabung" className="hover:text-primary transition-colors">Gabung</Link></li>
              <li><Link href="/masuk" className="hover:text-primary transition-colors">Masuk</Link></li>
              <li><Link href="/editor" className="hover:text-primary transition-colors">Mulai Cerita</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">Kebijakan Privasi</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Horrorin. Dibuat dengan 🩸 di Indonesia.</p>
          <p>Yang dibaca di sini, tinggal di sini. Jangan coba di rumah. 👻</p>
        </div>
      </div>
    </footer>
  );
}
