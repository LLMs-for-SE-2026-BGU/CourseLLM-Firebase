'use server';

import type { Material } from '@/lib/types';
import { db, storage } from '@/lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

function inferMaterialType(fileName: string): Material['type'] {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return 'PDF';
    case 'ppt':
    case 'pptx':
      return 'PPT';
    case 'doc':
    case 'docx':
      return 'DOC';
    case 'md':
      return 'MD';
    default:
      // Fallback – keeps the union happy
      return 'PDF';
  }
}

function generateMaterialId(): string {
  return `mat-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

/**
 * Server action to handle file upload.
 * Uploads the file to Firebase Storage (emulator in dev)
 * and saves metadata in Firestore under:
 *   courses/{courseId}/materials/{materialId}
 */
export async function uploadMaterial(
  formData: FormData
): Promise<{ success: boolean; material?: Material; error?: string }> {
  try {
    const courseId = formData.get('courseId') as string | null;
    const file = formData.get('file') as File | null;
    const explicitTitle = formData.get('title') as string | null;

    if (!courseId) {
      return { success: false, error: 'Missing courseId.' };
    }

    if (!file) {
      return {
        success: false,
        error: 'No file provided.',
      };
    }

    const materialId = generateMaterialId();
    const title =
      explicitTitle && explicitTitle.trim().length > 0
        ? explicitTitle.trim()
        : file.name || 'Untitled material';
    const type = inferMaterialType(file.name);

    // Upload the file bytes to Storage
    const storagePath = `courses/${courseId}/materials/${materialId}-${file.name}`;
    const storageRef = ref(storage, storagePath);
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    await uploadBytes(storageRef, bytes, {
      contentType: file.type || undefined,
    });

    const downloadUrl = await getDownloadURL(storageRef);

    // For now we keep `content` empty; in a real system you would
    // store extracted text here.
    const material: Material = {
      id: materialId,
      title,
      type,
      content: '',
    };

    const materialsCollection = collection(
      db,
      'courses',
      courseId,
      'materials'
    );
    const materialDocRef = doc(materialsCollection, materialId);

    await setDoc(materialDocRef, {
      ...material,
      storagePath,
      downloadUrl,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      material,
    };
  } catch (error) {
    console.error('Error uploading material:', error);
    return {
      success: false,
      error: 'Failed to upload material. Please try again.',
    };
  }
}

/**
 * Server action to delete a material.
 * Deletes both the Firestore document and the file in Storage (if present).
 */
export async function deleteMaterial(
  courseId: string,
  materialId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!courseId || !materialId) {
      return {
        success: false,
        error: 'Missing courseId or materialId.',
      };
    }

    const materialDocRef = doc(db, 'courses', courseId, 'materials', materialId);
    const snapshot = await getDoc(materialDocRef);

    if (snapshot.exists()) {
      const data = snapshot.data() as { storagePath?: string };

      if (data.storagePath) {
        try {
          const storageRef = ref(storage, data.storagePath);
          await deleteObject(storageRef);
        } catch (err) {
          // If the blob is already gone, we still consider the operation OK
          console.warn('Failed to delete file from storage:', err);
        }
      }

      await deleteDoc(materialDocRef);
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting material:', error);
    return {
      success: false,
      error: 'Failed to delete material. Please try again.',
    };
  }
}
