import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ScriptLoaderService } from '../script-loader.service';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [],
  templateUrl: './games.component.html',
  styleUrl: './games.component.scss',
})
export class GamesComponent {
  game: number;
  games = [
    {
      id: '1',
      title: 'Promenade dans les nuages',
      description:
        "Pilote et dirige pour traverser les nuages en suivant l'opération.",
    },
    {
      id: '2',
      title: 'méli-mélo de calculs',
      description: 'Pas encore fini',
    },
  ];

  constructor(
    private monRouteur: Router,
    private routes: ActivatedRoute,
    private scriptLoader: ScriptLoaderService
  ) {
    this.game = this.routes.snapshot.params['game'];
    this.routes.params.subscribe((params) => {
      const game = params['game'];
      if (game !== this.game) {
        this.game = game;
        this.monRouteur.navigate(['games', game]);
      }
    });
  }

  ngOnInit(): void {
    this.routes.params.subscribe((params) => {
      const gameId = params['game'];
      if (gameId) {
        console.log(gameId);
        this.scriptLoader
          .loadScript('assets/games/script' + gameId + '.js')
          .then(() => {
            console.log('Script chargé avec succès!');
          })
          .catch((err) => {
            console.error('Erreur lors du chargement du script:', err);
          });
      }
    });
  }
}
