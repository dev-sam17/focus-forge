"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Tag, Calendar, ExternalLink, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { remark } from "remark";
import html from "remark-html";

interface ChangelogVersion {
  version: string;
  date: string;
  content: string;
}

const fadeInUp = {
  opacity: 1,
  y: 0,
  transition: { duration: 0.5 },
};

const staggerContainer = {
  transition: {
    staggerChildren: 0.1,
  },
};

export default function ChangelogPage() {
  const [versions, setVersions] = useState<ChangelogVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChangelog() {
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/dev-sam17/focus-forge/refs/heads/master/CHANGELOG.md"
        );
        console.log("Fetch response:", response.status, response.ok);
        if (!response.ok) {
          throw new Error("Failed to fetch changelog");
        }
        const text = await response.text();
        console.log("Fetched text length:", text.length);
        console.log("First 200 chars:", text.substring(0, 200));
        const parsed = await parseChangelog(text);
        console.log("Parsed versions:", parsed.length);
        console.log("Versions data:", parsed);
        setVersions(parsed);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load changelog"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchChangelog();
  }, []);

  async function parseChangelog(text: string): Promise<ChangelogVersion[]> {
    const lines = text.split("\n");
    const versions: ChangelogVersion[] = [];
    let currentVersion: {
      version: string;
      date: string;
      lines: string[];
    } | null = null;

    console.log("Total lines to parse:", lines.length);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Match version header: ## [1.3.0] - 2024-12-11
      const versionMatch = line.match(/^##\s+\[([\d.]+)\]\s+-\s+(.+)$/);
      if (versionMatch) {
        console.log("Found version:", versionMatch[1], versionMatch[2]);
        // Process previous version
        if (currentVersion) {
          const versionMarkdown = currentVersion.lines.join("\n");
          console.log(
            "Processing version",
            currentVersion.version,
            "with",
            currentVersion.lines.length,
            "lines"
          );
          const processedContent = await remark()
            .use(html, { sanitize: false })
            .process(versionMarkdown);

          // Add semicolon to h3 elements and line breaks between them
          let htmlContent = String(processedContent);
          htmlContent = htmlContent.replace(
            /<h3>/g,
            '<h3 class="mt-6 first:mt-0">'
          );
          htmlContent = htmlContent.replace(/<\/h3>/g, ":</h3>");

          versions.push({
            version: currentVersion.version,
            date: currentVersion.date,
            content: htmlContent,
          });
        }

        // Start new version
        currentVersion = {
          version: versionMatch[1],
          date: versionMatch[2],
          lines: [],
        };
        continue;
      }

      // Add lines to current version (skip until first version is found)
      if (currentVersion && line.trim() !== "---") {
        currentVersion.lines.push(line);
      }
    }

    // Process last version
    if (currentVersion) {
      console.log("Processing last version", currentVersion.version);
      const versionMarkdown = currentVersion.lines.join("\n");
      const processedContent = await remark()
        .use(html, { sanitize: false })
        .process(versionMarkdown);

      // Add semicolon to h3 elements and line breaks between them
      let htmlContent = String(processedContent);
      htmlContent = htmlContent.replace(
        /<h3>/g,
        '<h3 class="mt-6 first:mt-0">'
      );
      htmlContent = htmlContent.replace(/<\/h3>/g, ":</h3>");

      versions.push({
        version: currentVersion.version,
        date: currentVersion.date,
        content: htmlContent,
      });
    }

    console.log("Total versions parsed:", versions.length);
    return versions;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
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
              href="/#features"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Features
            </Link>
            <Link
              href="/#download"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Download
            </Link>
            <Link
              href="/changelog"
              className="text-sm font-medium text-primary"
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
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 py-12 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl mb-4">
              Changelog
            </h1>
            <p className="text-muted-foreground md:text-lg max-w-2xl mx-auto">
              Stay up to date with the latest features, improvements, and bug
              fixes
            </p>
          </motion.div>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">
                Loading releases...
              </span>
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <p className="text-destructive mb-4">{error}</p>
              <Button asChild variant="outline">
                <Link
                  href="https://github.com/dev-sam17/focus-forge/releases"
                  target="_blank"
                >
                  View on GitHub
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}

          {!loading && !error && versions.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-4">
                No releases found yet.
              </p>
              <Button asChild variant="outline">
                <Link
                  href="https://github.com/dev-sam17/focus-forge"
                  target="_blank"
                >
                  View Repository
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}

          <motion.div
            className="space-y-8 max-w-4xl mx-auto"
            variants={staggerContainer}
          >
            {versions.map((version, index) => (
              <motion.div
                key={version.version}
                initial={{ opacity: 0, y: 20 }}
                whileInView={fadeInUp}
                viewport={{ once: true }}
              >
                <Card className="border-2 hover:border-primary/30 transition-all duration-300">
                  <CardHeader>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge
                        variant={index === 0 ? "default" : "secondary"}
                        className={
                          index === 0
                            ? "bg-gradient-to-r from-primary to-accent text-white border-0"
                            : ""
                        }
                      >
                        <Tag className="mr-1 h-3 w-3" />v{version.version}
                      </Badge>
                      {index === 0 && (
                        <Badge
                          variant="outline"
                          className="text-accent border-accent"
                        >
                          Latest
                        </Badge>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {version.date}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none [&_h3]:font-bold [&_h3]:text-base [&_h3]:text-foreground [&_h4]:font-semibold [&_h4]:text-sm [&_h4]:text-foreground [&_p]:text-sm [&_p]:text-muted-foreground [&_li]:text-sm [&_li]:text-muted-foreground [&_ul]:text-sm [&_strong]:text-foreground [&_strong]:font-semibold [&_code]:text-xs [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded"
                      dangerouslySetInnerHTML={{ __html: version.content }}
                    />
                    <div className="mt-6 pt-4 border-t">
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={`https://github.com/dev-sam17/focus-forge/releases/tag/v${version.version}`}
                          target="_blank"
                        >
                          View on GitHub
                          <ExternalLink className="ml-2 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
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
            © 2024 Focus Forge. Open Source under MIT License.
          </p>
        </div>
      </footer>
    </div>
  );
}
