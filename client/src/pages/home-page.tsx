import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useLocation } from "wouter";
import { Lecture } from "@shared/schema";
import { Loader2, Search } from "lucide-react";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [filters, setFilters] = useState({
    topic: "",
    location: "",
    school: "",
    branch: "",
    isLive: false as boolean | "",
  });

  const { data: lectures, isLoading } = useQuery<Lecture[]>({
    queryKey: [
      "/api/lectures",
      filters.topic && `topic=${filters.topic}`,
      filters.location && `location=${filters.location}`,
      filters.school && `school=${filters.school}`,
      filters.branch && `branch=${filters.branch}`,
      filters.isLive !== "" && `isLive=${filters.isLive}`,
    ].filter(Boolean).join("&"),
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-xl font-bold">LectureStream</h1>
          <div className="flex items-center gap-4">
            <span>Welcome, {user?.username}</span>
            <Button
              variant="outline"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid gap-6">
          <div className="flex flex-wrap gap-4">
            <Input
              placeholder="Search by topic..."
              value={filters.topic}
              onChange={(e) =>
                setFilters((f) => ({ ...f, topic: e.target.value }))
              }
              className="max-w-xs"
            />
            <Input
              placeholder="Filter by location..."
              value={filters.location}
              onChange={(e) =>
                setFilters((f) => ({ ...f, location: e.target.value }))
              }
              className="max-w-xs"
            />
            <Input
              placeholder="Filter by school..."
              value={filters.school}
              onChange={(e) =>
                setFilters((f) => ({ ...f, school: e.target.value }))
              }
              className="max-w-xs"
            />
            <Input
              placeholder="Filter by branch..."
              value={filters.branch}
              onChange={(e) =>
                setFilters((f) => ({ ...f, branch: e.target.value }))
              }
              className="max-w-xs"
            />
            <Button
              variant="outline"
              onClick={() =>
                setFilters((f) => ({ ...f, isLive: f.isLive === "" ? true : "" }))
              }
              className={filters.isLive ? "bg-primary text-primary-foreground" : ""}
            >
              Live Only
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-border" />
            </div>
          ) : !lectures?.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mb-4" />
              <p>No lectures found matching your filters</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lectures.map((lecture) => (
                <Card
                  key={lecture.id}
                  className="cursor-pointer transition-shadow hover:shadow-lg"
                  onClick={() => setLocation(`/stream/${lecture.id}`)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {lecture.title}
                      {lecture.isLive && (
                        <span className="text-sm bg-red-500 text-white px-2 py-1 rounded">
                          LIVE
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {lecture.description}
                    </p>
                    <div className="text-sm space-y-1">
                      <p>Topic: {lecture.topic}</p>
                      <p>School: {lecture.school}</p>
                      <p>Location: {lecture.location}</p>
                      <p>Branch: {lecture.branch}</p>
                      <p>Semester: {lecture.semester}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
