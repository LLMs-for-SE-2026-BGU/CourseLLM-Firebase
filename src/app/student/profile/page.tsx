'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { students, quizzes as initialQuizzes, learningObjectives as initialLOs } from '@/lib/mock-data';
import { BookOpen, CheckCircle, Clock, Trophy, ArrowRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { Quiz, LearningObjective } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { courses } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';

export default function StudentProfilePage() {
  const student = students[0];
  const [quizzes, setQuizzes] = useState<Quiz[]>(initialQuizzes);
  const [learningObjectives, setLearningObjectives] = useState<LearningObjective[]>(initialLOs);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Load persisted results on mount
  useEffect(() => {
    const storedResults = localStorage.getItem('quizResults');
    if (storedResults) {
        const parsedResults = JSON.parse(storedResults);
        
        // Update Quizzes with stored results
        const updatedQuizzes = initialQuizzes.map(q => {
            if (parsedResults[q.id]) {
                return { ...q, ...parsedResults[q.id] };
            }
            return q;
        });

        // Also check for any NEWLY created quizzes in storage
        const storedNewQuizzes = localStorage.getItem('newQuizzes');
        let newQuizzes: Quiz[] = [];
        if (storedNewQuizzes) {
            newQuizzes = JSON.parse(storedNewQuizzes);
            // Update status of new quizzes if they have results
             newQuizzes = newQuizzes.map(q => {
                if (parsedResults[q.id]) {
                    return { ...q, ...parsedResults[q.id] };
                }
                return q;
            });
        }

        setQuizzes([...updatedQuizzes, ...newQuizzes]);

        // Update LOs... (logic remains same)
        let updatedLOs = [...initialLOs];
        Object.values(parsedResults).forEach((result: any) => {
            if (result.loUpdates) {
                result.loUpdates.forEach((update: any) => {
                    updatedLOs = updatedLOs.map(lo => {
                        if (lo.id === update.loId) {
                            const newProgress = Math.min(100, Math.max(0, lo.progress + update.delta));
                            return {
                                ...lo,
                                progress: newProgress,
                                status: newProgress >= 90 ? 'mastered' : newProgress > 0 ? 'in-progress' : 'not-started'
                            };
                        }
                        return lo;
                    });
                });
            }
        });
        setLearningObjectives(updatedLOs);
    }
  }, []);

  const handleCreateQuiz = () => {
    if (!selectedCourseId) return;

    const course = courses.find(c => c.id === selectedCourseId);
    if (!course) return;

    const newQuiz: Quiz = {
        id: `quiz-${course.id}-${Date.now()}`, // Encoded ID for server-side fallback
        title: `Practice: ${course.title}`,
        courseId: course.id,
        score: 0,
        totalQuestions: 5, // Default
        dateTaken: '',
        status: 'pending'
    };

    // Persist new quiz
    const storedNewQuizzes = JSON.parse(localStorage.getItem('newQuizzes') || '[]');
    storedNewQuizzes.push(newQuiz);
    localStorage.setItem('newQuizzes', JSON.stringify(storedNewQuizzes));

    // Update state
    setQuizzes(prev => [...prev, newQuiz]);
    setIsDialogOpen(false);
    setSelectedCourseId("");
    
    toast({
        title: "Quiz Created",
        description: `New practice quiz for ${course.title} has been added to your list.`,
    });
  };
  
  // Calculate stats
  const completedQuizzes = quizzes.filter(q => q.status === 'completed');
  const averageScore = completedQuizzes.length > 0 
    ? completedQuizzes.reduce((acc, q) => acc + (q.score / q.totalQuestions) * 100, 0) / completedQuizzes.length
    : 0;
  const masteredLOs = learningObjectives.filter(lo => lo.status === 'mastered');
  const totalLOs = learningObjectives.length;
  const overallProgress = (masteredLOs.length / totalLOs) * 100;

  return (
    <div className="flex flex-col space-y-6">
      {/* Header Section */}
      <div className="flex items-center gap-4 md:gap-8">
        <Avatar className="h-20 w-20 md:h-24 md:w-24 border-4 border-white shadow-lg">
          <AvatarImage src={student.avatarUrl} alt={student.name} />
          <AvatarFallback>{student.name.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{student.name}</h1>
          <p className="text-muted-foreground">Computer Science Student</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Quiz Score</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Across {completedQuizzes.length} quizzes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LO Mastery</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{masteredLOs.length} / {totalLOs}</div>
            <p className="text-xs text-muted-foreground">Objectives Mastered</p>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{Math.round(overallProgress)}%</div>
                 <Progress value={overallProgress} className="mt-2" />
            </CardContent>
        </Card>
      </div>

      {/* Tabs Content */}
      <Tabs defaultValue="quizzes" className="space-y-4">
        <div className="flex items-center justify-between">
            <TabsList>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="learning-objectives">Learning Objectives</TabsTrigger>
            </TabsList>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Create New Quiz
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create a Practice Quiz</DialogTitle>
                        <DialogDescription>
                            Select a course to generate a new personalized practice assessment.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a course..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map((course) => (
                                        <SelectItem key={course.id} value={course.id}>
                                            {course.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateQuiz} disabled={!selectedCourseId}>Create Quiz</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
        
        <TabsContent value="quizzes" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className={quiz.status === 'pending' ? 'border-l-4 border-l-yellow-500' : 'border-l-4 border-l-green-500'}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{quiz.title}</CardTitle>
                    <Badge variant={quiz.status === 'completed' ? 'default' : 'secondary'}>
                      {quiz.status === 'completed' ? 'Completed' : 'Pending'}
                    </Badge>
                  </div>
                  <CardDescription>Course: {quiz.courseId}</CardDescription>
                </CardHeader>
                <CardContent>
                  {quiz.status === 'completed' ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Score</span>
                        <span className="font-bold">{quiz.score} / {quiz.totalQuestions}</span>
                      </div>
                      <Progress value={(quiz.score / quiz.totalQuestions) * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground pt-2">Taken on {quiz.dateTaken}</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{quiz.totalQuestions} Questions • Estimated 15 mins</span>
                    </div>
                  )}
                </CardContent>
                {quiz.status === 'pending' && (
                    <div className="px-6 pb-6">
                        <Link href={`/student/assessments/${quiz.id}`} passHref>
                            <Button className="w-full">
                                Start Quiz <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="learning-objectives" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Learning Objectives Tracker</CardTitle>
              <CardDescription>Track your mastery of key course concepts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {learningObjectives.map((lo) => (
                <div key={lo.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium leading-none">{lo.description}</p>
                      <p className="text-sm text-muted-foreground">Course: {lo.courseId}</p>
                    </div>
                    <div className="flex items-center gap-2">
                         <span className="text-sm font-medium text-muted-foreground">{Math.round(lo.progress)}%</span>
                        <Badge variant={lo.status === 'mastered' ? 'default' : lo.status === 'in-progress' ? 'secondary' : 'outline'}>
                        {lo.status === 'mastered' ? 'Mastered' : lo.status === 'in-progress' ? 'In Progress' : 'Not Started'}
                        </Badge>
                    </div>
                   
                  </div>
                  <Progress value={lo.progress} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
