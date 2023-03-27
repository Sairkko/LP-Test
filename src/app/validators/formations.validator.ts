import { AbstractControl } from '@angular/forms';

export function ValidateFormations(control: AbstractControl) {

  // Vérifie s'il y a au moins une entrée du tableau de formations sélectionnées qui vaut true
  if (control.value instanceof Array && control.value.filter(value => value === true).length === 0) {
    // Retourne l'erreur qui est survenue lors de la validation
    return { minFormations: true };
  }

  // Vérifie s'il y a plus de `maxFormations` entrées du tableau de formations sélectionnées qui valent true
  if (control.value instanceof Array && control.value.filter(value => value === true).length > 3) {
    // Retourne l'erreur qui est survenue lors de la validation
    return { maxFormations: true };
  }

  // Retourne null si aucune erreur
  return null;
}
