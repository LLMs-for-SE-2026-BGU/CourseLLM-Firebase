# CourseWise - AI-Powered Learning Platform

CourseWise is a modern educational platform built with **Next.js** and **Firebase**, designed to revolutionize the student learning experience through AI-driven personalization.

## 🌟 Project Overview

This project implements a sophisticated **Student Profile Manager** that goes beyond simple grade tracking. It leverages Generative AI (Google Gemini via Genkit) to create a dynamic learning loop:
1.  **Assess**: AI generates custom quizzes based on specific Learning Objectives (LOs).
2.  **Evaluate**: AI grades student answers, providing natural language feedback.
3.  **Adapt**: The system automatically updates the student's mastery of specific skills based on quiz performance.

## 🚀 Getting Started

### Prerequisites
*   **Node.js** (v18 or higher recommended)
*   **npm** or **yarn**
*   A **Google Gemini API Key** (Required for AI features)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/LLMs-for-SE-2026-BGU/CourseLLM-Firebase
    cd CourseLLM-Firebase
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    *   Create a file named `.env.local` (or just `.env`) in the **root** directory.
    *   Add your Google AI Studio API key.

    **File: `.env.local`**
    ```env
    # Get your key from: https://aistudio.google.com/app/apikey
    GOOGLE_GENAI_API_KEY=your_actual_api_key_here
    ```

4.  **Run the Application**
    ```bash
    npm run dev
    ```
    *   The app will start at [http://localhost:9002](http://localhost:9002).

## ✨ Feature Deep Dive: Student Profile & AI Assessments

The core of this update is the **Student Profile Manager**, a centralized hub for tracking academic growth.

### 1. 🧠 AI-Powered Adaptive Quizzes
*   **Dynamic Generation**: Unlike static quizzes, our system uses AI to generate unique multiple-choice questions on the fly based on the course's Learning Objectives.
*   **Context-Aware**: Questions are tailored to the specific "Course Title" and target skills (e.g., "Recursion", "Data Structures").
*   **Custom Practice**: Students can click **"+ Create New Quiz"** to generate a fresh practice assessment for *any* course they are enrolled in.

### 2. 🤖 Intelligent Grading & Feedback
*   **Instant Feedback**: The AI evaluates answers immediately, providing a supportive explanation for the overall performance.
*   **Skill Impact Analysis**: The system calculates exactly how a quiz result affects specific skills.
    *   *Example*: Getting a recursion question right might increase your "Understand Recursion" mastery by +10%.
    *   *Visuals*: Green/Red indicators show positive or negative impact on your profile.

### 3. 📊 Comprehensive Analytics Dashboard
*   **Visual Mastery Tracking**: Learning Objectives (LOs) are tracked individually with progress bars.
    *   🟢 **Mastered (>90%)**: Skill acquired.
    *   🟡 **In Progress**: Active learning.
    *   ⚪ **Not Started**: Future topics.
*   **Persistence**: Quiz results and mastery updates are persisted locally, ensuring the student's profile evolves as they take more assessments.

### 4. 🎨 Modern, High-Tech UI
*   **Centered Focus Mode**: Quiz interface designed to minimize distractions.
*   **Interactive Elements**: Smooth animations, hover effects, and clear typography.
*   **Responsive Design**: Optimized for both desktop and tablet learning.

## 🛠️ Tech Stack

*   **Frontend**: Next.js 15 (App Router), React, Tailwind CSS
*   **UI Library**: Shadcn/UI (Radix Primitives)
*   **AI Engine**: Google Genkit + Gemini 2.5 Flash
*   **State Management**: React Hooks + LocalStorage Persistence
*   **Language**: TypeScript

## 🧪 How to Validate (E2E)

1.  **Login**: Access the app as a Student.
2.  **Visit Profile**: Go to the **Profile** tab in the sidebar.
3.  **Create Quiz**: Click **"Create New Quiz"**, select a course (e.g., "Introduction to Python").
4.  **Take Assessment**:
    *   Notice the AI generating questions.
    *   Select answers and submit.
5.  **Review Impact**:
    *   See the "Quiz Complete" screen with your score.
    *   Check the "Learning Impact" section to see which LOs were updated.
    *   Return to Profile and verify the **LO Mastery** stats have changed.
6.  **Redo**: Use the **"Try Another Quiz"** button to instantly generate a new challenge.
# CourseLLM

## Purpose
CourseLLM (Coursewise) is an educational platform that leverages AI to provide personalized learning experiences. 
It is intended for Undergraduate University Courses and is being tested on Computer Science courses.

The project provides role-based dashboards for students and teachers, integrated authentication via Firebase, and AI-powered course assessment and tutoring. 

The core goals are to:
- Enable personalized learning assessment and recommendations for students
- Provide Socratic-style course tutoring through AI chat
- Keep track of the history of students interactions with the system to enable teachers to monitor quality, intervene when needed, and obtain fine-grained analytics on learning trajectories.
- Support both student and teacher workflows
- Ensure secure, role-based access control

## Tech Stack
- **Frontend Framework**: Next.js 15 with React 18 (TypeScript)
- **Styling**: Tailwind CSS with Radix UI components
- **Backend/Functions**: Firebase Cloud Functions, Firebase Admin SDK
- **Backend**: FastAPI Python micro-services hosted on Google Cloud Run.
- **Database**: Firestore (NoSQL document database)
- **Authentication**: Firebase Authentication (Google OAuth)
- **AI/ML**: Google Genkit 1.20.0 with Google GenAI models (default: gemini-2.5-flash) and DSPy.ai for complex 
- **Data**: Firebase DataConnect (GraphQL layer over Firestore)
- **Testing**: Playwright for E2E tests
- **Dev Tools**: TypeScript 5, pnpm workspace, Node.js
- **Deployment**: Firebase Hosting, App Hosting

More technical details are available in openspecs/specs/project.md
