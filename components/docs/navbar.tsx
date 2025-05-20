// import { ModeToggle } from "@/components/theme-toggle";
import {
  GithubIcon,
  TwitterIcon,
  CommandIcon,
  Command,
  Youtube,
} from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

import { SheetLeftbar } from "./leftbar";

import { SheetClose } from "@/components/ui/sheet";
import Anchor from "./anchor";

import Search from "./search";
import { page_routes } from "@/lib/routes-config";

export const NAVLINKS = [
  {
    title: "Templates",
    href: "/",
  },
  {
    title: "Documentations",
    href: `/docs${page_routes[0].href}`,
  },
  {
    title: "Blogs",
    href: "/blog",
  },
  {
    title: "Fullstack Roadmap",
    href: "/fullstack-roadmap",
  },
  {
    title: "Guides",
    href: "/guide",
  },
];

export function Navbar() {
  return (
    <nav className="w-full border-b h-16 sticky top-0 z-50 bg-background">
      <div className="sm:container mx-auto w-[95vw] h-full flex items-center justify-between md:gap-2">
        <div className="flex items-center gap-5">
          <SheetLeftbar />
          <div className="flex items-center gap-6">
            <div className="sm:flex hidden">
              <Logo />
            </div>
            <div className="lg:flex hidden items-center gap-4 text-sm font-medium text-muted-foreground">
              <NavMenu />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Search />
            <div className="flex ml-2.5 sm:ml-0">
              <Link
                href="https://github.com/MUKE-coder/"
                className={buttonVariants({ variant: "ghost", size: "icon" })}
              >
                <GithubIcon className="h-[1.1rem] w-[1.1rem]" />
              </Link>
              <Link
                href="https://www.youtube.com/@JBWEBDEVELOPER"
                className={buttonVariants({
                  variant: "ghost",
                  size: "icon",
                })}
              >
                <Youtube className="h-[1.1rem] w-[1.1rem]" />
              </Link>
              {/* <ModeToggle /> */}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <div className="bg-emerald-500 p-1.5 rounded flex items-center justify-center">
        <Command className="w-5 h-5 text-white" strokeWidth={3} />
      </div>
      <div className="">
        <h2 className="font-bold font-mono leading-none text-2xl">
          Code<span className="text-emerald-500">Mint</span>
        </h2>
        <p className="text-xs">Fullstack Templates</p>
      </div>
    </Link>
  );
}

export function NavMenu({ isSheet = false }) {
  return (
    <>
      {NAVLINKS.map((item) => {
        const Comp = (
          <Anchor
            key={item.title + item.href}
            activeClassName="!text-primary dark:font-medium font-semibold"
            absolute
            className="flex items-center gap-1 dark:text-stone-300/85 text-stone-800"
            href={item.href}
          >
            {item.title}
          </Anchor>
        );
        return isSheet ? (
          <SheetClose key={item.title + item.href} asChild>
            {Comp}
          </SheetClose>
        ) : (
          Comp
        );
      })}
    </>
  );
}
