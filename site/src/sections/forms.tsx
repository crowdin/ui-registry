import { Checkbox } from "@/registry/new-york-v4/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/registry/new-york-v4/ui/field";
import { Input } from "@/registry/new-york-v4/ui/input";
import { Label } from "@/registry/new-york-v4/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/registry/new-york-v4/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/new-york-v4/ui/select";
import { Slider } from "@/registry/new-york-v4/ui/slider";
import { Switch } from "@/registry/new-york-v4/ui/switch";
import { Textarea } from "@/registry/new-york-v4/ui/textarea";
import { Section } from "../section";

export function Forms() {
  return (
    <Section title="Forms">
      <FieldGroup className="w-full max-w-sm">
        <Field>
          <FieldLabel htmlFor="project-name">Project name</FieldLabel>
          <Input id="project-name" placeholder="Website localization" />
          <FieldDescription>
            Shown to translators in the editor.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="project-notes">Notes</FieldLabel>
          <Textarea
            id="project-notes"
            placeholder="Context for the translation team"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="source-language">Source language</FieldLabel>
          <Select defaultValue="en">
            <SelectTrigger id="source-language" className="w-full">
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="uk">Ukrainian</SelectItem>
              <SelectItem value="de">German</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center gap-2">
          <Checkbox id="notify" defaultChecked />
          <Label htmlFor="notify">Notify members about new strings</Label>
        </div>
        <RadioGroup defaultValue="mt" className="gap-2">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="mt" id="pretranslate-mt" />
            <Label htmlFor="pretranslate-mt">Pre-translate via MT</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="tm" id="pretranslate-tm" />
            <Label htmlFor="pretranslate-tm">Pre-translate via TM</Label>
          </div>
        </RadioGroup>
        <div className="flex items-center gap-2">
          <Switch id="qa-checks" defaultChecked />
          <Label htmlFor="qa-checks">QA checks</Label>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="tm-threshold">TM match threshold</Label>
          <Slider id="tm-threshold" defaultValue={[75]} max={100} step={1} />
        </div>
      </div>
    </Section>
  );
}
