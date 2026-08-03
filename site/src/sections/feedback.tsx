import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react";
import { toast } from "sonner";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/registry/new-york-v4/ui/alert";
import { Button } from "@/registry/new-york-v4/ui/button";
import { Spinner } from "@/registry/new-york-v4/ui/spinner";
import { Section } from "../section";

export function Feedback() {
  return (
    <Section title="Feedback">
      <div className="flex w-full max-w-lg flex-col gap-3">
        <Alert>
          <CheckCircle2Icon />
          <AlertTitle>Sync finished</AlertTitle>
          <AlertDescription>
            128 new strings were pushed to translators.
          </AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Build failed</AlertTitle>
          <AlertDescription>
            The export bundle contains unresolved placeholders.
          </AlertDescription>
        </Alert>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          onClick={() =>
            toast("Translation saved", { description: "uk: 1 string updated" })
          }
        >
          Show toast
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.success("File uploaded")}
        >
          Success toast
        </Button>
        <Button variant="outline" onClick={() => toast.error("Upload failed")}>
          Error toast
        </Button>
        <Spinner />
      </div>
    </Section>
  );
}
