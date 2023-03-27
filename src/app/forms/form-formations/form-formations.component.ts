import {Component, EventEmitter, Input, OnChanges, Output, ViewEncapsulation} from '@angular/core';
import {Formation} from '../../app.models';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {AppService} from '../../app.service';
import {ToastrService} from 'ngx-toastr';
import {forkJoin, of} from 'rxjs';
import {ValidateFormations} from '../../validators/formations.validator';
import {catchError} from "rxjs/operators";

@Component({
  selector: 'app-form-formations',
  templateUrl: './form-formations.component.html',
  styleUrls: ['./form-formations.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class FormFormationsComponent implements OnChanges {

  @Input() formationsGotten!: Formation[];
  @Output() nextStep: EventEmitter<string> = new EventEmitter();

  public formations!: (Formation & { niveau_cfai: string })[];
  public maxFormationSelectionable = 3;
  private isFormCapped = false;
  public isLoading = false;
  public formFormationCandidat!: FormGroup;
  public niveaux!: string[];

  constructor(
    private fb: FormBuilder,
    private appService: AppService,
    private toastr: ToastrService,
  ) {
    this.createFormFormations();
  }

  get f() {
    return this.formFormationCandidat.controls;
  }

  ngOnChanges() {
    if (this.formationsGotten?.length === 0) {
      this.toastr.info(`Impossible de récupérer la liste des formations, continuez votre candidature`, `Passage à l'étape suivante`);
      this.nextStep.emit('STEP_3');
    } else if (this.formationsGotten != null) {
      this.buildListeFormationsEtNiveaux(this.formationsGotten);
    }
  }
  createFormFormations() {
    this.formFormationCandidat = this.fb.group({
      formations: this.fb.array([], ValidateFormations)
    });
    this.f['formations'].valueChanges.subscribe(this.onFormationSelectedFromList.bind(this));

  }

  disableFormations() {
    this.niveaux = [];
    this.f['formations'].setValidators([]);
    this.f['formations'].updateValueAndValidity();
  }

  buildListeFormationsEtNiveaux(formations: Formation[]) {
    const tag_name = 'NIVEAU';

    this.formations = formations.filter((formation) => {
      const niveau = this.appService.extractTag(tag_name, formation.description);
      return niveau != null && niveau !== '';
    }).map((formation) => {
      return {
        ...formation,
        niveau_cfai: this.appService.extractTag(tag_name, formation.description)
      };
    });

    this.formations.sort((formation1, formation2) => {
      const formation1Order = Number(this.appService.extractTag('ORDRE', formation1.description));
      const formation2Order = Number(this.appService.extractTag('ORDRE', formation2.description));
      if (formation1Order < formation2Order) {
        return -1;
      }
      if (formation1Order > formation2Order) {
        return 1;
      }
      return 0;
    });

    const niveaux_all: string[] = this.formations.map((formation) => {
      return formation.niveau_cfai;
    });
    this.niveaux = [...new Set(niveaux_all)];

    if (this.formations.length > 0) {
      this.formFormationCandidat = this.fb.group({
        formations: this.fb.array([], ValidateFormations),
        id_formation_prioritaire: [null]
      });
      this.formFormationCandidat.setControl('formations', this.fb.array(this.formations.map(formation => false), ValidateFormations));
    } else {
      this.toastr.info(`Aucune formation à afficher`, `Choix des formations désactivé`);
      this.disableFormations();
    }
  }

  onStarClicked(id_formation_prioritaire: number) {
    this.f['id_formation_prioritaire'].patchValue(id_formation_prioritaire);
  }

  isChecked(id_formation: number) {
    const idx_formation = this.getIndexFormationById(id_formation);
    const formations_form_array = this.f['formations'] as FormArray;
    if (idx_formation !== -1 && !formations_form_array.controls[idx_formation].disabled) {
      return formations_form_array.getRawValue()[idx_formation] === true;
    } else {
      return false;
    }
    // return true
  }

  getIndexFormationById(id_formation: number) {
    return this.formations.findIndex(formation => formation.id === id_formation)
  }

  getFormationsByNiveau(niveau: string) {
    return this.formations.filter(formation => formation.niveau_cfai === niveau);
  }

  isSelected(id_formation: number) {
    return this.getSelectedFormation().find(formation => formation.id === id_formation);
  }

  getSelectedFormation() {
    return this.formations.filter((formation, index) => this.f['formations'].value[index] === true);
  }

  setFormationsCandidat() {
    const observables = this.getSelectedFormation().map((formation: Formation) => {

      return this.appService.setFormationsCandidat(this.appService.id_profil360, formation.id, false).pipe(
        catchError(() => {
          return of(null);
        })
      );
    });

    this.isLoading = true;
    forkJoin(observables).subscribe(
      () => {
        this.isLoading = false;
        this.nextStep.emit('STEP_3');
      },
      () => {
        this.isLoading = false;
        this.toastr.error(`Erreur lors de l'enregistrement des formations`);
      }
    );
  }

  onSubmitFormationCandidat() {
    if (this.formFormationCandidat.valid) {
      this.setFormationsCandidat();
    } else {
      this.appService.handleFormError(this.formFormationCandidat);
    }
  }

  onFormationSelectedFromList() {
    const formationsSelected = this.getSelectedFormation();
    const id_formation_prioritaire = this.f['id_formation_prioritaire'].value;
    const has_formation_prioritaire_in_selection = formationsSelected.find(formation => formation.id === id_formation_prioritaire);
    if (formationsSelected.length > 0 && !has_formation_prioritaire_in_selection) {
      this.f['id_formation_prioritaire'].patchValue(formationsSelected[0]?.id);
    } else if (formationsSelected.length === 0) {
      this.f['id_formation_prioritaire'].patchValue(null);
    }
    if (this.getSelectedFormation().length >= this.maxFormationSelectionable) {
      // On part du principe que les index n'ont pas été renommées (cf GetRawValues)
      for (let index = 0; index < (this.f['formations'] as FormArray).getRawValue().length; index++) {
        if (!(this.f['formations'] as FormArray).getRawValue()[index]) {
          (this.f['formations'] as FormArray).controls[index].disable({emitEvent: false});
        }
      }
      this.isFormCapped = true;
    } else if (this.isFormCapped) {
      this.f['formations'].enable({emitEvent: false});
      this.isFormCapped = false;
    }
  }

}
