import { Subject, throwError } from 'rxjs';
import { HttpClient, HttpEventType, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, catchError, tap } from "rxjs/operators";
import { Post } from "./post.model";

@Injectable({ providedIn: 'root' })
export class PostsService {

  error = new Subject<string>();

  constructor(private http: HttpClient) {}

  createAndStorePost(title: string, content: string) {
    const postData: Post = { title: title, content: content };
    this.http.post<{ name: string }>('https://ak-ng-complete-guide-default-rtdb.firebaseio.com/posts.json', postData,
        {
          observe: 'response'
        }
      ) // HttpClient vai converter para JSON automático
      .subscribe(responseData => {
        console.log(responseData);
      }, error => {
        this.error.next(error.message);
      });
  }

  fetchPosts() {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('print', 'pretty'); // query Param supported by Firebase
    searchParams = searchParams.append('custom', 'key'); // example param (does nothing)

    return this.http.get<{ [ key: string]: Post}>('https://ak-ng-complete-guide-default-rtdb.firebaseio.com/posts.json',
      {
        headers: new HttpHeaders({'Custom-Header': 'Hello'}),
        params: searchParams,
        responseType: 'json' // default - não precisa explicitar
      }
    ).pipe(
        map(responseData => {
        const postsArray: Post[] = [];
        for (const key in responseData) {
          if (responseData.hasOwnProperty(key)) {
            postsArray.push({ ...responseData[key], id: key });
          }
        }
        return postsArray;
       }),
       catchError(errorRes => {
         // Send to analytics server, log error, etc...
         return throwError(errorRes);
       })
      );
  }

  deletePosts() {
    return this.http.delete('https://ak-ng-complete-guide-default-rtdb.firebaseio.com/posts.json',
      {
        observe: 'events',
        responseType: 'text' // default is 'json'
      }
    ).pipe(
      tap(event => {
        console.log(event);
        if (event.type === HttpEventType.Sent) {
          // ...
        }
        if (event.type === HttpEventType.Response) {
          console.log(event.body);
        }
      })
    );
  }

}
