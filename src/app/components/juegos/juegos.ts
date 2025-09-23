import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-juegos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './juegos.html',
  styleUrls: ['./juegos.scss']
})
export class JuegosComponent {}
