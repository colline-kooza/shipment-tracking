"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Menu,
  Users,
  MessageSquare,
  Mail,
  BarChart2,
  ListPlus,
  FileText,
  Code,
  Smartphone,
  UserCog,
  UserPlus,
  HelpCircle,
  LifeBuoy,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

import Logo from "../global/Logo";
import { Session } from "next-auth";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getInitials } from "@/lib/generateInitials";

const features = [
  {
    icon: MessageSquare,
    title: "SMS Messaging",
    description:
      "Send individual or bulk SMS messages to your contacts with reliable delivery.",
    href: "/features/sms-messaging",
  },
  {
    icon: Mail,
    title: "Email Campaigns",
    description:
      "Create and send professional email campaigns with tracking and analytics.",
    href: "/features/email-campaigns",
  },
  {
    icon: Users,
    title: "Contact Management",
    description:
      "Easily manage your contacts and organize them into custom groups for targeted messaging.",
    href: "/features/contact-management",
  },
  {
    icon: ListPlus,
    title: "Message Templates",
    description:
      "Save time with reusable templates for both SMS and email communications.",
    href: "/features/message-templates",
  },
  {
    icon: BarChart2,
    title: "Analytics & Reports",
    description:
      "Track delivery rates, engagement metrics, and campaign performance with detailed reports.",
    href: "/features/analytics",
  },
  {
    icon: Code,
    title: "API Integration",
    description:
      "Seamlessly integrate Wesendall with your existing systems using our developer-friendly API.",
    href: "/features/api-integration",
  },
];

export default function SiteHeader({ session }: { session: Session | null }) {
  const [open, setOpen] = React.useState(false);
  const [showFeatures, setShowFeatures] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Logo href="/" />
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/" legacyBehavior passHref>
                  <NavigationMenuLink className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                    Home
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Features</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[800px] p-4">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b">
                      <h4 className="text-lg font-medium">
                        Messaging Features
                      </h4>
                      <Link
                        href="/features"
                        className="text-sm text-blue-500 hover:underline"
                      >
                        View all
                      </Link>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      {features.map((feature, index) => (
                        <Link
                          key={index}
                          href={feature.href}
                          className="block group"
                        >
                          <div className="flex items-start gap-4">
                            <div className="p-2 bg-muted rounded-md group-hover:bg-muted/80">
                              <feature.icon className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                              <h5 className="font-medium mb-1 group-hover:text-blue-500">
                                {feature.title}
                              </h5>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {feature.description}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="mt-6 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium mb-1">
                            Ready to get started?
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Start sending SMS and emails with Wesendall today!
                          </p>
                        </div>
                        <Button
                          asChild
                          variant="default"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Link href="/register">Start for Free</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/pricing" legacyBehavior passHref>
                  <NavigationMenuLink className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                    Pricing
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[400px] p-4 md:w-[500px] lg:w-[600px]">
                    <div className="grid gap-3 md:grid-cols-2">
                      <Link href="/help-center" className="block group">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-muted rounded-md group-hover:bg-muted/80">
                            <HelpCircle className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <h5 className="font-medium mb-1 group-hover:text-blue-500">
                              Help Center
                            </h5>
                            <p className="text-sm text-muted-foreground">
                              Find answers to frequently asked questions
                            </p>
                          </div>
                        </div>
                      </Link>
                      <Link href="/api-docs" className="block group">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-muted rounded-md group-hover:bg-muted/80">
                            <Code className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <h5 className="font-medium mb-1 group-hover:text-blue-500">
                              API Documentation
                            </h5>
                            <p className="text-sm text-muted-foreground">
                              Integrate Wesendall with your systems
                            </p>
                          </div>
                        </div>
                      </Link>
                      <Link href="/blog" className="block group">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-muted rounded-md group-hover:bg-muted/80">
                            <FileText className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <h5 className="font-medium mb-1 group-hover:text-blue-500">
                              Blog
                            </h5>
                            <p className="text-sm text-muted-foreground">
                              Latest updates and communication tips
                            </p>
                          </div>
                        </div>
                      </Link>
                      <Link href="/support" className="block group">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-muted rounded-md group-hover:bg-muted/80">
                            <LifeBuoy className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <h5 className="font-medium mb-1 group-hover:text-blue-500">
                              Support
                            </h5>
                            <p className="text-sm text-muted-foreground">
                              Get help from our support team
                            </p>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/contact" legacyBehavior passHref>
                  <NavigationMenuLink className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                    Contact
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        {session ? (
          <div className="hidden md:block">
            <Button asChild variant={"ghost"}>
              <Link href="/dashboard">
                <Avatar>
                  <AvatarImage
                    src={session?.user?.image ?? ""}
                    alt={session?.user?.name ?? ""}
                  />
                  <AvatarFallback>
                    {getInitials(session?.user?.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="ml-3">Dashboard</span>
              </Link>
            </Button>
          </div>
        ) : (
          <div className="hidden md:flex items-center space-x-4">
            <Button asChild variant="ghost">
              <Link href={"/login"}>Log in</Link>
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        )}

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full p-0">
            <SheetHeader className="border-b p-4">
              <SheetTitle className="text-left">Wesendall Menu</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col py-4">
              <Link
                href="/"
                className="px-4 py-2 text-lg font-medium hover:bg-accent"
                onClick={() => setOpen(false)}
              >
                Home
              </Link>
              <button
                className="flex items-center justify-between px-4 py-2 text-lg font-medium hover:bg-accent text-left"
                onClick={() => setShowFeatures(!showFeatures)}
              >
                Features
                <ChevronDown
                  className={cn(
                    "h-5 w-5 transition-transform",
                    showFeatures && "rotate-180"
                  )}
                />
              </button>
              {showFeatures && (
                <div className="px-4 py-2 space-y-4">
                  {features.map((feature, index) => (
                    <Link
                      key={index}
                      href={feature.href}
                      className="flex items-start gap-4 py-2"
                      onClick={() => setOpen(false)}
                    >
                      <div className="p-2 bg-muted rounded-md">
                        <feature.icon className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <h5 className="font-medium mb-1">{feature.title}</h5>
                        <p className="text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              <Link
                href="/pricing"
                className="px-4 py-2 text-lg font-medium hover:bg-accent"
                onClick={() => setOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/help-center"
                className="px-4 py-2 text-lg font-medium hover:bg-accent"
                onClick={() => setOpen(false)}
              >
                Help Center
              </Link>
              <Link
                href="/contact"
                className="px-4 py-2 text-lg font-medium hover:bg-accent"
                onClick={() => setOpen(false)}
              >
                Contact
              </Link>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
              <div className="grid gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setOpen(false)}
                  asChild
                >
                  <Link href="/login">Log in</Link>
                </Button>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => setOpen(false)}
                  asChild
                >
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
