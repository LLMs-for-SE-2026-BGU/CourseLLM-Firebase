"use client";

import { MoreVertical, Trash2 } from "lucide-react";
import type { FileData } from "@/lib/files";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { FileIcon } from "./file-icon";
interface FileCardProps {
  file: FileData;
  onDelete: (file: FileData) => void;
}

export function FileCard({ file, onDelete }: FileCardProps) {
  const handleCardClick = () => {
    window.open(file.url, '_blank');
  }

  return (
    <Card
      className="relative cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-in-out"
      onClick={handleCardClick}
    >
      <div className="absolute top-2 right-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => e.stopPropagation()} // Prevent card's onClick
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(file);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <CardHeader className="items-center pb-4">
        <FileIcon fileType={file.type} className="h-12 w-12 text-primary" />
      </CardHeader>
      <CardContent className="text-center">
        <CardTitle className="text-base font-medium break-all">{file.name}</CardTitle>
        <CardDescription className="text-xs mt-1">
          {file.size} &bull; {file.date}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
