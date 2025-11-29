import { NextResponse } from 'next/server';
import { addMessage } from '@/lib/firebase';

export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const { role, content, metadata } = await request.json();

    if (!role || !content) {
      return NextResponse.json({ error: 'Missing role or content' }, { status: 400 });
    }

    const newMessage = {
      role,
      content,
      timestamp: new Date().toISOString(),
      metadata: metadata || {},
    };

    const messageId = await addMessage(sessionId, newMessage);

    return NextResponse.json({ messageId, timestamp: newMessage.timestamp });
  } catch (error) {
    console.error('Error adding message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
