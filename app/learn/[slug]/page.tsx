import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { LEARN, type LearnSlug } from "@/content/learn";
import { Title } from "@/components/ui";
import Food from "@/components/learn/Food";
import Care from "@/components/learn/Care";
import Checklist from "@/components/learn/Checklist";
import Nowruz from "@/components/learn/Nowruz";
import Parents from "@/components/learn/Parents";
import Grow from "@/components/learn/Grow";

const VIEWS: Record<LearnSlug, () => React.ReactNode> = {
  food: Food,
  care: Care,
  checklist: Checklist,
  nowruz: Nowruz,
  parents: Parents,
  grow: Grow,
};

export function generateStaticParams() {
  return LEARN.map((l) => ({ slug: l.slug }));
}

export default async function LearnPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = LEARN.find((l) => l.slug === slug);
  if (!item) notFound();
  const View = VIEWS[item.slug];
  return (
    <main className="page">
      <Link href="/learn" className="inline-flex items-center gap-1 text-sm font-bold text-blue">
        <ChevronRight size={16} /> یادگیری
      </Link>
      <Title>{item.title}</Title>
      <View />
    </main>
  );
}
