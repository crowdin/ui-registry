import {
  BoldIcon,
  ItalicIcon,
  SettingsIcon,
  UnderlineIcon,
} from "lucide-react";
import { Badge } from "@/registry/new-york-v4/ui/badge";
import { Button } from "@/registry/new-york-v4/ui/button";
import { Toggle } from "@/registry/new-york-v4/ui/toggle";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/registry/new-york-v4/ui/toggle-group";
import { Section } from "../section";

export function Buttons() {
  return (
    <Section title="Buttons & badges">
      <div className="flex flex-wrap items-center gap-2">
        <Button>Save changes</Button>
        <Button variant="secondary">Duplicate</Button>
        <Button variant="outline">Preview</Button>
        <Button variant="ghost">Dismiss</Button>
        <Button variant="destructive">Delete project</Button>
        <Button variant="link">Learn more</Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
        <Button size="icon" aria-label="Settings">
          <SettingsIcon />
        </Button>
        <Button disabled>Disabled</Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge>Translated</Badge>
        <Badge variant="secondary">In review</Badge>
        <Badge variant="outline">Draft</Badge>
        <Badge variant="destructive">Failed</Badge>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Toggle aria-label="Toggle bold">
          <BoldIcon />
        </Toggle>
        <ToggleGroup type="single" defaultValue="bold" variant="outline">
          <ToggleGroupItem value="bold" aria-label="Bold">
            <BoldIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Italic">
            <ItalicIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="Underline">
            <UnderlineIcon />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </Section>
  );
}
