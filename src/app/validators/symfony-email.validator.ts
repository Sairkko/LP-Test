import { AbstractControl } from '@angular/forms';

export function SymfonyEmailValidator(control: AbstractControl) {
  // Valide un email avec la RFC 2822
  // eslint-disable-next-line max-len
  const email_patern = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

  // Vérifi si il y a une url valide
  if (control.value && control.value.length > 0  && control.value.length < 2083 && !email_patern.test(control.value)) {
    // Retourne l'erreur qui est survenue lors de la validation
    return { email: true };
  }
  // Return null si aucune erreur
  return null;
}
