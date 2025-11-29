import { NextResponse } from 'next/server';
import { createSession } from '@/lib/firebase';

export async function POST(request: Request) {
  try {
    const { userId, courseId } = await request.json();

    if (!userId || !courseId) {
      return NextResponse.json({ error: 'Missing userId or courseId' }, { status: 400 });
    }

    const newSession = {
      userId,
      courseId,
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      status: 'active' as const,
      messageCount: 0,
      topics: [],
      skills: [],
    };

    const sessionId = await createSession(newSession);

    return NextResponse.json({ sessionId, startTime: newSession.startTime });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
