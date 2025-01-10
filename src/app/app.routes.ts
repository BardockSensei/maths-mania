import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LessonsComponent } from './lessons/lessons.component';
import { GamesComponent } from './games/games.component';
import { ExercisesComponent } from './exercises/exercises.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'lessons', component: LessonsComponent },
  { path: 'lessons/:level', component: LessonsComponent },
  { path: 'games', component: GamesComponent },
  { path: 'games/:game', component: GamesComponent },
  { path: 'exercises', component: ExercisesComponent },
  { path: 'exercises/:exercise', component: ExercisesComponent },
];
