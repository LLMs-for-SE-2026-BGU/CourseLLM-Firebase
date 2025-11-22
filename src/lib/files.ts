export type FileData = {
    id: string;
    name:string;
    type: string;
    size: string;
    date: string;
    url: string;
  };
  
  export const initialFiles: FileData[] = [
    {
      id: "1",
      name: "Class-Syllabus.pdf",
      type: "pdf",
      size: "1.2 MB",
      date: "2023-08-15",
      url: "/Class-Syllabus.pdf",
    },
    {
      id: "2",
      name: "Lecture-Notes-Week1.docx",
      type: "docx",
      size: "450 KB",
      date: "2023-09-01",
      url: "/Lecture-Notes-Week1.docx",
    },
    {
      id: "3",
      name: "Student-Art-Project.png",
      type: "png",
      size: "3.5 MB",
      date: "2023-09-10",
      url: "/Student-Art-Project.png",
    },
    {
      id: "4",
      name: "Historical-Documents.zip",
      type: "zip",
      size: "15.7 MB",
      date: "2023-09-12",
      url: "/Historical-Documents.zip",
    },
    {
      id: "5",
      name: "Science-Fair-Presentation.pptx",
      type: "pptx",
      size: "5.1 MB",
      date: "2023-09-20",
      url: "/Science-Fair-Presentation.pptx",
    },
    {
      id: "6",
      name: "Group-Photo.jpg",
      type: "jpg",
      size: "4.2 MB",
      date: "2023-10-05",
      url: "/Group-Photo.jpg",
    },
    {
      id: "7",
      name: "audio-lecture.mp3",
      type: "mp3",
      size: "8.9 MB",
      date: "2023-10-11",
      url: "/audio-lecture.mp3",
    },
    {
      id: "8",
      name: "instructional-video.mp4",
      type: "mp4",
      size: "25.4 MB",
      date: "2023-10-18",
      url: "/instructional-video.mp4",
    },
  ];
  