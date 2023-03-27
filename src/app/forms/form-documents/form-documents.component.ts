import { Component, EventEmitter, Output } from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup} from '@angular/forms';
import { AppService } from '../../app.service';
import { ToastrService } from 'ngx-toastr';
import { ValidateDocument } from '../../validators/document.validator';
import { forkJoin, of } from 'rxjs';
import { DocumentProfil360 } from '../../app.models';
import { catchError, last, map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-form-documents',
  templateUrl: './form-documents.component.html',
  styleUrls: ['./form-documents.component.css']
})
export class FormDocumentsComponent {

  @Output() nextStep: EventEmitter<string> = new EventEmitter();
  public isLoading = false;
  public formDocuments!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public appService: AppService,
    private toastr: ToastrService,
  )
  {
    this.formDocuments = this.fb.group({
      cv: [{file: null, isUploading: false, isFinished: false, progress: 0},
        ValidateDocument(true, 9.5 * 1024 * 1024)],
      lettre_motivation: [{
        file: null,
        isUploading: false,
        isFinished: false,
        progress: 0
      }, ValidateDocument(false, 9.5 * 1024 * 1024)],
      diplome: [{file: null, isUploading: false, isFinished: false, progress: 0},
        ValidateDocument(false, 9.5 * 1024 * 1024)]
    });
  }

  get f() {
    return this.formDocuments.controls;
  }

  onFileChange(event :any, control: AbstractControl) {
    control.markAsTouched();
    control.patchValue({
      ...control.value,
      file: event.target.files[0]
    });
  }

  uploadDocument(control: AbstractControl, intitule: string, type: string) {
    if (control.value.file == null) {
      return of(null);
    }
    control.patchValue({
      ...control.value,
      isUploading: true,
    });

    return this.appService.sendDocumentCandidat(this.appService.id_profil360, intitule, type, control.value.file)
      .pipe(
        map(event => AppService.handleUploadProgress(event)),
        tap((progress) => {
          control.patchValue({
            ...control.value,
            progress: Math.round(progress),
          });
        }),
        last()
      ).pipe(
        map((data: any) => {
          control.patchValue({
            ...control.value,
            isUploading: false,
            isFinished: true,
          });
          return data;
        }),
        catchError(() => {
          control.patchValue({
            ...control.value,
            isUploading: false,
            isFinished: true,
          });
          return of(null);
        })
      );
  }

  uploadAllDocuments() {
    const observables = [
      this.uploadDocument(
        this.f['cv'],
        'CV',
        DocumentProfil360.TYPE_CV
      ),
      this.uploadDocument(
        this.f['lettre_motivation'],
        'Lettre de motivation',
        DocumentProfil360.TYPE_LETTRE_MOTIVATION
      ),
      this.uploadDocument(
        this.f['diplome'],
        'Votre diplôme',
        DocumentProfil360.TYPE_DIPLOME_OU_JUSTIFICATIF_OBTENTION
      ),
    ];

    this.isLoading = true;
    forkJoin(observables).subscribe({
      next: () => {
        this.isLoading = false;
        this.nextStep.emit('STEP_FINAL');
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error(`Echec de l'envoi des documents, merci de réessayer`);
      }
    });
  }

  onSubmitDocuments() {
    if (this.formDocuments.valid) {
      this.uploadAllDocuments();
    } else {
      this.appService.handleFormError(this.formDocuments);
    }
  }
}
