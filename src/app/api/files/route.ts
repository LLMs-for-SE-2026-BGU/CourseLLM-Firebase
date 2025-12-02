import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs/promises";
import * as path from "path";

const FILES_DIR = path.join(process.cwd(), "public");

async function getFiles() {
  const files = await fs.readdir(FILES_DIR);
  return files.map((file) => ({ name: file, path: path.join(FILES_DIR, file) }));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get("path");

  if (filePath) {
    try {
      const fileContent = await fs.readFile(filePath);
      return new NextResponse(fileContent, {
        headers: {
          "Content-Type": "application/octet-stream",
        },
      });
    } catch (error) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
  }

  const files = await getFiles();
  return NextResponse.json({ files });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (file) {
    const filePath = path.join(FILES_DIR, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get("path");

  if (filePath) {
    try {
      await fs.unlink(filePath);
      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
  }

  return NextResponse.json({ error: "File path is required" }, { status: 400 });
}
