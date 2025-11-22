"use client";

import { useState, useRef, useEffect } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { initialFiles as defaultInitialFiles, type FileData } from "@/lib/files";
import { FileCard } from "./file-card";

export function FileBrowser({ initialFiles = defaultInitialFiles }: { initialFiles?: FileData[] }) {
  const [files, setFiles] = useState<FileData[]>(initialFiles);
  const [fileToDelete, setFileToDelete] = useState<FileData | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [objectUrls, setObjectUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    return () => {
      // Revoke object URLs on component unmount
      Object.values(objectUrls).forEach(URL.revokeObjectURL);
    };
  }, [objectUrls]);

  const handleUploadClick = () => {
    uploadInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const newFile: FileData = {
        id: Date.now().toString(),
        name: file.name,
        type: file.name.split(".").pop() || "file",
        size: `${(file.size / 1024).toFixed(2)} KB`,
        date: new Date().toLocaleDateString(),
        url: url,
      };
      setFiles((prev) => [newFile, ...prev]);
      setObjectUrls(prev => ({...prev, [newFile.id]: url}));
    }
    // Reset file input
    if(event.target) {
        event.target.value = "";
    }
  };

  const handleDeleteRequest = (file: FileData) => {
    setFileToDelete(file);
  };

  const confirmDelete = () => {
    if (fileToDelete) {
      setFiles(files.filter((f) => f.id !== fileToDelete.id));
      if (objectUrls[fileToDelete.id]) {
        URL.revokeObjectURL(objectUrls[fileToDelete.id]);
        const newObjectUrls = {...objectUrls};
        delete newObjectUrls[fileToDelete.id];
        setObjectUrls(newObjectUrls);
      }
      setFileToDelete(null);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          File Management
        </h1>
        <Button onClick={handleUploadClick}>
          <Upload className="mr-2 h-4 w-4" />
          Upload File
        </Button>
        <input
          type="file"
          ref={uploadInputRef}
          onChange={handleFileChange}
          className="hidden"
          aria-label="Upload File"
        />
      </div>

      {files.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {files.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              onDelete={handleDeleteRequest}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-20 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold text-muted-foreground">No files found</h2>
            <p className="text-muted-foreground mt-2">Start by uploading your first file.</p>
            <Button onClick={handleUploadClick} className="mt-4">
                <Upload className="mr-2 h-4 w-4" />
                Upload File
            </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!fileToDelete}
        onOpenChange={() => setFileToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the file
              <span className="font-semibold break-all"> {fileToDelete?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
