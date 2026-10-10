import "@/landing.css";
import { FeatureShowcase } from "@/components/feature-showcase";
import { ArrowRight, Dumbbell, Timer, CalendarDays, ChevronDown, Menu, X, Check } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useI18n } from "@/lib/i18n";
import { useLandingCopy } from "@/lib/landing-copy";
gsap.registerPlugin(ScrollTrigger);
const benefits = [
 { icon: Dumbbell, title: "Catat setiap sesi", text: "Simpan set, repetisi, dan beban setiap gerakan." },
 { icon: Timer, title: "Atur waktu istirahat", text: "Gunakan timer istirahat langsung di sesi latihanmu." },
 { icon: CalendarDays, title: "Pantau konsistensi", text: "Lihat riwayat sesi dan aktivitas latihan bulanan." },
];
const questions = [
 ["Apakah GymUp gratis?", "Ya. Kamu bisa menggunakan GymUp secara gratis dengan membuat akun."],
 ["Apakah perlu login?", "Ya. Buat akun dengan email, verifikasi email kamu, lalu login untuk mulai mencatat latihan."],
 ["Apa yang bisa dicatat?", "Set, repetisi, dan beban latihan. Sesi yang disimpan dapat dilihat kembali di riwayat latihan."],
 ["Bisa digunakan lewat HP?", "Bisa. Buka GymUp dari browser HP. Kamu juga bisa menambahkannya ke layar utama melalui menu browser."],
];
function StartLink() { const t = useLandingCopy(); return <Link className="landing-cta" to="/app">{t("Coba gratis")}</Link>; }
export function LandingPage() {
 const [menuOpen, setMenuOpen] = useState(false);
 const root = useRef<HTMLDivElement>(null);
 const menuButton = useRef<HTMLButtonElement>(null);
 const { language, setLanguage } = useI18n();
 const t = useLandingCopy();
 useEffect(() => {
  document.title = language === "en" ? "GymUp — Log workouts. See your progress." : "GymUp — Catat latihanmu. Lihat progresmu.";
  document.querySelector('meta[name="description"]')?.setAttribute("content", t("Simpan set, repetisi, dan beban setiap sesi. Cek kembali riwayat latihanmu kapan saja."));
 }, [language, t]);
 useEffect(() => {
  if (!menuOpen) return;
  const close = (event: KeyboardEvent) => { if (event.key === "Escape") { setMenuOpen(false); menuButton.current?.focus(); } };
  window.addEventListener("keydown", close);
  return () => window.removeEventListener("keydown", close);
 }, [menuOpen]);
 useLayoutEffect(() => {
  const media = gsap.matchMedia();
  media.add("(prefers-reduced-motion: no-preference)", () => {
   gsap.from(".landing-hero-copy > *", { y: 22, opacity: 0, duration: .75, stagger: .12, ease: "power3.out", clearProps: "all" });
   gsap.from(".hero-product", { y: 30, opacity: 0, duration: 1, delay: .15, ease: "power3.out", clearProps: "all" });
   gsap.utils.toArray<HTMLElement>(".feature-row, .landing-story, .landing-steps-section, .landing-faq, .landing-final").forEach(section => {
    gsap.from(section, { y: 26, opacity: 0, duration: .7, ease: "power2.out", clearProps: "all", scrollTrigger: { trigger: section, start: "top 90%", once: true } });
   });
  }, root);
  return () => media.revert();
 }, []);
 const LanguageSwitch = <div className="landing-language" role="group" aria-label={language === "en" ? "Language" : "Bahasa"}>{(["id", "en"] as const).map(value => <button type="button" key={value} aria-label={value === "id" ? "Bahasa Indonesia" : "English"} aria-pressed={language === value} onClick={() => setLanguage(value)}>{value.toUpperCase()}</button>)}</div>;
 return <div className="landing" ref={root}><a className="landing-skip" href="#konten">{t("Lewati ke konten")}</a>
 <header className="landing-header"><div className="landing-container landing-header-inner"><Link to="/" className="landing-brand" aria-label={t("GymUp beranda")}><img src="/pwa-icon.svg" alt="" width="36" height="36" /><strong>GYMUP</strong></Link><div className="landing-header-actions"><nav className="landing-desktop-nav" aria-label={t("Navigasi utama")}><a href="#fitur">{t("Fitur")}</a><a href="#cara-mulai">{t("Cara mulai")}</a><Link className="landing-login" to="/app">{t("Masuk")}</Link></nav>{LanguageSwitch}<button ref={menuButton} className="landing-menu" aria-label={t(menuOpen ? "Tutup menu" : "Buka menu")} aria-expanded={menuOpen} aria-controls="landing-mobile-nav" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button></div></div>{menuOpen && <nav id="landing-mobile-nav" className="landing-mobile-nav" aria-label={t("Navigasi mobile")}><a onClick={() => setMenuOpen(false)} href="#fitur">{t("Fitur")}</a><a onClick={() => setMenuOpen(false)} href="#cara-mulai">{t("Cara mulai")}</a><Link to="/app">{t("Masuk ke GymUp")} <ArrowRight size={18} /></Link></nav>}</header>
 <main id="konten"><section className="landing-hero landing-hero-reference landing-container"><div className="landing-hero-copy"><h1><span>{t("Catat latihanmu.").replace(/\.$/, "")}</span><em>{t("Lihat progresmu.").replace(/\.$/, "")}</em><span>{t("Tetap konsisten.").replace(/\.$/, "")}</span></h1><p className="landing-lead">{t("Simpan set, repetisi, dan beban setiap sesi. Cek kembali riwayat latihanmu kapan saja.")}</p><StartLink /></div><div className="hero-product hero-product-generated"><div className="hero-phone-shot"><img src={`/images/gymup-hero-${language}.webp`} width="1000" height="1000" fetchPriority="high" alt={language === "en" ? "GymUp mobile app home screen showing a workout recommendation and recent activity" : "Beranda aplikasi GymUp di HP dengan rekomendasi latihan dan aktivitas terbaru"} /></div></div></section>
 <section id="fitur" className="landing-benefits landing-band" aria-label={t("Fitur")}>{benefits.map(({ icon: Icon, title, text }) => <article key={title}><span className="landing-feature-icon"><Icon size={24} aria-hidden="true" /></span><div><h2>{t(title)}</h2><p>{t(text)}</p></div></article>)}</section>
 <FeatureShowcase />
 <section className="landing-story landing-band"><div><h2>{t("Latihan berikutnya")}<br />{t("nggak perlu mulai")}<br /><em>{t("dari ingatan.").replace(/\.$/, "")}</em></h2></div><div className="landing-story-copy"><p>{t("Berapa beban yang kamu pakai terakhir kali? Berapa repetisi yang selesai? Simpan detailnya, lalu cek kembali saat kamu membutuhkannya.")}</p><ul>{["Catatan set, repetisi, dan beban", "Riwayat sesi yang bisa dibuka kembali", "Kalender untuk melihat aktivitas bulanan"].map(text => <li key={text}><Check aria-hidden="true" />{t(text)}</li>)}</ul><p className="landing-note">{t("Progres di GymUp adalah catatan sesi dan konsistensi latihanmu.")}</p></div></section>
 <section id="cara-mulai" className="landing-steps-section"><div className="landing-container"><h2>{t("Siap untuk latihan berikutnya?")}</h2><div className="landing-steps">{[["01", "Buat akun", "Daftar dengan email, verifikasi akunmu, lalu login."],["02", "Pilih program", "Pilih program latihan dan atur gerakan sesuai kebutuhanmu."],["03", "Mulai latihan", "Catat setiap set, gunakan timer, lalu simpan sesimu."]].map(([number,title,text]) => <article key={number}><span>{number}</span><h3>{t(title)}</h3><p>{t(text)}</p></article>)}</div></div></section>
 <section className="landing-faq landing-band"><div><h2>{t("Ada pertanyaan?")}</h2></div><div>{questions.map(([question,answer]) => <details key={question}><summary>{t(question)}<ChevronDown size={20} aria-hidden="true" /></summary><p>{t(answer)}</p></details>)}</div></section>
 <section className="landing-final landing-container"><h2>{t("Mulai catat")}<br /><em>{t("sesi pertamamu.").replace(/\.$/, "")}</em></h2><StartLink /><p className="landing-helper">{t("Gratis. Buat akun atau login untuk mulai.")}</p></section></main>
 <footer className="landing-footer landing-band"><Link to="/" className="landing-brand"><img src="/pwa-icon.svg" alt="" width="30" height="30" /><strong>GYMUP</strong></Link><Link to="/app">{t("Masuk ke aplikasi")} <ArrowRight size={16} /></Link></footer></div>;
}
