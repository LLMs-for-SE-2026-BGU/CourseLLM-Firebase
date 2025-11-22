import { File, FileArchive, FileAudio, FileImage, FileText, FileVideo, Presentation } from "lucide-react";
import type { LucideProps } from "lucide-react";

export function FileIcon({ fileType, ...props }: { fileType: string } & LucideProps) {
    switch (fileType.toLowerCase()) {
        case 'pdf':
            return <FileText {...props} />;
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
        case 'svg':
            return <FileImage {...props} />;
        case 'zip':
        case 'rar':
        case '7z':
            return <FileArchive {...props} />;
        case 'mp4':
        case 'mov':
        case 'avi':
        case 'webm':
            return <FileVideo {...props} />;
        case 'mp3':
        case 'wav':
        case 'ogg':
            return <FileAudio {...props} />;
        case 'doc':
        case 'docx':
            return <FileText {...props} />;
        case 'ppt':
        case 'pptx':
            return <Presentation {...props} />;
        default:
            return <File {...props} />;
    }
}
