import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './exercises.component.html',
  styleUrl: './exercises.component.scss',
})
export class ExercisesComponent {
  type: number;

  // exercices 1
  isEasy: boolean = true;
  operations = {
    addition: false,
    subtraction: false,
    multiplication: false,
    division: false,
  };

  currentCalculation: { question: string; answer: number } | null = null;
  userAnswer: number | null = null;
  feedback: string | null = null;
  isCorrect: boolean = false;

  // exercices 2
  currentComparison: {
    numbers: (number | string)[];
    expectedRelations: string[];
  } | null = null;
  userRelations: string[] = [];

  // exercices 3
  currentNumber: number | null = null;
  expectedDecomposition: string[] = [];
  userAnswerDecomposition: string | null = '';

  constructor(private routes: ActivatedRoute, private monRouteur: Router) {
    this.type = this.routes.snapshot.params['exercise'];
    this.routes.params.subscribe((params) => {
      const exercise = params['exercise'];
      if (exercise !== this.type) {
        this.type = exercise;
        this.monRouteur.navigate(['exercises', exercise]);
      }
    });
    this.reset();
  }

  startExercise() {
    this.feedback = null;
    this.isCorrect = false;

    if (this.type == 1) {
      this.userAnswer = null;
      const selectedOperations = Object.keys(this.operations).filter(
        (op) => this.operations[op as keyof typeof this.operations]
      );

      if (selectedOperations.length === 0) {
        this.feedback = 'Veuillez sélectionner au moins un type d’opération.';
        return;
      }

      const operation =
        selectedOperations[
          Math.floor(Math.random() * selectedOperations.length)
        ];
      this.currentCalculation = this.generateCalculation(operation);
    } else if (this.type == 2) {
      this.userRelations = [];

      const numbers = this.generateNumbers();
      const expectedRelations = this.generateRelations(numbers);

      this.currentComparison = { numbers, expectedRelations };
    } else {
      this.userAnswerDecomposition = '';
      const randomDecimalPlaces = Math.floor(Math.random() * 4);
      this.currentNumber = parseFloat(
        (Math.random() * (10000 - 10) + 10).toFixed(randomDecimalPlaces)
      );

      this.expectedDecomposition = this.calculateDecomposition(
        this.currentNumber
      );
    }
  }

  generateCalculation(operation: string) {
    const getRandomInt = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    let num1, num2, question, answer;

    switch (operation) {
      case 'addition':
        num1 = getRandomInt(this.isEasy ? 10 : 1000, this.isEasy ? 999 : 99999);
        num2 = getRandomInt(this.isEasy ? 10 : 1000, this.isEasy ? 999 : 99999);
        question = `${num1} + ${num2}`;
        answer = num1 + num2;
        break;

      case 'subtraction':
        num1 = getRandomInt(this.isEasy ? 10 : 1000, this.isEasy ? 999 : 9999);
        num2 = getRandomInt(
          this.isEasy ? 10 : 1000,
          Math.min(num1, this.isEasy ? 999 : 9999)
        ); // Sécurité : le résultat doit être > 0
        question = `${num1} - ${num2}`;
        answer = num1 - num2;
        break;

      case 'multiplication':
        num1 = getRandomInt(this.isEasy ? 100 : 1000, this.isEasy ? 999 : 9999);
        num2 = getRandomInt(this.isEasy ? 1 : 10, this.isEasy ? 99 : 99);
        question = `${num1} x ${num2}`;
        answer = num1 * num2;
        break;

      case 'division':
        num2 = getRandomInt(this.isEasy ? 2 : 10, this.isEasy ? 9 : 99);
        answer = getRandomInt(this.isEasy ? 10 : 100, this.isEasy ? 99 : 999);
        num1 = num2 * answer;
        question = `${num1} ÷ ${num2}`;
        break;

      default:
        throw new Error('Opération non supportée');
    }

    return { question, answer };
  }

  checkAnswer() {
    if (this.userAnswer === this.currentCalculation?.answer) {
      this.feedback = "Bravo, c'est bien la bonne réponse !";
      this.isCorrect = true;
    } else {
      this.feedback = "Ah mince ! Ce n'est pas la bonne réponse, réessaie !";
    }
  }

  reset() {
    this.currentCalculation = null;
    this.userAnswer = null;
    this.feedback = null;
    this.isCorrect = false;
    this.operations = {
      addition: false,
      subtraction: false,
      multiplication: false,
      division: false,
    };

    this.currentComparison = null;
    this.userRelations = [];

    this.currentNumber = null;
    this.userAnswerDecomposition = '';
  }

  generateNumbers(): (number | string)[] {
    const getRandomInt = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    const getFraction = () => {
      const numerator = getRandomInt(1, 20);
      const denominator = getRandomInt(1, 20);
      return `${numerator}/${denominator}`;
    };

    const count = this.isEasy ? getRandomInt(2, 3) : getRandomInt(2, 3);
    const types = this.isEasy
      ? ['integer', 'decimal']
      : ['integer', 'decimal', 'fraction'];

    const numbers = Array.from({ length: count }, () => {
      const type = types[Math.floor(Math.random() * types.length)];
      switch (type) {
        case 'integer':
          return getRandomInt(1, 100);
        case 'decimal':
          return (Math.random() * 100).toFixed(2);
        case 'fraction':
          return getFraction();
        default:
          return 0;
      }
    });

    return numbers;
  }

  generateRelations(numbers: (number | string)[]): string[] {
    const parseValue = (value: number | string): number => {
      if (typeof value === 'string' && value.includes('/')) {
        const [numerator, denominator] = value.split('/').map(Number);
        return numerator / denominator;
      }
      return Number(value);
    };

    const parsedNumbers = numbers.map(parseValue);
    const relations: string[] = [];

    for (let i = 0; i < parsedNumbers.length - 1; i++) {
      if (parsedNumbers[i] < parsedNumbers[i + 1]) relations.push('<');
      else if (parsedNumbers[i] > parsedNumbers[i + 1]) relations.push('>');
      else relations.push('=');
    }

    return relations;
  }

  checkAnswer2() {
    if (
      JSON.stringify(this.userRelations) ===
      JSON.stringify(this.currentComparison?.expectedRelations)
    ) {
      this.feedback = "Bravo, c'est correct !";
      this.isCorrect = true;
    } else {
      this.feedback = 'Mauvaise réponse, réessayez !';
    }
  }

  formatFraction(fraction: string): string {
    if (fraction.includes('/')) {
      const [numerator, denominator] = fraction.split('/');
      return `<span class="fraction"><span class="numerator">${numerator}</span><span class="divider">/</span><span class="denominator">${denominator}</span></span>`;
    }
    return fraction;
  }

  calculateDecomposition(number: number): string[] {
    const decomposition: string[] = [];
    let remaining = number;
    let placeValue = 1;

    while (Math.abs(remaining) > 0.0001) {
      const digit = Math.floor(remaining % 10);
      const part = digit * placeValue;
      if (digit > 0) {
        decomposition.unshift(part.toFixed(remaining % 1 === 0 ? 0 : 3)); // Formatage en fonction des décimales
      }
      remaining = (remaining - part) / 10;
      placeValue *= 10;
    }

    return decomposition;
  }

  checkDecomposition() {
    if (!this.userAnswerDecomposition || !this.currentNumber) {
      this.feedback = 'Veuillez saisir une décomposition.';
      return;
    }

    try {
      const sanitizedInput = this.userAnswerDecomposition
        .replace(/x/g, '*')
        .replace(/\s/g, '');

      const userTotal = eval(sanitizedInput);

      if (Math.abs(userTotal - this.currentNumber) < 0.0001) {
        this.feedback = 'Bravo, la décomposition est correcte !';
        this.isCorrect = true;
      } else {
        this.feedback = `La décomposition est incorrecte. Essayez encore ! (attendu : ${this.currentNumber})`;
      }
    } catch (error) {
      this.feedback =
        'Erreur dans la saisie. Veuillez vérifier votre décomposition.';
    }
  }

  clearInput() {
    this.userAnswerDecomposition = '';
    this.feedback = '';
  }
}
