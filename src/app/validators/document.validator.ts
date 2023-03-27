import { AbstractControl } from '@angular/forms';

export const ValidateDocument =
  (required: boolean, max_size: number, restrict_mime_types: string[] | null = null) => (control: AbstractControl) => {
    // Vérifi si il y a bien un document de type File dans le champ du formulaire
    // si le document est requis dans le formulaire
    if (required && !(control.value instanceof Object && control.value.file instanceof File)) {
      // On retourne l'erreur spécifiant que ce document est requis
      return { required: true };
    }

    // Vérifi si il y a bien un document de type File dans le champ du formulaire
    if (control.value instanceof Object && control.value.file instanceof File && control.value.file.size > max_size) {
      // Return l'erreur spécifiant que le document est trop grand.
      return { maxSize: true };
    }

    if (control.value instanceof Object &&
      control.value.file instanceof File && (restrict_mime_types?.length ?? 0) > 0 &&
      restrict_mime_types?.indexOf(control.value.file.type) === -1) {
      return { invalidMimeType: true };
    } else {
      return null;
    }
  };
