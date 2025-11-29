import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { genkit, z } from "genkit";
import { googleAI } from "@genkit-ai/googleai";

// Initialize Genkit
const ai = genkit({
  plugins: [googleAI()],
  model: "googleai/gemini-2.0-flash-exp",
});

// ============================================================================
// GEMINI PROMPT - CLEAN INSTRUCTIONS FOR INTENT/SKILLS/TRAJECTORY EXTRACTION
// ============================================================================

const analyzePrompt = ai.definePrompt({
  name: "analyzeMessagePrompt",
  input: {
    schema: z.object({
      messageText: z.string(),
      conversationHistory: z.string().optional(),
    }),
  },
  output: {
    schema: z.object({
      intent: z.object({
        labels: z.array(z.string()),
        primary: z.string(),
        confidence: z.number(),
      }),
      skills: z.array(
        z.object({
          id: z.string(),
          displayName: z.string(),
          confidence: z.number(),
          role: z.enum(["FOCUS", "SECONDARY", "PREREQUISITE"]),
        })
      ),
      trajectory: z.object({
        currentNodes: z.array(z.string()),
        suggestedNextNodes: z.array(
          z.object({
            id: z.string(),
            reason: z.string(),
            priority: z.number(),
          })
        ),
        status: z.enum([
          "ON_TRACK",
          "STRUGGLING",
          "TOO_ADVANCED",
          "REVIEW_NEEDED",
          "NEW_TOPIC",
          "UNKNOWN",
        ]),
      }),
    }),
    format: "json",
  },
  prompt: `You are analyzing a student's message in a Computer Science course to extract their intent, identify relevant skills, and determine their learning trajectory position.

---

## STUDENT MESSAGE:
{{{messageText}}}

{{#if conversationHistory}}
## RECENT CONVERSATION:
{{{conversationHistory}}}
{{/if}}

---

## TASK 1: INTENT CLASSIFICATION

Identify what the student wants. Choose the PRIMARY intent and list ALL applicable labels:

**Intent Labels:**
- **ASK_EXPLANATION**: Student wants a concept explained
- **ASK_EXAMPLES**: Student requests examples
- **ASK_STEP_BY_STEP_HELP**: Student needs guided step-by-step help
- **ASK_QUIZ**: Student wants practice problems/quiz
- **ASK_SUMMARY**: Student wants a summary
- **ASK_WHAT_TO_LEARN_NEXT**: Student asking about learning path/what to study next
- **META_SYSTEM_HELP**: Student needs technical/system help
- **OFF_TOPIC**: Message not related to course content
- **OTHER**: Doesn't fit other categories

**Output:**
- labels: Array of ALL applicable labels
- primary: The MAIN intent
- confidence: 0.0 to 1.0 (how certain you are)

---

## TASK 2: SKILL IDENTIFICATION

Identify which CS topics/skills are involved. Use these skill IDs:

**Available Skills (CS Data Structures):**
- **arrays**: Arrays and array operations
- **linked_lists**: Linked lists (singly, doubly, circular)
- **stacks**: Stack data structure and operations
- **queues**: Queue data structure and operations
- **recursion**: Recursive algorithms and thinking
- **trees**: Tree data structures (binary trees, BST, AVL)
- **graphs**: Graph data structures and algorithms
- **sorting**: Sorting algorithms (bubble, merge, quick, etc.)
- **searching**: Searching algorithms (linear, binary)
- **complexity**: Time and space complexity analysis (Big-O)
- **hash_tables**: Hash tables and hashing
- **heaps**: Heap data structure and heap sort
- **dynamic_programming**: Dynamic programming techniques

**For each relevant skill, assign a ROLE:**
- **FOCUS**: This is the MAIN topic the student is asking about
- **SECONDARY**: Related/mentioned but not the main focus
- **PREREQUISITE**: Background knowledge needed to understand the question

**Output for each skill:**
- id: Skill ID from list above
- displayName: Human-readable name
- confidence: 0.0 to 1.0
- role: FOCUS, SECONDARY, or PREREQUISITE

---

## TASK 3: TRAJECTORY ANALYSIS

Determine where the student is in their learning journey.

**Step 1 - Determine Status:**
- **ON_TRACK**: Question is appropriate for their level, showing good understanding
- **STRUGGLING**: Asking basic/repeated questions, showing difficulty
- **TOO_ADVANCED**: Asking about topics beyond current level
- **REVIEW_NEEDED**: Question reveals gaps in prerequisite knowledge
- **NEW_TOPIC**: First time engaging with this topic
- **UNKNOWN**: Cannot determine from available information

**Step 2 - Current Nodes:**
List 1-3 skill IDs the student is currently working on/struggling with

**Step 3 - Suggested Next Nodes:**
Recommend 1-3 topics they should study next:
- id: Skill ID
- reason: Brief explanation WHY this next (one sentence)
- priority: 1 (highest priority) to 3 (lowest priority)

---

## OUTPUT FORMAT

Return valid JSON with this EXACT structure:

{
  "intent": {
    "labels": ["ASK_EXPLANATION", "ASK_EXAMPLES"],
    "primary": "ASK_EXPLANATION",
    "confidence": 0.9
  },
  "skills": [
    {
      "id": "recursion",
      "displayName": "Recursion",
      "confidence": 0.95,
      "role": "FOCUS"
    },
    {
      "id": "complexity",
      "displayName": "Time Complexity",
      "confidence": 0.7,
      "role": "SECONDARY"
    }
  ],
  "trajectory": {
    "currentNodes": ["recursion", "trees"],
    "suggestedNextNodes": [
      {
        "id": "dynamic_programming",
        "reason": "Natural progression from recursion with memoization",
        "priority": 1
      },
      {
        "id": "complexity",
        "reason": "Important to analyze recursive algorithms",
        "priority": 2
      }
    ],
    "status": "ON_TRACK"
  }
}

**Important:** 
- Use ONLY skill IDs from the provided list
- Be specific and accurate
- If unsure, use lower confidence scores
- Return ONLY valid JSON, no additional text`,
});

// ============================================================================
// CLOUD FUNCTION: analyzeMessage
// ============================================================================

export const analyzeMessage = functions.https.onCall(
  async (data, context) => {
    try {
      // 1. Check authentication
      if (!context.auth) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "User must be authenticated"
        );
      }
      const userId = context.auth.uid;

      // 2. Validate input
      const { threadId, messageText, messageId, maxHistoryMessages = 3 } = data;

      if (!threadId || !messageText) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "threadId and messageText are required"
        );
      }

      // 3. Fetch conversation history (optional)
      let conversationHistory = "";
      try {
        const messagesSnapshot = await admin
          .firestore()
          .collection("threads")
          .doc(threadId)
          .collection("messages")
          .orderBy("timestamp", "desc")
          .limit(maxHistoryMessages)
          .get();

        const messages = messagesSnapshot.docs
          .map((doc) => {
            const msgData = doc.data();
            const role = msgData.role === "user" ? "Student" : "Assistant";
            return `${role}: ${msgData.content}`;
          })
          .reverse();

        conversationHistory = messages.join("\n");
      } catch (error) {
        console.warn("Could not fetch conversation history:", error);
      }

      // 4. Call Gemini for analysis
      console.log(`Analyzing message for thread ${threadId}...`);
      const { output } = await analyzePrompt({
        messageText,
        conversationHistory: conversationHistory || undefined,
      });

      if (!output) {
        throw new functions.https.HttpsError(
          "internal",
          "Gemini failed to generate analysis"
        );
      }

      // 5. Build complete MessageAnalysis object
      const messageAnalysis = {
        intent: output.intent,
        skills: {
          items: output.skills,
        },
        trajectory: output.trajectory,
        metadata: {
          processedAt: new Date().toISOString(),
          modelVersion: "v0.1-intent-skill-trajectory",
          threadId,
          messageId: messageId || null,
          user_id: userId,
        },
      };

      // 6. Store in Firestore
      const analysisId = messageId || `analysis_${Date.now()}`;
      const analysisRef = admin
        .firestore()
        .collection("threads")
        .doc(threadId)
        .collection("analysis")
        .doc(analysisId);

      await analysisRef.set(messageAnalysis);

      console.log(
        `✓ Analysis completed and stored for thread ${threadId}, message ${analysisId}`
      );

      // 7. Return the analysis
      return messageAnalysis;
    } catch (error: any) {
      console.error("Error in analyzeMessage:", error);

      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      throw new functions.https.HttpsError(
        "internal",
        error.message || "Failed to analyze message"
      );
    }
  }
);

// ============================================================================
// HELPER FUNCTION: Get existing analysis
// ============================================================================

export const getMessageAnalysis = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Authentication required"
      );
    }

    const { threadId, messageId } = data;

    if (!threadId || !messageId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "threadId and messageId required"
      );
    }

    const analysisDoc = await admin
      .firestore()
      .collection("threads")
      .doc(threadId)
      .collection("analysis")
      .doc(messageId)
      .get();

    if (!analysisDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Analysis not found");
    }

    return analysisDoc.data();
  }
);