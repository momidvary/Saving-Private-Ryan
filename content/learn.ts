// فهرست بخش‌های «یادگیری». برای بخش تازه، یه مورد اینجا و یه کامپوننت در components/learn اضافه کنید.
export const LEARN = [
  { slug: "food", title: "تغذیه", sub: "مادر در بارداری و شیردهی، و رایان تا ۲ سالگی", color: "grass", emoji: "🥗" },
  { slug: "care", title: "مراقبت از رایان", sub: "روزهای اول، حمام، قنداق، واکسن‌ها و رشد", color: "blue", emoji: "🍼" },
  { slug: "checklist", title: "چک‌لیست تولد", sub: "کارهای اداری، خواب ایمن و ساک بیمارستان", color: "sun", emoji: "🎒" },
  { slug: "nowruz", title: "نوروز با نوزاد", sub: "تولد نزدیک عید و قواعد دیدار", color: "grass", emoji: "🌱" },
  { slug: "parents", title: "مامان و بابا", sub: "علائم هشدار، حال روحی و رابطه‌ی شما", color: "coral", emoji: "💛" },
  { slug: "grow", title: "سالم و با اعتمادبه‌نفس", sub: "۹ اصل ساده برای رشد روانی", color: "sun", emoji: "🚀" },
] as const;

export type LearnSlug = (typeof LEARN)[number]["slug"];
