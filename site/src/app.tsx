import { useEffect, useState } from "react";
import { Button } from "@/registry/new-york-v4/ui/button";
import { Label } from "@/registry/new-york-v4/ui/label";
import { Switch } from "@/registry/new-york-v4/ui/switch";
import { Toaster } from "@/registry/new-york-v4/ui/sonner";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/registry/new-york-v4/ui/toggle-group";
import { TooltipProvider } from "@/registry/new-york-v4/ui/tooltip";
import { Buttons } from "./sections/buttons";
import { DataDisplay } from "./sections/data-display";
import { Feedback } from "./sections/feedback";
import { Forms } from "./sections/forms";
import { Navigation } from "./sections/navigation";
import { Overlays } from "./sections/overlays";

type Host = "off" | "com" | "enterprise";

export function App() {
  const [dark, setDark] = useState(false);
  const [host, setHost] = useState<Host>("off");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    if (host === "off") {
      document.documentElement.removeAttribute("data-crowdin-host");
    } else {
      document.documentElement.setAttribute("data-crowdin-host", host);
    }
  }, [host]);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-50 flex flex-wrap items-center gap-x-6 gap-y-2 border-b bg-background/95 px-6 py-3 backdrop-blur">
          <h1 className="text-sm font-semibold">Crowdin UI Registry</h1>
          <div className="ml-auto flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-2">
              <Switch
                id="dark-toggle"
                checked={dark}
                onCheckedChange={setDark}
              />
              <Label htmlFor="dark-toggle">Dark</Label>
            </div>
            <div className="flex items-center gap-2">
              <Label>Simulate host</Label>
              <ToggleGroup
                type="single"
                variant="outline"
                size="sm"
                value={host}
                onValueChange={(value) => setHost((value || "off") as Host)}
              >
                <ToggleGroupItem value="off">Off</ToggleGroupItem>
                <ToggleGroupItem value="com">crowdin.com</ToggleGroupItem>
                <ToggleGroupItem value="enterprise">Enterprise</ToggleGroupItem>
              </ToggleGroup>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://github.com/crowdin/ui-registry"
                target="_blank"
                rel="noreferrer"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
                </svg>
                GitHub
              </a>
            </Button>
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-10">
          <Buttons />
          <Forms />
          <Overlays />
          <DataDisplay />
          <Feedback />
          <Navigation />
        </main>
        <Toaster />
      </div>
    </TooltipProvider>
  );
}
