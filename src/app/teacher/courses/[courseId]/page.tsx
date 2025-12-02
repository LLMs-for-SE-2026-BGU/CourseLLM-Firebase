import { notFound } from "next/navigation";
import { CourseManagementClient } from "./_components/course-management-client";
import { getCourseById } from "@/lib/mock-data";
import type { Course, Material } from "@/lib/types";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

type PageProps = {
  params: Promise<{ courseId: string }>;
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

  if (!baseCourse) {
    return null;
  }

  const mockMaterials = baseCourse.materials ?? [];

  try {
    const materialsCol = collection(db, "courses", courseId, "materials");
    const materialsSnap = await getDocs(materialsCol);

    // If Firestore has no materials yet: seed it from mock-data
    if (materialsSnap.empty) {
      if (mockMaterials.length > 0) {
        try {
          await Promise.all(
            mockMaterials.map((m, idx) => {
              const materialId = m.id ?? `mock-${idx}`;
              const materialDocRef = doc(materialsCol, materialId);

              return setDoc(materialDocRef, {
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
        } catch (seedErr) {
          console.error("Failed to seed mock materials to Firestore:", seedErr);
        }
      }

      // Normalize IDs in the returned course too
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

    // Firestore already has materials → use them as the source of truth
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
    console.error("Failed to load course materials from Firestore:", err);
    // On error, just fall back to mock materials
    return {
      ...baseCourse,
      materials: mockMaterials,
    };
  }
}

export default async function ManageCoursePage(props: PageProps) {
  const params = await props.params;
  const courseId = params.courseId;

  const course = await loadCourseFromFirestore(courseId);

  if (!course) {
    notFound();
  }

  return <CourseManagementClient course={course} />;
}
