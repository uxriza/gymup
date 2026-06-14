import type { Language } from "@/lib/i18n";

const categoryLabels: Record<Language, Record<string, string>> = {
  id: {
    Chest: "Dada",
    Back: "Punggung",
    Legs: "Kaki",
    Shoulders: "Bahu",
    Arms: "Lengan",
    Core: "Inti",
    Calves: "Betis",
    Warmup: "Pemanasan",
    Cooldown: "Pendinginan",
    Custom: "Kustom",
  },
  en: {
    Chest: "Chest",
    Back: "Back",
    Legs: "Legs",
    Shoulders: "Shoulders",
    Arms: "Arms",
    Core: "Core",
    Calves: "Calves",
    Warmup: "Warm-up",
    Cooldown: "Cooldown",
    Custom: "Custom",
  },
};

const dayLabels: Record<Language, Record<string, string>> = {
  id: {
    Monday: "Senin",
    Tuesday: "Selasa",
    Wednesday: "Rabu",
    Thursday: "Kamis",
    Friday: "Jumat",
    Saturday: "Sabtu",
    Sunday: "Minggu",
    Flexible: "Fleksibel",
  },
  en: {
    Monday: "Monday",
    Tuesday: "Tuesday",
    Wednesday: "Wednesday",
    Thursday: "Thursday",
    Friday: "Friday",
    Saturday: "Saturday",
    Sunday: "Sunday",
    Flexible: "Flexible",
  },
};

const weekdayShortLabels: Record<Language, string[]> = {
  id: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
};

export function formatCategoryLabel(category: string, language: Language = "id") {
  return categoryLabels[language][category] ?? category;
}

export function formatDayLabel(day: string | undefined, language: Language = "id") {
  if (!day) return dayLabels[language].Flexible;
  return dayLabels[language][day] ?? day;
}

export function getWeekdayShortLabels(language: Language = "id") {
  return weekdayShortLabels[language];
}
