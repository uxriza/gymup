import { useLandingCopy } from "@/lib/landing-copy";
import { WorkoutFeaturePreview } from "@/components/workout-feature-preview";
import { ProgramFeatureCard, GuideFeatureCard, HistoryFeatureCard, InstallFeatureCard } from "@/components/product-feature-cards";

const featureOrder = [1, 0, 2, 3, 4, 5] as const;

const features: { title: string; text: string; points: string[] }[] = [
  { title: "Pilih latihan yang cocok untukmu.", text: "Mulai dari rekomendasi di beranda, pilih program yang tersedia, atau buat sesi custom sesuai kebutuhanmu.", points: ["Rekomendasi latihan di beranda", "Pilihan program dan sesi custom"]},
  { title: "Catat setiap set dengan mudah.", text: "Lihat daftar gerakan, atur beban dan repetisi, lalu simpan sesi beserta catatan latihanmu.", points: ["Catat beban dan repetisi per set", "Simpan sesi dengan catatan tambahan"]},
  { title: "Istirahat tanpa kehilangan ritme.", text: "Ikuti hitungan waktu di antara set. Saat siap, lanjutkan ke set berikutnya dari layar yang sama.", points: ["Timer istirahat yang terlihat jelas", "Lanjutkan ke set berikutnya"]},
  { title: "Cek panduan saat dibutuhkan.", text: "Buka contoh gerakan, perlengkapan yang digunakan, dan langkah instruksi langsung dari GymUp.", points: ["Contoh visual gerakan", "Instruksi langkah demi langkah"]},
  { title: "Lihat kembali latihanmu.", text: "Buka detail sesi yang tersimpan dan lihat aktivitas bulanan untuk memantau konsistensi latihanmu.", points: ["Riwayat set, repetisi, dan beban", "Kalender aktivitas latihan bulanan"]},
  { title: "Buka dari layar utama HP.", text: "Tidak perlu instal aplikasi. Langsung buka GymUp lewat browser HP, lalu tambahkan shortcut ke layar utama jika ingin akses lebih cepat.", points: ["Langsung buka di browser HP, tanpa instal", "Shortcut ke GymUp di layar utama"]},
];

export function FeatureShowcase() {
  const t = useLandingCopy();
 const illustrations = [<ProgramFeatureCard />, <WorkoutFeaturePreview compact />, <WorkoutFeaturePreview rest />, <GuideFeatureCard />, <HistoryFeatureCard />, <InstallFeatureCard />];
 return <section className="feature-showcase" aria-label={t("Fitur")}>
 {featureOrder.map((index, position) => { const feature = features[index]; return <article className={`feature-row landing-band ${index === 1 ? "feature-row-primary" : "feature-row-supporting"} ${position % 2 ? "feature-row-reverse" : ""}`} key={feature.title}><div className="feature-copy"><h3>{t(feature.title).replace(/\.$/, "")}</h3><p>{t(feature.text)}</p><ul>{feature.points.map(point=><li key={point}>{t(point)}</li>)}</ul></div><div className="feature-gallery feature-gallery-single"><div className="feature-static-illustration" ref={node => { if (node) node.inert = true; }}>{illustrations[index]}</div></div></article>; })}
 </section>;
}
