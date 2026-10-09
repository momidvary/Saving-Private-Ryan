"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { useApp } from "@/lib/store";
import { d2j, fa, jText } from "@/lib/jalali";
import { NOWRUZ_LIST } from "@/content/lists";
import { H2, Phone, Tick } from "@/components/ui";

const RULES = [
  ["دست‌ها قبل از بغل کردن شسته بشه", "یه ژل ضدعفونی کنار در بذارید تا یادآوری خودش کار رو انجام بده."],
  ["صورت و دست بچه رو نبوسید", "سرماخوردگی و ویروس تبخال از همین راه به نوزاد می‌رسه و برای اون می‌تونه خطرناک باشه."],
  ["مریض‌ها این بار با تماس تصویری", "هر کس سرماخوردگی، سرفه یا تب داره، تبریک رو تلفنی یا تصویری بگه."],
  ["دیدارها کوتاه و کم", "شما به دید و بازدید نرید. بزرگ‌ترها بیان یا بذارید برای چند هفته بعد."],
  ["دود نزدیک بچه نه", "دود سیگار، قلیون و حتی اسپند ریه‌های نوزاد رو آزار می‌ده. اگه رسم اسپند دارید، دور از بچه و در فضای باز."],
  ["بچه دست‌به‌دست نشه", "یکی دو نفر بغلش کنن کافیه. بقیه از نزدیک ببینن و لذت ببرن."],
  ["میزبانی با بابا، نه با مامان", "مادر هنوز در حال بهبوده. پذیرایی و کارهای مهمونی با پدر و بقیه‌ی خانواده‌ست."],
];
const LATE = [
  ["پزشک در تعطیلات", "از همین حالا بپرسید پزشک یا ماما در روزهای عید در دسترسه یا جانشینش کیه."],
  ["بیمارستان و مسیر", "بیمارستان در تعطیلات پذیرش داره، ولی ترافیک و خلوتی شهر فرق می‌کنه. مسیر رو دوباره بسنجید."],
  ["سفر نوروزی امسال نه", "در هفته‌های آخر بارداری از شهر و بیمارستان خودتون دور نشید."],
  ["مهمونی کمتر", "مادر در هفته‌ی ۳۹ خسته‌ست. امسال میزبانی بزرگ نداشته باشید."],
  ["چهارشنبه‌سوری", "دور از ترقه و شلوغی؛ نه برای مادر در هفته‌های آخر امنه، نه برای نوزاد."],
  ["سیزده‌به‌در", "نوزاد چندروزه رو به پارک و شلوغی نبرید. امسال در خونه یا حیاط."],
];
const RULES_TEXT =
  "• اگه سرماخوردگی، سرفه یا تب دارید، این بار با تماس تصویری تبریک بگید.\n• قبل از بغل کردن بچه دست‌ها رو بشوریم.\n• لطفاً صورت و دست بچه رو نبوسید.\n• نزدیک بچه سیگار، قلیون و اسپند نداشته باشیم.\n• دیدارها رو کوتاه نگه داریم تا مادر هم استراحت کنه.";
const MSG_AFTER = `سلام عزیزان، عیدتون پیشاپیش مبارک.\n\nامسال نوروز رو با رایان کوچولومون می‌گذرونیم که فقط چند هفته‌شه و خیلی دوست داریم شما رو ببینیم. بدن نوزاد در این هفته‌ها هنوز در برابر بیماری‌ها ضعیفه و پزشک‌ها چند کار ساده رو برای محافظت ازش توصیه می‌کنن:\n\n${RULES_TEXT}\n\nممنون که هوای ما رو دارید. دوستتون داریم.`;
const MSG_BEFORE = `سلام عزیزان، عیدتون پیشاپیش مبارک.\n\nامسال نوروز منتظر به دنیا اومدن رایان هستیم و ممکنه درست در روزهای عید به دنیا بیاد. برای همین امسال به دید و بازدید و سفر نمیایم. ممنون که درک می‌کنید.\n\nبعد از تولد هم خیلی دوست داریم رایان رو ببینید. بدن نوزاد در هفته‌های اول در برابر بیماری‌ها ضعیفه و پزشک‌ها چند کار ساده رو توصیه می‌کنن:\n\n${RULES_TEXT}\n\nممنون که هوای ما رو دارید. دوستتون داریم.`;

export default function Nowruz() {
  const { info, data, toggleCheck } = useApp();
  const age = info.nowruz - info.due;
  const late = age >= 0 ? age < 21 : -age <= 45;
  const [msg, setMsg] = useState(age >= 0 ? MSG_AFTER : MSG_BEFORE);
  const [note, setNote] = useState("");

  let title: string;
  let text: string;
  if (age >= 0) {
    const wk = Math.floor(age / 7);
    title = wk < 1 ? "رایان در نوروز فقط چند روزه‌ست" : `رایان در نوروز حدود ${fa(wk)} هفته‌ست`;
    text = `اگه زایمان در همون تاریخ موعد باشه، اول فروردین ${fa(info.nowruzYear)} رایان حدود ${fa(age)} روزه‌ست.`;
  } else {
    title = `تحویل سال در هفته‌ی ${fa(Math.floor((280 + age) / 7))} بارداریه`;
    text = `موعد زایمان ${jText(d2j(info.due))}، یعنی ${fa(-age)} روز بعد از تحویل سال. ممکنه رایان درست در تعطیلات عید به دنیا بیاد و دیدارهای فروردین و سیزده‌به‌در با یه نوزاد چندروزه بگذره.`;
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(msg);
      setNote("کپی شد. حالا در پیام‌رسان بچسبون.");
    } catch {
      setNote("کپی نشد؛ متن رو انتخاب کن و دستی کپی کن.");
    }
  };

  return (
    <>
      <section className="card card-grass flex flex-col gap-1">
        <p className="eyebrow" style={{ color: "var(--grass-deep)" }}>
          نوروز {fa(info.nowruzYear)}
        </p>
        <h2 className="display text-2xl">{title}</h2>
        <p>{text}</p>
      </section>
      {late ? (
        <>
          <H2>اگه رایان در تعطیلات عید به دنیا بیاد</H2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {LATE.map(([t, d]) => (
              <div key={t} className="card flex flex-col gap-1">
                <b>{t}</b>
                <span className="text-sm text-muted">{d}</span>
              </div>
            ))}
          </div>
        </>
      ) : null}
      <section className="card card-danger flex flex-col gap-1" role="note">
        <h3 className="font-bold" style={{ color: "var(--danger)" }}>
          تب در نوزاد زیر ۳ ماه یعنی مراجعه‌ی فوری
        </h3>
        <p>
          اگه دمای بچه ۳۸ درجه یا بیشتر بود، یا بی‌حال شد، شیر نخورد، تند یا سخت نفس کشید یا لب‌هاش کبود شد، همون موقع به پزشک یا اورژانس مراجعه کنید؛ حتی نیمه‌شب و وسط تعطیلات. اورژانس: <Phone n="۱۱۵" />
        </p>
      </section>
      <H2>قواعد دیدار با نوزاد</H2>
      <p>نوزاد تا ۲ ماهگی فقط واکسن‌های بدو تولد رو زده و بدنش هنوز در برابر میکروب‌ها ضعیفه. اسفند و فروردین هم هنوز فصل سرماخوردگی و آنفلوانزاست.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {RULES.map(([t, d]) => (
          <div key={t} className="card flex flex-col gap-1">
            <b>{t}</b>
            <span className="text-sm text-muted">{d}</span>
          </div>
        ))}
      </div>
      <H2>پیام آماده برای خانواده</H2>
      <p className="text-muted">گفتن این قواعد در لحظه‌ی دیدار سخته. از قبل با یه پیام محبت‌آمیز بفرستید. متن رو هر طور دوست دارید عوض کنید.</p>
      <textarea className="field min-h-72 leading-8" value={msg} onChange={(e) => setMsg(e.target.value)} aria-label="متن پیام به خانواده" />
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn" onClick={copy}>
          <Copy size={18} /> کپی متن
        </button>
        <span className="text-sm text-muted" role="status">
          {note}
        </span>
      </div>
      <H2>کارهای قبل از عید</H2>
      <section className="card">
        {NOWRUZ_LIST.map((it) => (
          <Tick key={it.id} checked={!!data.checks[it.id]} onChange={(on) => toggleCheck(it.id, on)}>
            {it.text}
          </Tick>
        ))}
      </section>
    </>
  );
}
