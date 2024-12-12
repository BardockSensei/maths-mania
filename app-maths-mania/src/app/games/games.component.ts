import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ScriptLoaderService } from '../script-loader.service';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss'],
})
export class GamesComponent implements OnInit {
  games = [
    {
      id: '1',
      title: 'Promenade dans les nuages',
      description: 'Description courte du Jeu 1.',
      image: 'assets/jeu_1.jpg',
    },
    {
      id: '2',
      title: 'Le compte est bon !',
      description:
        "Jeu de calcul et de réflexion où l'objectif est d'atteindre un nombre cible en utilisant un ensemble de chiffres et de signes mathématiques (addition, soustraction, multiplication et division) et cela, avant que le temps ne soit écoulé ! Ce jeu mettra à l'épreuve vos compétences en calcul mental tout en vous offrant un défi stimulant et captivant !",
      image: 'assets/jeu_2.jpg',
    },
  ];

  targetNumber: number = 0;
  numbers: number[] = [];
  operations: string[] = ['+', '-', '×', '÷'];
  timer: number = 300; // 5 minutes
  gameInProgress: boolean = false;
  gameStarted: boolean = false;
  timerInterval: any;
  userAnswer: number = 0;
  emptyCases: any[] = [null, null, null, null, null, null, null, null, null];
  generatedExpression: any[] = [];
  selectedGame: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private scriptLoader: ScriptLoaderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const gameId = params['game'];
      if (gameId) {
        this.selectedGame = this.games.find((game) => game.id === gameId);
        if (this.selectedGame?.id === '2') {
          this.startNewGame();
        } else {
          console.log('bingo');
          this.scriptLoader
            .loadScript('assets/games/script.js')
            .then(() => {
              console.log('Script chargé avec succès!');
            })
            .catch((err) => {
              console.error('Erreur lors du chargement du script:', err);
            });
        }
      } else {
        this.selectedGame = null;
      }
    });
  }

  startNewGame() {
    this.timer = 300;
    clearInterval(this.timerInterval);
    this.emptyCases = [null, null, null, null, null, null, null, null, null];

    let validExpression = false;
    while (!validExpression) {
      this.numbers = this.generateRandomNumbers(5);
      this.generatedExpression = this.generateExpression(this.numbers);

      this.targetNumber = this.calculateResult(this.generatedExpression);

      if (
        Number.isInteger(this.targetNumber) &&
        this.targetNumber > 0 &&
        this.targetNumber < 1000
      ) {
        validExpression = true;
      }
    }

    this.gameInProgress = true;
    this.startTimer();
    console.log('Target Number:', this.targetNumber);
    console.log('Generated Expression:', this.generatedExpression);
  }

  generateRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  generateRandomNumbers(count: number): number[] {
    let numbers: number[] = [];
    for (let i = 0; i < count; i++) {
      numbers.push(this.generateRandomNumber(1, 9));
    }
    return numbers;
  }

  generateExpression(numbers: number[]): any[] {
    let expression: any[] = [];
    let operationsCount = numbers.length - 1;

    expression.push(numbers[0]);

    for (let i = 1; i < numbers.length; i++) {
      const randomOperator =
        this.operations[
          this.generateRandomNumber(0, this.operations.length - 1)
        ];
      expression.push(randomOperator);
      expression.push(numbers[i]);
    }

    return expression;
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.timer > 0) {
        this.timer--;
      } else {
        clearInterval(this.timerInterval);
        this.endGame('timeOut');
      }
    }, 1000);
  }

  startDrag(event: MouseEvent, item: any) {
    const draggedItem = event.target as HTMLElement;
    draggedItem.style.position = 'absolute';
    draggedItem.style.zIndex = '1000';

    const moveAt = (pageX: number, pageY: number) => {
      draggedItem.style.left = pageX - draggedItem.clientWidth / 2 + 'px';
      draggedItem.style.top = pageY - draggedItem.clientHeight / 2 + 'px';
    };

    moveAt(event.pageX, event.pageY);

    const onMouseMove = (event: MouseEvent) => {
      moveAt(event.pageX, event.pageY);
    };

    document.addEventListener('mousemove', onMouseMove);

    draggedItem.onmouseup = (event: MouseEvent) => {
      document.removeEventListener('mousemove', onMouseMove);
      draggedItem.onmouseup = null;

      // Logique pour détecter où l'élément a été déposé
      const caseIndex = this.findCaseIndex(event.pageX, event.pageY);
      if (caseIndex !== -1) {
        this.emptyCases[caseIndex] = item;
        const caseElement = document.querySelectorAll('.case')[
          caseIndex
        ] as HTMLElement;
        caseElement.classList.add('occupied');
      }
      draggedItem.style.position = 'static'; // Revenir à la position normale
    };
  }

  findCaseIndex(pageX: number, pageY: number): number {
    const cases = document.querySelectorAll('.case'); // Récupérer toutes les cases
    for (let i = 0; i < cases.length; i++) {
      const caseElement = cases[i] as HTMLElement;
      const rect = caseElement.getBoundingClientRect();

      // Vérifier si les coordonnées du drop sont à l'intérieur de la case
      if (
        pageX >= rect.left &&
        pageX <= rect.right &&
        pageY >= rect.top &&
        pageY <= rect.bottom
      ) {
        return i; // Retourner l'index de la case
      }
    }
    return -1; // Si aucune case valide n'est trouvée
  }

  removeItemFromCase(event: MouseEvent, caseIndex: number) {
    const caseElement = event.target as HTMLElement;
    this.emptyCases[caseIndex] = null;
    caseElement.classList.remove('occupied');
  }

  endGame(result: string) {
    this.gameInProgress = false;
    clearInterval(this.timerInterval);
    const expressionString = this.generatedExpression.join(' ');
    if (result === 'win') {
      alert(
        `Bravo, vous avez gagné ! Votre score est : ${this.timer} secondes. Une autre solution possible était : ${expressionString}`
      );
      this.askToReplay();
    } else if (result === 'timeOut') {
      alert(
        `Temps écoulé ! Une solution possible était : ${expressionString}.`
      );
      this.askToReplay();
    }
  }

  askToReplay() {
    const playAgain = confirm('Voulez-vous rejouer ?');
    if (playAgain) {
      this.startNewGame();
    } else {
      this.router.navigate(['/games']); // Retour à la liste des jeux
    }
  }

  checkAnswer() {
    const numbersInCases = this.emptyCases
      .filter((item) => item !== null)
      .map((item) => item);

    // Appliquer les opérations et calculer le résultat
    let result = this.calculateResult(numbersInCases);

    // Vérifier si le résultat est égal au targetNumber
    if (result === this.targetNumber) {
      this.endGame('win');
    } else {
      alert("Désolé, ce n'est pas la bonne réponse. Essayez encore !");
    }
  }

  calculateResult(items: any[]): number {
    let result = ''; // L'expression sous forme de chaîne
    let currentNumber = ''; // Nombre en construction

    // Parcourir chaque élément dans le tableau
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (typeof item === 'number') {
        // Si l'élément est un nombre, ajouter au nombre en construction
        currentNumber += item.toString();
      } else if (
        typeof item === 'string' &&
        (item === '+' || item === '-' || item === '×' || item === '÷')
      ) {
        // Si l'élément est un opérateur, ajouter le nombre précédent au résultat
        result += currentNumber + ' ' + item + ' ';
        currentNumber = ''; // Réinitialiser pour construire le prochain nombre
      }
    }

    // Ajouter le dernier nombre restant à l'expression
    result += currentNumber;

    // Remplacer les opérateurs de multiplication '×' et division '÷' par '*' et '/'
    result = result.replace(/×/g, '*').replace(/÷/g, '/');
    console.log(result);
    // Utiliser eval pour évaluer l'expression arithmétique
    try {
      return eval(result);
    } catch (e) {
      console.error("Erreur lors de l'évaluation de l'expression :", e);
      return NaN;
    }
  }

  showSolution() {
    console.log('soluce button show');
  }

  navigateToGame(gameId: string): void {
    if (gameId == '1') {
      window.location.replace('/games/1');
    } else {
      this.router.navigate(['/games', gameId]);
    }
  }

  navigateToGames() {
    let pauseButton = document.querySelector('#pauseButton');
    if (pauseButton) {
      pauseButton.remove();
    }

    let replayButton = document.querySelector('#replayButton');
    if (replayButton) {
      replayButton.remove();
    }
    this.router.navigate(['/games']);
  }
}
