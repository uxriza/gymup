const categoryLabels: Record<string, string> = {
  Chest: "Dada",
  Back: "Punggung",
  Legs: "Kaki",
  Shoulders: "Bahu",
  Arms: "Lengan",
  Core: "Inti",
  Custom: "Kustom",
};

const dayLabels: Record<string, string> = {
  Monday: "Senin",
  Tuesday: "Selasa",
  Wednesday: "Rabu",
  Thursday: "Kamis",
  Friday: "Jumat",
  Saturday: "Sabtu",
  Sunday: "Minggu",
  Flexible: "Fleksibel",
};

export function formatCategoryLabel(category: string) {
  return categoryLabels[category] ?? category;
}

export function formatDayLabel(day?: string) {
  if (!day) return "Fleksibel";
  return dayLabels[day] ?? day;
}
