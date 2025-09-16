import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';

interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  bio: string;
  location: string;
  public_repos: number;
  followers: number;
  html_url: string;
}

@Component({
  selector: 'app-quien-soy',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  templateUrl: './quien-soy.html',
  styleUrls: ['./quien-soy.scss']
})
export class QuienSoyComponent {
  private githubUsername = 'matibbaez';
  user$: Observable<GitHubUser>;

  constructor(private http: HttpClient) {
    this.user$ = this.http.get<GitHubUser>(
      `https://api.github.com/users/${this.githubUsername}`
    );
  }
}





