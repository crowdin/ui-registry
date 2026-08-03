import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/new-york-v4/ui/accordion";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/registry/new-york-v4/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/new-york-v4/ui/card";
import { Progress } from "@/registry/new-york-v4/ui/progress";
import { Skeleton } from "@/registry/new-york-v4/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/new-york-v4/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/new-york-v4/ui/tabs";
import { Section } from "../section";

const LANGUAGES = [
  { code: "uk", name: "Ukrainian", translated: 92, approved: 71 },
  { code: "de", name: "German", translated: 84, approved: 66 },
  { code: "ja", name: "Japanese", translated: 41, approved: 12 },
];

export function DataDisplay() {
  return (
    <Section title="Data display">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Website localization</CardTitle>
          <CardDescription>3 target languages - 1,284 strings</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="https://github.com/crowdin.png" alt="Crowdin" />
              <AvatarFallback>CW</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Crowdin</span>
              <span className="text-muted-foreground text-xs">
                Project owner
              </span>
            </div>
          </div>
          <Progress value={72} aria-label="Overall progress" />
        </CardContent>
      </Card>
      <Tabs defaultValue="progress" className="w-full max-w-lg">
        <TabsList>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="progress">
          <Table>
            <TableCaption>Translation status by language.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Language</TableHead>
                <TableHead className="text-right">Translated</TableHead>
                <TableHead className="text-right">Approved</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {LANGUAGES.map((lang) => (
                <TableRow key={lang.code}>
                  <TableCell className="font-medium">{lang.name}</TableCell>
                  <TableCell className="text-right">
                    {lang.translated}%
                  </TableCell>
                  <TableCell className="text-right">{lang.approved}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="activity" className="text-muted-foreground text-sm">
          No recent activity.
        </TabsContent>
      </Tabs>
      <Accordion type="single" collapsible className="w-full max-w-lg">
        <AccordionItem value="tm">
          <AccordionTrigger>Translation memory</AccordionTrigger>
          <AccordionContent>
            Reuses previously approved translations across projects.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="glossary">
          <AccordionTrigger>Glossary</AccordionTrigger>
          <AccordionContent>
            Keeps brand terms consistent in every target language.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="flex w-full max-w-sm flex-col gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-24 w-full" />
      </div>
    </Section>
  );
}
