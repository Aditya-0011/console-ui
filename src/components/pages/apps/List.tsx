import { Link } from "react-router";

import { type AppUrlMapping } from "@/lib/objects";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const MANAGER_URL = import.meta.env.VITE_MANAGER_URL;

export const appUrlMapping: AppUrlMapping[] = [
  {
    name: "Portfolio",
    url: "https://adityapunmiya.com",
    description: "Name is self explanatory...",
    rel: "noopener noreferrer",
  },
  {
    name: "Manager",
    url: MANAGER_URL,
    description: "PMS for adityapunmiya.com",
  },
];

export function List() {
  return (
    <div className="columns-1 gap-4 pb-4 sm:columns-2 lg:columns-4">
      {appUrlMapping.map((app, i) => (
        <Card
          key={i}
          className="group bg-muted/5 hover:bg-muted/50 mb-4 break-inside-avoid ring ring-white/10 backdrop-blur transition-all contain-content hover:scale-[1.01] hover:text-lime-200 hover:ring-lime-600"
        >
          <Link
            to={app.url}
            rel={app.rel}
            target="_blank"
            className="flex h-full flex-col"
          >
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg leading-tight tracking-tight">
                {app.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-4 pt-0">
              <CardDescription className="text-muted-foreground text-sm leading-tight">
                {app.description}
              </CardDescription>
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  );
}
