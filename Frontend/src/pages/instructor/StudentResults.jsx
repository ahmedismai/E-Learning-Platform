import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import examService from "@/api/exam";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, GraduationCap, FileText, ClipboardList } from "lucide-react";
import { Input } from "@/components/ui/input";

const StudentResults = () => {
  const { id } = useParams(); // This would be a courseId in this context
  const [searchTerm, setSearchTerm] = useState("");

  const { data: response = {}, isLoading } = useQuery({
    queryKey: ["instructor", "exam-results", id],
    queryFn: async () => {
      if (!id) return { data: [] };
      return examService.getStudentResults(id);
    },
    enabled: !!id,
  });

  const results = response.data || [];

  const filteredResults = results.filter((res) => {
    const matchesSearch = 
      (res.studentName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (res.examTitle || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!id) {
    return (
      <div className="p-12 text-center space-y-4">
        <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground opacity-20" />
        <h2 className="text-xl font-bold">Select a Course</h2>
        <p className="text-muted-foreground">Please select a course from your dashboard to view student results.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exam Results</h1>
          <p className="text-muted-foreground mt-1">View student performance for this course's assessments</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            className="pl-9 bg-background shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-none shadow-xl overflow-hidden bg-background">
        <CardHeader className="bg-muted/30 border-b pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            Performance Records
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/20 hover:bg-muted/20 border-b">
                <TableHead className="font-bold py-4">Student</TableHead>
                <TableHead className="font-bold py-4">Assessment</TableHead>
                <TableHead className="font-bold py-4 text-center">Score</TableHead>
                <TableHead className="font-bold py-4 text-center">Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.length > 0 ? (
                filteredResults.map((res, index) => (
                  <TableRow key={index} className="hover:bg-primary/5 transition-colors border-b last:border-0">
                    <TableCell className="py-4">
                      <div className="font-bold text-foreground">{res.studentName || "N/A"}</div>
                    </TableCell>
                    <TableCell className="py-4 font-medium">
                      {res.examTitle || "Final Exam"}
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <span className="font-bold text-lg">{res.score}%</span>
                    </TableCell>
                    <TableCell className="py-4 text-center">
                       <Badge variant={res.score >= 50 ? "success" : "destructive"} className="shadow-sm">
                          {res.score >= 50 ? "PASSED" : "FAILED"}
                       </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-60 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-3">
                       <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                          <Search className="w-6 h-6 opacity-20" />
                       </div>
                       <p className="font-medium">No results found for this course.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentResults;

