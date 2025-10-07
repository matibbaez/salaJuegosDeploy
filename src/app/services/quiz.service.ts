import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export type Question = {
  question: string;
  options: string[];
  correctIndex: number;
};

export type QuizData = {
  [key: string]: Question[];
};

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private quizDataUrl = 'preguntas.json';

  constructor(private http: HttpClient) {}

  getQuizTopics(): Observable<string[]> {
    return this.http.get<QuizData>(this.quizDataUrl).pipe(
      map(data => Object.keys(data))
    );
  }

  getQuestionsByTopic(topic: string): Observable<Question[]> {
    return this.http.get<QuizData>(this.quizDataUrl).pipe(
      map(data => data[topic] || [])
    );
  }
}