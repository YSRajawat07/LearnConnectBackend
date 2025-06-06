import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Lecture } from "@shared/schema";
import { ArrowLeft, Loader2 } from "lucide-react";
import ReactPlayer from 'react-player';

export default function StreamPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const { data: lecture, isLoading } = useQuery<Lecture>({
    queryKey: [`/api/lectures/${id}`],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!lecture) {
    return (
      <div className="container py-8">
        <Button
          variant="outline"
          onClick={() => setLocation("/")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Lectures
        </Button>
        <Card className="p-6">
          <p>Lecture not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <Button
          variant="outline"
          onClick={() => setLocation("/")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Lectures
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="aspect-video">
              <ReactPlayer
                url={lecture.streamUrl}
                width="100%"
                height="100%"
                controls
                playing={lecture.isLive}
              />
            </Card>
          </div>

          <Card className="p-6">
            <h1 className="text-2xl font-bold mb-2">{lecture.title}</h1>
            <p className="text-muted-foreground mb-4">{lecture.description}</p>
            
            <div className="space-y-2">
              <p><strong>Topic:</strong> {lecture.topic}</p>
              <p><strong>School:</strong> {lecture.school}</p>
              <p><strong>Location:</strong> {lecture.location}</p>
              <p><strong>Branch:</strong> {lecture.branch}</p>
              <p><strong>Semester:</strong> {lecture.semester}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span className={lecture.isLive ? "text-red-500" : ""}>
                  {lecture.isLive ? "Live Now" : "Recorded"}
                </span>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
