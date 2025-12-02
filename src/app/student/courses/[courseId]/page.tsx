import { getCourseById } from "@/lib/mock-data";
import type { Course, Material } from "@/lib/types";
import { db } from "@/lib/firebase";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Presentation } from "lucide-react";
import { ChatPanel } from "./_components/chat-panel";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

type PageProps = {
  params: { courseId: string };
};

/**
 * Loads a course from mock-data, but uses Firestore as the
 * source of truth for materials.
 *
 * - If Firestore has materials under courses/{courseId}/materials,
 *   we use those.
 * - If Firestore is empty, we seed it with the mock materials
 *   (one-time) and return those.
 */
async function loadCourseFromFirestore(
  courseId: string
): Promise<Course | null> {
  const baseCourse = getCourseById(courseId);
  if (!baseCourse) return null;

  const mockMaterials = baseCourse.materials ?? [];

  try {
    const materialsCol = collection(db, "courses", courseId, "materials");
    const materialsSnap = await getDocs(materialsCol);

    // If Firestore has no materials yet: seed it from mock-data
    if (materialsSnap.empty) {
      if (mockMaterials.length > 0) {
        await Promise.all(
          mockMaterials.map((m, idx) => {
            const materialId = m.id ?? `mock-${idx}`;
            const ref = doc(materialsCol, materialId);

            return setDoc(ref, {
              id: materialId,
              title: m.title,
              type: m.type,
              content: m.content ?? "",
              storagePath: null,
              downloadUrl: null,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          })
        );
      }

      const normalizedMaterials: Material[] = mockMaterials.map((m, idx) => ({
        ...m,
        id: m.id ?? `mock-${idx}`,
        content: m.content ?? "",
      }));

      return {
        ...baseCourse,
        materials: normalizedMaterials,
      };
    }

    // Firestore already has materials → use them
    const firestoreMaterials: Material[] = materialsSnap.docs.map((docSnap) => {
      const data = docSnap.data() as any;

      return {
        id: (data.id as string) ?? docSnap.id,
        title: (data.title as string) ?? "Untitled material",
        type: (data.type as Material["type"]) ?? "PDF",
        content: (data.content as string) ?? "",
      };
    });

    return {
      ...baseCourse,
      materials: firestoreMaterials,
    };
  } catch (err) {
    console.error("Failed to load course materials from Firestore (student page):", err);
    // On error, just fall back to mock materials
    return {
      ...baseCourse,
      materials: mockMaterials,
    };
  }
}

export default async function CourseDetailPage({ params }: PageProps) {
  const course = await loadCourseFromFirestore(params.courseId);

  if (!course) {
    notFound();
  }

  // Build a single string for the Socratic chat flow
  const courseMaterialString =
    course.materials && course.materials.length > 0
      ? course.materials
          .map(
            (m) =>
              `Title: ${m.title}\nType: ${m.type}\nContent:\n${m.content ?? ""}`
          )
          .join("\n\n---\n\n")
      : "No course materials are available yet.";

  const renderIcon = (type: Material["type"]) => {
    switch (type) {
      case "PPT":
        return <Presentation className="h-5 w-5 text-primary" />;
      case "DOC":
      case "MD":
      case "PDF":
      default:
        return <FileText className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold font-headline">{course.title}</h1>
        <p className="text-muted-foreground">{course.description}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 h-full">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Course Materials</CardTitle>
            <CardDescription>
              Review the materials for this course.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                {course.materials && course.materials.length > 0 ? (
                  course.materials.map((material) => (
                    <div
                      key={material.id}
                      className="p-4 border rounded-lg bg-muted/50"
                    >
                      <h3 className="flex items-center gap-2 font-semibold mb-2">
                        {renderIcon(material.type)}
                        <span>{material.title}</span>
                        <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-full border">
                          {material.type}
                        </span>
                      </h3>
                      {material.content && (
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {material.content}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No materials available yet.
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="h-full">
          <ChatPanel courseMaterial={courseMaterialString} />
        </div>
      </div>
    </div>
  );
}
