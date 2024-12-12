import { Routes } from '@angular/router';
import { LessonsComponent } from './lessons/lessons.component';
import { ExercisesComponent } from './exercises/exercises.component';
import { GamesComponent } from './games/games.component';
import { HelpComponent } from './help/help.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'lessons', component: LessonsComponent },
  { path: 'lessons/:level', component: LessonsComponent },
  { path: 'games', component: GamesComponent },
  { path: 'games/:game', component: GamesComponent },
  { path: 'help', component: HelpComponent },
  { path: 'exercises', component: ExercisesComponent },
];
