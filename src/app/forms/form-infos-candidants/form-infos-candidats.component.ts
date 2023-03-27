import {Component, EventEmitter, Output} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {NgbDateStruct} from "@ng-bootstrap/ng-bootstrap";
import {SymfonyEmailValidator} from "../../validators/symfony-email.validator";
import {catchError, debounceTime, distinctUntilChanged, flatMap, switchMap, tap} from "rxjs/operators";
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../app.service';
import {forkJoin, of} from "rxjs";


@Component({
  selector: 'app-form-infos-candidats',
  templateUrl: './form-infos-candidats.component.html',
  styleUrls: ['./form-infos-candidats.component.css']
})
export class FormInfosCandidatsComponent {
  public formInfosCandidats: FormGroup;
  public maxDateNaissance: NgbDateStruct;
  public minDateNaissance: NgbDateStruct;
  public candidat_age: any = null;
  public responsableOn = false;
  public isLoading = false;
  @Output() nextStep: EventEmitter<string> = new EventEmitter();
  @Output() dataCandidat: EventEmitter<string> = new EventEmitter();


  public telephonePattern = {
    '0': { pattern: new RegExp('\[0-9\]')},
    'Z': { pattern: new RegExp('\[0-9\+\]')},
  };
  constructor(
    private fb: FormBuilder,
    private appService: AppService,
    private toastr: ToastrService
  )
  {
    this.formInfosCandidats = this.fb.group(
      {
        civilite: ['', Validators.required],
        nom: ['',[Validators.required, Validators.maxLength(45)]],
        prenom: ['', [Validators.required,Validators.maxLength(45)]],
        date_naissance: ['', Validators.required],
        portable: ['',[Validators.required, Validators.maxLength(23)]],
        email: ['', [Validators.required, Validators.maxLength(255), SymfonyEmailValidator]],
        adresse: ['', [Validators.required, Validators.maxLength(255)]],
        code_postal: ['', [Validators.required, Validators.maxLength(7)]],
        responsable_legal: this.fb.array([])
      }
    );

    const now = new Date();

    this.maxDateNaissance = {
      year: now.getFullYear(),
      month: (now.getMonth() + 1),
      day: now.getDate()
    };

    this.minDateNaissance = {
      year: 1930,
      month: 1,
      day: 1
    };
    this.f['date_naissance'].valueChanges.subscribe(
      (value) => {
        this.responsableLegal.controls = [];
        const candidat_date = new Date(value);
        const date_diff = new Date(Date.now() - candidat_date.getTime());
        this.candidat_age = Math.abs(date_diff.getUTCFullYear() - 1970);
        if (this.candidat_age != null && this.candidat_age < 18) {
          this.addResponsableLegal();
          this.responsableOn = true;
          this.appService.setDataCandidat(true);
        } else {
          this.responsableOn = false;
          this.removeResponsableLegal(0);
          this.appService.setDataCandidat(false);
        }
      }
    );
    this.f['nom'].valueChanges.subscribe(
      (value) => {
        this.f['nom'].patchValue(value.toUpperCase(), {emitEvent: false})
      }
    )
  }

  get f() {
    return this.formInfosCandidats.controls;
  }

  get responsableLegal(): FormArray {
    return this.f['responsable_legal'] as FormArray;
  }

  newResponsableLegal(): FormGroup {
    return this.fb.group({
      civilite: ['', [Validators.required, Validators.maxLength(45)]],
      nom: ['', [Validators.required, Validators.maxLength(45)]],
      prenom: ['', [Validators.required, Validators.maxLength(45)]],
      portable: ['', [Validators.required, Validators.maxLength(23)]],
      email: ['', [Validators.required, SymfonyEmailValidator]],
      adresse: ['', [Validators.required, Validators.maxLength(255)]],
      code_postal: ['', [Validators.required, Validators.maxLength(7)]],
      ville: ['', Validators.maxLength(163)]
      }
    )
  }

  addResponsableLegal() {
    this.responsableLegal.push(this.newResponsableLegal());
  }

  removeResponsableLegal(i: number) {
    this.responsableLegal.removeAt(i);
  }

  CreateResponsableLegal(formGroup: FormGroup) {
    const responsableLegal = {
      ...formGroup.value,
      statut_juridique: 'A',
      profession: 'Non renseignée',
      complement_adresse: '',
      commentaire_parent: '',
      ville: 'Non renseigné',
      adresse: 'Non renseigné',
      code_postal: 'Inconnu',
      telephone: 'Non renseigné',
      civilite: 'H',
    };
    if (
      !formGroup.value.civilite &&
      !formGroup.value.nom &&
      !formGroup.value.prenom &&
      !formGroup.value.portable &&
      !formGroup.value.email &&
      !formGroup.value.adresse &&
      !formGroup.value.code_postal &&
      !formGroup.value.ville) {
      return of(null);
    }
    if (formGroup.disabled){
      return of (null);
    }
    return this.appService.postResponsableLegal(responsableLegal);
  }

  createProfil360() {
    //Suppression des espaces dans le portable
    const observables: any = [];
    this.appService.createProfilCandidat(this.formInfosCandidats.value).pipe(
      flatMap(() => {
        if (this.responsableLegal.controls.length > 0) {
          this.responsableLegal.controls.forEach((element) => {
            observables.push(this.CreateResponsableLegal(element as FormGroup));
          });
          return forkJoin(observables);
        } else {
          return of(null);
        }
      })
    ).subscribe(
      () => {
        this.nextStep.emit('STEP_2');
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        this.toastr.error(`Veuillez réessayer ultérieurement`, `Echec de la création de la candidature`);
      }
    );
  }

  onSubmitInfoCandidat() {
    if (this.formInfosCandidats.valid) {
      this.createProfil360();
    } else {
      this.appService.handleFormError(this.formInfosCandidats);
    }
  }

}
