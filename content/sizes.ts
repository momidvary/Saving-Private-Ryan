// اندازه‌ی تقریبی رایان در هر هفته. تا هفته‌ی ۱۹ طول از سر تا باسن، از هفته‌ی ۲۰ از سر تا پا اندازه‌گیری می‌شه.
// اعداد میانگین‌های رایج هستن و هر بچه با سرعت خودش رشد می‌کنه.

export type Size = { fruit: string; emoji: string; cm: number; g: number };

export const SIZES: Record<number, Size> = {
  14: { fruit: "یه لیمو", emoji: "🍋", cm: 8.7, g: 43 },
  15: { fruit: "یه سیب", emoji: "🍎", cm: 10.1, g: 70 },
  16: { fruit: "یه آووکادو", emoji: "🥑", cm: 11.6, g: 100 },
  17: { fruit: "یه گلابی", emoji: "🍐", cm: 13, g: 140 },
  18: { fruit: "یه فلفل دلمه‌ای", emoji: "🫑", cm: 14.2, g: 190 },
  19: { fruit: "یه انبه", emoji: "🥭", cm: 15.3, g: 240 },
  20: { fruit: "یه موز", emoji: "🍌", cm: 25.6, g: 300 },
  21: { fruit: "یه هویج بزرگ", emoji: "🥕", cm: 26.7, g: 360 },
  22: { fruit: "یه بلال", emoji: "🌽", cm: 27.8, g: 430 },
  23: { fruit: "یه گریپ‌فروت", emoji: "🍊", cm: 28.9, g: 500 },
  24: { fruit: "یه طالبی کوچیک", emoji: "🍈", cm: 30, g: 600 },
  25: { fruit: "یه گل‌کلم", emoji: "🥦", cm: 34.6, g: 660 },
  26: { fruit: "یه کاهو", emoji: "🥬", cm: 35.6, g: 760 },
  27: { fruit: "یه کلم", emoji: "🥬", cm: 36.6, g: 875 },
  28: { fruit: "یه بادمجون", emoji: "🍆", cm: 37.6, g: 1000 },
  29: { fruit: "یه کدو حلوایی کوچیک", emoji: "🎃", cm: 38.6, g: 1150 },
  30: { fruit: "یه خیار بزرگ", emoji: "🥒", cm: 39.9, g: 1300 },
  31: { fruit: "یه نارگیل", emoji: "🥥", cm: 41.1, g: 1500 },
  32: { fruit: "یه آناناس کوچیک", emoji: "🍍", cm: 42.4, g: 1700 },
  33: { fruit: "یه آناناس", emoji: "🍍", cm: 43.7, g: 1900 },
  34: { fruit: "یه طالبی", emoji: "🍈", cm: 45, g: 2100 },
  35: { fruit: "یه خربزه", emoji: "🍈", cm: 46.2, g: 2400 },
  36: { fruit: "یه کاهوی بزرگ", emoji: "🥬", cm: 47.4, g: 2600 },
  37: { fruit: "یه کلم بزرگ", emoji: "🥬", cm: 48.6, g: 2900 },
  38: { fruit: "یه کدو حلوایی", emoji: "🎃", cm: 49.8, g: 3100 },
  39: { fruit: "یه هندونه‌ی کوچیک", emoji: "🍉", cm: 50.7, g: 3300 },
  40: { fruit: "یه هندونه", emoji: "🍉", cm: 51.2, g: 3500 },
};

export function sizeFor(week: number): Size | null {
  if (week < 14) return null;
  return SIZES[Math.min(week, 40)] ?? null;
}

export function weightText(g: number) {
  return g >= 1000 ? `${(g / 1000).toLocaleString("fa-IR", { maximumFractionDigits: 1 })} کیلو` : `${g.toLocaleString("fa-IR")} گرم`;
}
