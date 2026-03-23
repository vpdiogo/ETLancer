"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Database,
  GitBranch,
  Home,
  Play,
  Plug,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Connections", href: "/connections", icon: Plug },
  { name: "Pipelines", href: "/pipelines", icon: GitBranch },
  { name: "Runs", href: "/runs", icon: Play },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900">
      <div className="flex h-16 items-center gap-2 px-6">
        <Database className="h-8 w-8 text-blue-400" />
        <span className="text-xl font-bold text-white">ETLancer</span>
      </div>
      <nav className="mt-4 flex-1 space-y-1 px-3">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-gray-800 px-3 py-3">
        <Link
          href="/docs"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            pathname === "/docs"
              ? "bg-gray-800 text-white"
              : "text-gray-400 hover:bg-gray-800 hover:text-white"
          }`}
        >
          <BookOpen className="h-5 w-5" />
          Documentation
        </Link>
      </div>
    </div>
  );
}
