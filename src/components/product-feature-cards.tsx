import { useLandingCopy } from "@/lib/landing-copy";
import { useI18n } from "@/lib/i18n";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Share, PlusSquare, Play } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { defaultExercises, defaultWorkouts } from "@/data";

export function ProgramFeatureCard() {
  const t = useLandingCopy();
  const [selected, setSelected] = useState(0);
  const programs = defaultWorkouts.slice(0, 2);
  return <Card className="product-feature-card"><CardHeader><CardTitle>{t("Pilih program")}</CardTitle><CardDescription>{t("Mulai dari program yang tersedia")}</CardDescription></CardHeader><CardContent className="space-y-5"><div className="grid gap-2" role="group" aria-label="Pilihan program contoh">{programs.map((item, index) => <Button key={item.id} variant={selected === index ? "secondary" : "outline"} aria-pressed={selected === index} className="min-h-12 justify-between" onClick={() => setSelected(index)}>{t(item.name)}<span className="text-xs text-muted-foreground">{item.exerciseIds.length} {t("gerakan")}</span></Button>)}</div><Button asChild className="w-full min-h-12"><Link to="/app">{t("Mulai latihan")} <ArrowRight size={16} /></Link></Button></CardContent></Card>;
}
export function GuideFeatureCard() {
  const t = useLandingCopy();
  const exercise = defaultExercises.find(item => item.id === "bench-press")!;
  return <Card className="product-feature-card guide-feature-card"><CardHeader><CardTitle>{exercise.name}</CardTitle><CardDescription>{exercise.targetSets} set × {exercise.targetReps} {t("repetisi")} · {t("Dada")}</CardDescription></CardHeader><CardContent className="space-y-3"><div className="guide-video-still"><img src="/images/bench-press-poster.webp" width="640" height="360" alt={t("Gerakan Bench Press")} className="aspect-video w-full rounded-md bg-black object-cover" loading="lazy" decoding="async" /><span className="guide-play-icon" aria-hidden="true"><Play size={22} fill="currentColor" /></span></div><div className="flex flex-wrap gap-2">{exercise.equipment?.map(item => <Badge variant="secondary" key={item}>{t(item)}</Badge>)}</div><h4 className="font-semibold">{t("Instruksi")}</h4><ol className="space-y-3">{exercise.instructions?.slice(0, 2).map((step,index) => <li key={step} className="flex gap-3 text-sm leading-relaxed text-muted-foreground"><span className="text-primary">{index + 1}</span>{t(step)}</li>)}</ol></CardContent></Card>;
}
export function HistoryFeatureCard() {
  const { language } = useI18n();
  const t = useLandingCopy();
  const [month, setMonth] = useState(9);
  const days = new Date(2026,month+1,0).getDate();
  const offset = (new Date(2026,month,1).getDay()+6)%7;
  const title = new Date(2026,month,1).toLocaleDateString(language === "en" ? "en-US" : "id-ID",{month:"long",year:"numeric"});
  return <Card className="product-feature-card history-feature-card"><CardHeader><CardTitle>{t("Aktivitas bulanan")}</CardTitle></CardHeader><CardContent className="space-y-5"><div className="flex items-center justify-between"><Button variant="ghost" size="icon" aria-label="Bulan sebelumnya" disabled={month===0} onClick={() => setMonth(v=>v-1)}><ChevronLeft /></Button><p className="text-sm capitalize">{title}</p><Button variant="ghost" size="icon" aria-label="Bulan berikutnya" disabled={month===9} onClick={() => setMonth(v=>v+1)}><ChevronRight /></Button></div><div className="grid grid-cols-7 gap-2">{(language === "en" ? ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] : ["Sen","Sel","Rab","Kam","Jum","Sab","Min"]).map(day=><span className="text-center text-[10px] text-muted-foreground" key={day}>{day}</span>)}{Array.from({length:offset},(_,i)=><span key={`empty-${i}`} />)}{Array.from({length:days},(_,i)=>{const day=i+1;const active=[2,5,7,9].includes(day);return <span key={day} className={`flex aspect-square items-center justify-center rounded text-xs ${active ? "bg-primary/70 text-primary-foreground" : "bg-secondary text-muted-foreground"}`} aria-label={`${day} ${title}${active ? ", latihan tercatat" : ""}`}>{day}</span>;})}</div></CardContent></Card>;
}
export function InstallFeatureCard() {
  const t = useLandingCopy();
  return <Card className="product-feature-card"><CardHeader><div className="flex items-center gap-4"><img src="/pwa-icon.svg" alt="Ikon GymUp" width={64} height={64} /><div><CardTitle>GymUp</CardTitle><CardDescription>{t("Tambah ke layar utama")}</CardDescription></div></div></CardHeader><CardContent className="space-y-5"><p className="text-sm leading-relaxed text-muted-foreground">{t("Gunakan GymUp langsung di browser HP tanpa instal aplikasi. Shortcut ke layar utama bersifat opsional.")}</p><ol className="space-y-4 text-sm"><li className="flex items-start gap-3"><Share className="shrink-0 text-primary" size={20} /><span>{t("Di Safari iPhone, buka menu Bagikan.")}</span></li><li className="flex items-start gap-3"><PlusSquare className="shrink-0 text-primary" size={20} /><span>{t("Pilih “Tambah ke Layar Utama”. Di Android, cari “Instal aplikasi” atau “Tambahkan ke layar utama” di menu browser.")}</span></li></ol><Button asChild className="w-full min-h-12"><Link to="/app">{t("Buka GymUp")}</Link></Button></CardContent></Card>;
}
