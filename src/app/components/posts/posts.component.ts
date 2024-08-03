import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PostService } from '../../services/post.service';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { IPost } from '../../types/post.interface';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { finalize, pipe, switchMap, tap } from 'rxjs';

export const PostsStore = signalStore(
  withState<IPostsState>({
    posts: [],
    error: null,
    isLoading: false,
  }),
  withComputed((store) => ({
    postsCount: computed(() => store.posts().length),
  })),
  withMethods((store, postService = inject(PostService)) => ({
    addPost(title: string) {
      const newPost: IPost = {
        id: crypto.randomUUID(),
        title: title,
      };

      const updatedPosts = [...store.posts(), newPost];
      patchState(store, { posts: updatedPosts });
    },
    removePost(id: string) {
      const updatedPosts = store.posts().filter((post) => post.id !== id);
      patchState(store, { posts: updatedPosts });
    },
    loadPosts: rxMethod<void>(
      pipe(
        switchMap(() => {
          patchState(store, { isLoading: true });
          return postService.getPosts().pipe(
            tap((posts) => patchState(store, { posts })),
            finalize(() => {
              patchState(store, { isLoading: false });
            })
          );
        })
      )
    ),
  })),
  withHooks({
    onInit(store) {
      store.loadPosts();
    },
  })
);
export interface IPostsState {
  posts: IPost[];
  error: string | null;
  isLoading: boolean;
}
@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.scss',
  providers: [PostsStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostsComponent {
  formBuilder = inject(FormBuilder);
  postService = inject(PostService);
  store = inject(PostsStore);
  // state = signalState<IPostsState>({
  //   posts: [],
  //   error: null,
  //   isLoading: false,
  // });
  addForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.minLength(3)]],
  });
  onAdd() {
    this.store.addPost(this.addForm.getRawValue().title);
    this.addForm.reset();
  }
  onDelete(id: string) {
    this.store.removePost(id);
  }
}
