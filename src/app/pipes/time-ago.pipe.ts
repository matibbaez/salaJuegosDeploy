// src/app/pipes/time-ago.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
  standalone: true // Importante para pipes standalone en Angular 15+
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: string | Date): string {
    if (!value) return '';

    const date = new Date(value);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) {
      return 'hace unos segundos';
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `hace ${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `hace ${hours}h`;
    }

    const days = Math.floor(hours / 24);
    if (days < 30) {
      return `hace ${days}d`;
    }

    const months = Math.floor(days / 30);
    if (months < 12) {
      return `hace ${months}M`;
    }

    const years = Math.floor(months / 12);
    return `hace ${years}a`;
  }
}