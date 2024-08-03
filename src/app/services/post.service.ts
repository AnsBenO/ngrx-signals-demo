import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { IPost } from '../types/post.interface';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  getPosts(): Observable<IPost[]> {
    const posts = [
      { id: '1', title: 'first post' },
      { id: '2', title: 'second post' },
      { id: '3', title: 'third post' },
      { id: '4', title: 'fourth post' },
      { id: '5', title: 'fifth post' },
    ];

    return of(posts).pipe(delay(2000));
  }
}
