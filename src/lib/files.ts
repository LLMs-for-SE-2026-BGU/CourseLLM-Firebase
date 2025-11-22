export type FileData = {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  url: string;
};

export const initialFiles: FileData[] = [
  {
    id: "1",
    name: "lesson-plan.pdf",
    type: "pdf",
    size: "1.2 MB",
    date: "2023-10-26",
    url: "/api/placeholder/100/100",
  },
  {
    id: "2",
    name: "class-notes.docx",
    type: "docx",
    size: "345 KB",
    date: "2023-10-25",
    url: "/api/placeholder/100/100",
  },
  {
    id: "3",
    name: "presentation.pptx",
    type: "pptx",
    size: "5.8 MB",
    date: "2023-10-24",
    url: "/api/placeholder/100/100",
  },
];
