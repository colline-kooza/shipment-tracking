import React from "react";
import { Card } from "@/components/ui/card";
import { Users, FolderTree, BookOpen, FileText } from "lucide-react";
import Link from "next/link";

interface AnalyticCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  href: string;
  bgColor: string;
  textColor: string;
}

const AnalyticCard = ({
  title,
  count,
  icon,
  href,
  bgColor,
  textColor,
}: AnalyticCardProps) => (
  <Card className="h-full">
    <div className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span
            className={`inline-flex p-2 rounded-lg ${bgColor} ${textColor}`}
          >
            {icon}
          </span>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {count.toLocaleString()}
          </h3>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
        <Link
          href={href}
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          View Details
          <span className="ml-1">→</span>
        </Link>
      </div>
    </div>
  </Card>
);

interface AnalyticsDashboardProps {
  stats: {
    users: number;
    categories: number;
    blogCategories: number;
    blogs: number;
  };
}

const AnalyticsDashboard = ({ stats }: AnalyticsDashboardProps) => {
  const cards = [
    {
      title: "Total Users",
      count: stats.users,
      icon: <Users className="w-5 h-5" />,
      href: "/dashboard/users",
      bgColor: "bg-blue-100 dark:bg-blue-900/50",
      textColor: "text-blue-700 dark:text-blue-300",
    },
    {
      title: "Categories",
      count: stats.categories,
      icon: <FolderTree className="w-5 h-5" />,
      href: "/dashboard/categories",
      bgColor: "bg-purple-100 dark:bg-purple-900/50",
      textColor: "text-purple-700 dark:text-purple-300",
    },
    {
      title: "Blog Categories",
      count: stats.blogCategories,
      icon: <BookOpen className="w-5 h-5" />,
      href: "/dashboard/blog-categories",
      bgColor: "bg-amber-100 dark:bg-amber-900/50",
      textColor: "text-amber-700 dark:text-amber-300",
    },
    {
      title: "Total Blogs",
      count: stats.blogs,
      icon: <FileText className="w-5 h-5" />,
      href: "/dashboard/blogs",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/50",
      textColor: "text-emerald-700 dark:text-emerald-300",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <AnalyticCard key={index} {...card} />
      ))}
    </div>
  );
};

export default AnalyticsDashboard;
