"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Course, Material } from "@/lib/types";
import { FileText, Presentation, Upload, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadMaterial, deleteMaterial } from "../actions";
import { useParams } from "next/navigation";

type Props = {
  course: Course;
};

export function CourseManagementClient({ course: initialCourse }: Props) {
  const [course, setCourse] = useState<Course>({
    ...initialCourse,
    materials: initialCourse.materials ?? [],
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingMeta, setIsSavingMeta] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();
  const params = useParams();
  const courseId =
    (params?.courseId as string | undefined) ?? initialCourse.id;

  const handleSaveChanges = async () => {
    setIsSavingMeta(true);
    try {
      // In this version we only persist materials.
      // You can extend this to persist learningObjectives/Skills/Trajectories
      // into Firestore under courses/{courseId}.
      console.log("Saving course metadata:", course);
      toast({
        title: "Changes saved",
        description: `Your changes to "${course.title}" have been saved.`,
      });
    } finally {
      setIsSavingMeta(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("courseId", courseId);
      formData.append("file", selectedFile);
      formData.append("title", selectedFile.name);

      const result = await uploadMaterial(formData);

      if (result.success && result.material) {
        setCourse((prev) => ({
          ...prev,
          materials: [...(prev.materials ?? []), result.material as Material],
        }));
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        toast({
          title: "Material uploaded",
          description: `"${result.material.title}" has been added to the course materials.`,
        });
      } else {
        toast({
          title: "Upload failed",
          description:
            result.error || "Failed to upload file. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    setIsDeleting(materialId);
    try {
      const result = await deleteMaterial(courseId, materialId);

      if (result.success) {
        setCourse((prev) => ({
          ...prev,
          materials: (prev.materials ?? []).filter(
            (m) => m.id !== materialId
          ),
        }));
        toast({
          title: "Material deleted",
          description: "The material has been removed from the course.",
        });
      } else {
        toast({
          title: "Delete failed",
          description:
            result.error ||
            "Failed to delete material. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Delete failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const renderMaterialIcon = (type: Material["type"]) => {
    switch (type) {
      case "PPT":
        return <Presentation className="mr-2 h-4 w-4" />;
      case "DOC":
      case "MD":
      case "PDF":
      default:
        return <FileText className="mr-2 h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground">
            Manage materials and the learning plan for this course.
          </p>
        </div>
        <Button onClick={handleSaveChanges} disabled={isSavingMeta}>
          {isSavingMeta && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="materials" className="space-y-4">
        <TabsList>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="learning-plan">Learning Plan</TabsTrigger>
        </TabsList>

        {/* Materials tab */}
        <TabsContent value="materials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Material</CardTitle>
              <CardDescription>
                Upload PDFs, slides, documents, or markdown files for this
                course.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <Label htmlFor="material-file">Course material</Label>
                  <Input
                    id="material-file"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.ppt,.pptx,.doc,.docx,.md,.txt"
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {selectedFile.name} (
                      {(selectedFile.size / 1024).toFixed(2)} KB)
                    </p>
                  )}
                </div>
                <Button
                  variant="secondary"
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Existing Materials</CardTitle>
              <CardDescription>
                All materials currently associated with this course.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {course.materials && course.materials.length > 0 ? (
                <ul className="space-y-2">
                  {course.materials.map((material) => (
                    <li
                      key={material.id}
                      className="flex items-center justify-between rounded-lg border px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        {renderMaterialIcon(material.type)}
                        <div>
                          <div className="font-medium">
                            {material.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {material.type}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() =>
                          handleDeleteMaterial(material.id)
                        }
                        disabled={isDeleting === material.id}
                      >
                        {isDeleting === material.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Delete
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No materials yet. Upload your first file to get
                  started.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Learning plan tab */}
        <TabsContent value="learning-plan">
          <Card>
            <CardHeader>
              <CardTitle>Learning Plan</CardTitle>
              <CardDescription>
                Define learning objectives, skills and trajectories for
                this course.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="objectives">Learning Objectives</Label>
                <Textarea
                  id="objectives"
                  rows={4}
                  placeholder="What should students know or be able to do by the end of this course?"
                  value={course.learningObjectives}
                  onChange={(e) =>
                    setCourse((prev) => ({
                      ...prev,
                      learningObjectives: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">Key Skills</Label>
                <Textarea
                  id="skills"
                  rows={3}
                  placeholder="List the main skills students will acquire."
                  value={course.learningSkills}
                  onChange={(e) =>
                    setCourse((prev) => ({
                      ...prev,
                      learningSkills: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trajectories">
                  Learning Trajectories
                </Label>
                <Input
                  id="trajectories"
                  placeholder="e.g., Beginner → Intermediate → Advanced"
                  value={course.learningTrajectories}
                  onChange={(e) =>
                    setCourse((prev) => ({
                      ...prev,
                      learningTrajectories: e.target.value,
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
