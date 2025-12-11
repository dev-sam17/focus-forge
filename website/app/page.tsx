"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  BarChart3,
  Cloud,
  Download,
  Github,
  Users,
  Award,
  Timer,
  TrendingUp,
  Sparkles,
  Apple,
  Monitor,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Animated clock component
function AnimatedClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours() % 12;

  return (
    <div className="relative w-32 h-32 md:w-48 md:h-48">
      {/* Clock face */}
      <div className="absolute inset-0 rounded-full border-4 border-primary/30 bg-gradient-to-br from-card to-background shadow-2xl shadow-primary/20">
        {/* Hour markers */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-3 bg-primary/50 rounded-full"
            style={{
              top: "8%",
              left: "50%",
              transformOrigin: "50% 400%",
              transform: `translateX(-50%) rotate(${i * 30}deg)`,
            }}
          />
        ))}
        {/* Hour hand */}
        <motion.div
          className="absolute w-1.5 h-8 md:h-12 bg-foreground rounded-full origin-bottom"
          style={{
            bottom: "50%",
            left: "50%",
            marginLeft: "-3px",
          }}
          animate={{ rotate: hours * 30 + minutes * 0.5 }}
          transition={{ type: "spring", stiffness: 50 }}
        />
        {/* Minute hand */}
        <motion.div
          className="absolute w-1 h-12 md:h-16 bg-primary rounded-full origin-bottom"
          style={{
            bottom: "50%",
            left: "50%",
            marginLeft: "-2px",
          }}
          animate={{ rotate: minutes * 6 }}
          transition={{ type: "spring", stiffness: 50 }}
        />
        {/* Second hand */}
        <motion.div
          className="absolute w-0.5 h-14 md:h-20 bg-accent rounded-full origin-bottom"
          style={{
            bottom: "50%",
            left: "50%",
            marginLeft: "-1px",
          }}
          animate={{ rotate: seconds * 6 }}
          transition={{ type: "spring", stiffness: 100, damping: 10 }}
        />
        {/* Center dot */}
        <div className="absolute w-3 h-3 bg-accent rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-lg" />
      </div>
    </div>
  );
}

// Platform detection hook
function usePlatform() {
  const [platform, setPlatform] = useState<"windows" | "mac" | "linux">(
    "windows"
  );

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform?.toLowerCase() || "";

    if (
      userAgent.includes("iphone") ||
      userAgent.includes("ipad") ||
      platform.includes("mac")
    ) {
      setPlatform("mac");
    } else if (userAgent.includes("android") || platform.includes("win")) {
      setPlatform("windows");
    } else if (platform.includes("linux")) {
      setPlatform("linux");
    }
  }, []);

  return platform;
}

export default function Home() {
  const platform = usePlatform();
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Image
              src="/app-icon.png"
              alt="Focus Forge"
              width={28}
              height={28}
              className="rounded-md"
            />
            <span className="font-bold text-xl">Focus Forge</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="#features"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Features
            </Link>
            <Link
              href="#download"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Download
            </Link>
            <Link
              href="/changelog"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Changelog
            </Link>
            <Link
              href="https://github.com/dev-sam17/focus-forge"
              target="_blank"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              GitHub
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button asChild>
              <Link href="#download">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-chart-2/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <main className="flex-1">
        <section className="w-full py-6 md:py-12 lg:py-18 xl:py-24 relative">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              className="flex flex-col items-center space-y-4 text-center"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              <motion.div className="space-y-3" variants={fadeInUp}>
                <motion.div variants={fadeInUp}>
                  <Badge
                    className="mb-4 bg-gradient-to-r from-primary to-accent text-white border-0 px-4 py-1.5"
                    variant="secondary"
                  >
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    Lightweight & Fast
                  </Badge>
                </motion.div>
                <motion.h1
                  className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none"
                  variants={fadeInUp}
                >
                  Time Tracking & Productivity
                  <br />
                  <span className="bg-gradient-to-r from-primary via-chart-1 to-accent bg-clip-text text-transparent animate-gradient">
                    Made Simple
                  </span>
                </motion.h1>
                <motion.p
                  className="mx-auto max-w-[700px] text-muted-foreground md:text-xl leading-relaxed"
                  variants={fadeInUp}
                >
                  A lightweight desktop productivity application that helps you
                  track time and forge better focus habits. Built with Electron,
                  React, and Supabase.
                </motion.p>
              </motion.div>
              {/* Animated Clock */}
              <motion.div variants={fadeInUp} className="my-8">
                <AnimatedClock />
              </motion.div>

              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                variants={fadeInUp}
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-chart-1 hover:opacity-90 shadow-lg shadow-primary/50 transition-all hover:shadow-xl hover:shadow-primary/60"
                  asChild
                >
                  <Link href="#download">
                    {platform === "mac" ? (
                      <Apple className="mr-2 h-5 w-5" />
                    ) : platform === "linux" ? (
                      <Monitor className="mr-2 h-5 w-5" />
                    ) : (
                      <Download className="mr-2 h-5 w-5" />
                    )}
                    {platform === "mac"
                      ? "Download for macOS"
                      : platform === "linux"
                      ? "Download for Linux"
                      : "Download for Windows"}
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 hover:bg-accent/10 hover:border-accent transition-all"
                  asChild
                >
                  <Link
                    href="https://github.com/dev-sam17/focus-forge"
                    target="_blank"
                  >
                    <Github className="mr-2 h-5 w-5" />
                    View on GitHub
                  </Link>
                </Button>
              </motion.div>

              {/* Feature highlights */}
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 max-w-3xl"
                variants={fadeInUp}
              >
                <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card/50 backdrop-blur border">
                  <Timer className="h-8 w-8 text-primary" />
                  <p className="font-semibold">Smart Tracking</p>
                  <p className="text-sm text-muted-foreground text-center">
                    Automatic activity monitoring
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card/50 backdrop-blur border">
                  <TrendingUp className="h-8 w-8 text-accent" />
                  <p className="font-semibold">Insights</p>
                  <p className="text-sm text-muted-foreground text-center">
                    Beautiful analytics dashboard
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card/50 backdrop-blur border">
                  <Cloud className="h-8 w-8 text-chart-1" />
                  <p className="font-semibold">Cloud Sync</p>
                  <p className="text-sm text-muted-foreground text-center">
                    Secure cloud storage
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section
          id="features"
          className="w-full py-8 md:py-12 bg-gradient-to-b from-muted/50 to-background"
        >
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              className="text-center mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl mb-2">
                Powerful Features
              </h2>
              <p className="text-sm text-muted-foreground md:text-base max-w-2xl mx-auto">
                Everything you need to boost your productivity and track your
                time effectively
              </p>
            </motion.div>
            <motion.div
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp}>
                <Card className="border-2 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group">
                  <CardHeader className="p-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                      <Timer className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">
                      Automatic Time Tracking
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Track your time automatically with activity monitoring.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Card className="border-2 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10 transition-all duration-300 group">
                  <CardHeader className="p-4">
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors">
                      <Target className="h-5 w-5 text-accent" />
                    </div>
                    <CardTitle className="text-base">Focus Sessions</CardTitle>
                    <CardDescription className="text-sm">
                      Use Pomodoro technique and focus timers.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Card className="border-2 hover:border-chart-1/50 hover:shadow-lg hover:shadow-chart-1/10 transition-all duration-300 group">
                  <CardHeader className="p-4">
                    <div className="h-10 w-10 rounded-lg bg-chart-1/10 flex items-center justify-center mb-3 group-hover:bg-chart-1/20 transition-colors">
                      <BarChart3 className="h-5 w-5 text-chart-1" />
                    </div>
                    <CardTitle className="text-base">
                      Analytics & Insights
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Visualize your productivity with beautiful charts.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Card className="border-2 hover:border-chart-2/50 hover:shadow-lg hover:shadow-chart-2/10 transition-all duration-300 group">
                  <CardHeader className="p-4">
                    <div className="h-10 w-10 rounded-lg bg-chart-2/10 flex items-center justify-center mb-3 group-hover:bg-chart-2/20 transition-colors">
                      <Cloud className="h-5 w-5 text-chart-2" />
                    </div>
                    <CardTitle className="text-base">Cloud Sync</CardTitle>
                    <CardDescription className="text-sm">
                      Securely stored in the cloud via Supabase.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Card className="border-2 hover:border-chart-3/50 hover:shadow-lg hover:shadow-chart-3/10 transition-all duration-300 group">
                  <CardHeader className="p-4">
                    <div className="h-10 w-10 rounded-lg bg-chart-3/10 flex items-center justify-center mb-3 group-hover:bg-chart-3/20 transition-colors">
                      <Users className="h-5 w-5 text-chart-3" />
                    </div>
                    <CardTitle className="text-base">Cross-Platform</CardTitle>
                    <CardDescription className="text-sm">
                      Available for Windows, macOS, and Linux.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Card className="border-2 hover:border-chart-4/50 hover:shadow-lg hover:shadow-chart-4/10 transition-all duration-300 group">
                  <CardHeader className="p-4">
                    <div className="h-10 w-10 rounded-lg bg-chart-4/10 flex items-center justify-center mb-3 group-hover:bg-chart-4/20 transition-colors">
                      <Award className="h-5 w-5 text-chart-4" />
                    </div>
                    <CardTitle className="text-base">Open Source</CardTitle>
                    <CardDescription className="text-sm">
                      Fully open source and transparent.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section
          id="download"
          className="w-full py-12 md:py-24 lg:py-32 relative"
        >
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Download Focus Forge
              </h2>
              <p className="mt-4 text-muted-foreground md:text-lg">
                Choose your platform and start tracking your productivity today
              </p>
            </motion.div>
            <motion.div
              className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp}>
                <Card className="text-center h-full border-2 hover:border-primary hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <CardTitle className="text-2xl">Windows</CardTitle>
                    <CardDescription>Windows 10/11</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full bg-gradient-to-r from-primary to-chart-1 hover:opacity-90 shadow-lg"
                      asChild
                    >
                      <Link
                        href="https://github.com/dev-sam17/focus-forge/releases/latest"
                        target="_blank"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download .exe
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Card className="text-center h-full border-2 hover:border-accent hover:shadow-xl hover:shadow-accent/20 transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <CardTitle className="text-2xl">macOS</CardTitle>
                    <CardDescription>macOS 10.15+</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full bg-gradient-to-r from-accent to-chart-3 hover:opacity-90 shadow-lg"
                      asChild
                    >
                      <Link
                        href="https://github.com/dev-sam17/focus-forge/releases/latest"
                        target="_blank"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download .dmg
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Card className="text-center h-full border-2 hover:border-chart-2 hover:shadow-xl hover:shadow-chart-2/20 transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <CardTitle className="text-2xl">Linux</CardTitle>
                    <CardDescription>Ubuntu/Debian</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full bg-gradient-to-r from-chart-2 to-chart-5 hover:opacity-90 shadow-lg"
                      asChild
                    >
                      <Link
                        href="https://github.com/dev-sam17/focus-forge/releases/latest"
                        target="_blank"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download .AppImage
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-muted/50 to-background relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-chart-1/5" />
          <div className="container mx-auto px-4 md:px-6 relative">
            <motion.div
              className="flex flex-col items-center justify-center space-y-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="space-y-4">
                <motion.h2
                  className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Start Forging Better Focus Habits Today
                </motion.h2>
                <motion.p
                  className="mx-auto max-w-[700px] text-muted-foreground md:text-xl"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  Join developers and professionals who are improving their
                  productivity with Focus Forge
                </motion.p>
              </div>
              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary via-chart-1 to-accent hover:opacity-90 shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all text-lg px-8"
                  asChild
                >
                  <Link href="#download">
                    <Download className="mr-2 h-5 w-5" />
                    Get Started Free
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 hover:bg-accent/10 hover:border-accent text-lg px-8"
                  asChild
                >
                  <Link
                    href="https://github.com/dev-sam17/focus-forge"
                    target="_blank"
                  >
                    <Github className="mr-2 h-5 w-5" />
                    Star on GitHub
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container mx-auto flex flex-col gap-4 py-10 px-4 md:flex-row md:justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Image
              src="/app-icon.png"
              alt="Focus Forge"
              width={20}
              height={20}
              className="rounded-sm"
            />
            <span className="font-bold">Focus Forge</span>
          </Link>
          <div className="flex gap-4">
            <Link
              href="https://github.com/dev-sam17/focus-forge"
              target="_blank"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub
            </Link>
            <Link
              href="https://github.com/dev-sam17/focus-forge/issues"
              target="_blank"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Issues
            </Link>
            <Link
              href="/changelog"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Changelog
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 Focus Forge. Open Source under MIT License.
          </p>
        </div>
      </footer>
    </div>
  );
}
