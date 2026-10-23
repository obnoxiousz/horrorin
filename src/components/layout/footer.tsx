import Link from "next/link";
import { Ghost, Instagram, Twitter, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/40 bg-card/30 backdrop-blur-sm bg-primary">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Ghost className="w-7 h-7 text-primary-foreground" />
              <span className="text-xl font-bold">
                Horror<span className="text-primary-foreground">in</span>
              </span>
            </Link>
            <p className="text-sm text-background max-w-sm leading-relaxed">
              Komunitas untuk menulis, membaca, dan berbagi cerita horor Indonesia. Gunakan template yang tersedia untuk menyusun cerita tanpa perlu keahlian desain.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a href="#" className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-secondary/20 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-secondary/20 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-secondary/20 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm">Jelajah</h4>
            <ul className="space-y-2 text-sm text-background">
              <li><Link href="/" className="hover:text-primary-foreground transition-colors">Beranda</Link></li>
              <li><Link href="/trending" className="hover:text-primary-foreground transition-colors">Trending</Link></li>
              <li><Link href="/kategori" className="hover:text-primary-foreground transition-colors">Kategori</Link></li>
              <li><Link href="/kreator" className="hover:text-primary-foreground transition-colors">Kreator</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm">Horrorin</h4>
            <ul className="space-y-2 text-sm text-background">
              <li><Link href="/gabung" className="hover:text-primary-foreground transition-colors">Gabung</Link></li>
              <li><Link href="/masuk" className="hover:text-primary-foreground transition-colors">Masuk</Link></li>
              <li><Link href="/editor" className="hover:text-primary-foreground transition-colors">Mulai Cerita</Link></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Kebijakan Privasi</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-background">
          <p>© {new Date().getFullYear()} Horrorin.</p>
          <p>Cerita horor cukup dibaca di sini. Jangan dibawa pulang.</p>
        </div>
      </div>
    </footer>
  );
}
