import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import fetch from "node-fetch";

admin.initializeApp();

exports.updateSessionMetadata = functions.firestore
  .document('conversations/{sessionId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    const { sessionId } = context.params;
    const sessionRef = admin.firestore().collection('conversations').doc(sessionId);

    try {
      const sessionDoc = await sessionRef.get();
      if (sessionDoc.exists) {
        const sessionData = sessionDoc.data();
        if (sessionData) {
          const newMessageCount = (sessionData.messageCount || 0) + 1;
          await sessionRef.update({
            lastActivity: new Date().toISOString(),
            messageCount: newMessageCount,
          });
          console.log(`Session ${sessionId} updated successfully.`);
        }
      }
    } catch (error) {
      console.error(`Error updating session ${sessionId}:`, error);
    }
  });

exports.analyzeConversation = functions.firestore
  .document('conversations/{sessionId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    const { sessionId } = context.params;
    const message = snap.data();

    if (message && message.role === 'user') {
      try {
        // Assuming a hypothetical NLP analysis API
        const response = await fetch('https://api.nlp-analysis.com/v1/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: message.content }),
        });

        if (response.ok) {
          const { topics, skills } = await response.json();
          const sessionRef = admin.firestore().collection('conversations').doc(sessionId);

          await sessionRef.update({
            topics: admin.firestore.FieldValue.arrayUnion(...topics),
            skills: admin.firestore.FieldValue.arrayUnion(...skills),
          });
          console.log(`Topics and skills for session ${sessionId} updated.`);
        }
      } catch (error) {
        console.error(`Error analyzing conversation for session ${sessionId}:`, error);
      }
    }
  });
