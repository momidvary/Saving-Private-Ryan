"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CalendarDays, House, Mail, Medal, MessageCircleHeart } from "lucide-react";

const ITEMS = [
  { href: "/", label: "امروز", Icon: House },
  { href: "/weeks", label: "هفته‌ها", Icon: CalendarDays },
  { href: "/ask", label: "مشاور", Icon: MessageCircleHeart },
  { href: "/rayan", label: "رایان", Icon: Medal },
  { href: "/learn", label: "یادگیری", Icon: BookOpen },
  { href: "/letters", label: "نامه‌ها", Icon: Mail },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav className="tabbar" aria-label="بخش‌های اصلی">
      <ul>
        {ITEMS.map(({ href, label, Icon }) => {
          const on = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <li key={href}>
              <Link href={href} aria-current={on ? "page" : undefined}>
                <Icon size={24} strokeWidth={on ? 2.6 : 2} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
