'use server';

import type { Material } from '@/lib/types';

/**
 * Server action to handle file upload
 * In production, this would upload to Firebase Storage and extract content
 */
export async function uploadMaterial(
  formData: FormData
): Promise<{ success: boolean; material?: Material; error?: string }> {
  try {
    const courseId = formData.get('courseId') as string;
    const file = formData.get('file') as File;
    
    if (!file) {
      return {
        success: false,
        error: 'No file provided.',
      };
    }

    const fileName = file.name;
    
    // Validate file type
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    const validExtensions = ['pdf', 'ppt', 'pptx', 'doc', 'docx', 'md', 'txt'];
    
    if (!fileExtension || !validExtensions.includes(fileExtension)) {
      return {
        success: false,
        error: 'Invalid file type. Please upload PDF, PPT, DOC, or MD files.',
      };
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size exceeds 10MB limit.',
      };
    }

    // Map file extension to material type
    const typeMap: Record<string, Material['type']> = {
      'pdf': 'PDF',
      'ppt': 'PPT',
      'pptx': 'PPT',
      'doc': 'DOC',
      'docx': 'DOC',
      'md': 'MD',
      'txt': 'MD',
    };

    const materialType = typeMap[fileExtension] || 'PDF';

    // Read file content (for text-based files)
    // In production, you'd extract text from PDFs/DOCs using a library
    let content = '';
    if (fileExtension === 'md' || fileExtension === 'txt') {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const text = buffer.toString('utf-8');
      content = text.substring(0, 1000); // Limit preview content
    } else {
      content = `Content from ${fileName}. In production, this would be extracted from the file.`;
    }

    // Generate a unique ID for the material
    const materialId = `mat-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Create material object
    const material: Material = {
      id: materialId,
      title: fileName.replace(/\.[^/.]+$/, ''), // Remove extension
      type: materialType,
      content: content,
    };

    // TODO: In production, upload file to Firebase Storage here
    // const storageRef = ref(storage, `courses/${courseId}/materials/${materialId}`);
    // await uploadBytes(storageRef, file);
    // const downloadUrl = await getDownloadURL(storageRef);

    return {
      success: true,
      material,
    };
  } catch (error) {
    console.error('Error uploading material:', error);
    return {
      success: false,
      error: 'Failed to upload file. Please try again.',
    };
  }
}

/**
 * Server action to delete a material
 */
export async function deleteMaterial(
  courseId: string,
  materialId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // TODO: In production, delete from Firebase Storage and Firestore
    // const storageRef = ref(storage, `courses/${courseId}/materials/${materialId}`);
    // await deleteObject(storageRef);
    
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



