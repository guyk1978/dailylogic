import { ArticleCard } from "@/components/content/article-card";
import { getAllArticleMeta } from "@/lib/content/loader";

export const metadata = {
  title: "Blog",
  description:
    "Practical articles on budgeting, cooking, shopping, and everyday decisions.",
};

export default function BlogIndexPage() {
  const articles = getAllArticleMeta();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:py-14">
      <header className="mb-12 max-w-2xl">
        <p className="label-caption mb-3 text-blue-500">DailyLogic Blog</p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Ideas for smarter everyday decisions
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-slate-600">
          Short, actionable guides — with links to the free tools that help you
          put them into practice.
        </p>
      </header>

      {articles.length === 0 ? (
        <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-slate-100">
          <p className="text-lg font-medium text-slate-700">No articles yet</p>
          <p className="mt-2 text-sm text-slate-500">Check back soon.</p>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <li key={article.slug}>
              <ArticleCard article={article} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
