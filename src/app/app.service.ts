import { Injectable } from '@angular/core';
import {HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpRequest,} from '@angular/common/http';
import {map, retry} from 'rxjs/operators';
import {environment} from '../environments/environment';
import {ApiSuccessResponse, Diplome, Formation, Profil360} from './app.models';
import {FormGroup} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';

@Injectable()
export class AppService {

  public token_candidat: string | null = null;
  public id_profil360: number | null = null;
  public profil360: any = null;
  public id_comment_connu: number | null = null;
  public id_commentaire: number | null = null;
  private provenance: string = environment.defaut_provenance;
  private mailCandidat: string | null = null;
  private dataCandidat: boolean = false;
  public isAppranti = false;
  public isDe = false;

  constructor(private httpClient: HttpClient,
              private toastr: ToastrService) {
  }

  static handleUploadProgress(event: HttpEvent<unknown>): number {
    switch (event.type) {
      case HttpEventType.UploadProgress:
        return (100 * (event.loaded || 1) / (event.total || 1));

      case HttpEventType.Response:
        return 100;

      default:
        return 0;
    }
  }

  setDataCandidat( data: boolean) {
    this.dataCandidat = data;
  }
  setMailCandidat(data: string) {
    this.mailCandidat = data;
  }
  getMailCandidat() {
    return this.mailCandidat;
  }
  getDataCandidat() {
    return  this.dataCandidat;
  }

  getCandidature() {
    return  this.profil360;
  }

  setCustomProvenance(provenance: string) {
    if (provenance != null) {
      this.provenance = provenance;
    }
  }

  setIdProfil360Created(id_profil360: number) {
    this.id_profil360 = id_profil360;
  }

  getIdProfil360Created() {
    return this.id_profil360;
  }

  getToken() {
    return this.token_candidat;
  }

  updateValeurChampsPerso(id_profil360: number, id_def_champ_perso: number, valeur: string) {
    return this.httpClient.post<ApiSuccessResponse<any>>(
      `${environment.api_base_url}/profil360/${id_profil360}/champs_perso_profil360/${id_def_champ_perso}`, {
        valeur
      },
      {
        observe: 'body',
        responseType: 'json',
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.token_candidat}`
        })
      })
      .pipe(
        retry(3),
        map((data: ApiSuccessResponse<any>) => {
          return data.results;
        })
      );
  }

  createProfilCandidat(profil360: Profil360) {
    const profil360_avec_provenance = {
      ...profil360,
      provenance: this.provenance
    };

    return this.httpClient.post<ApiSuccessResponse<{ token: string, id_profil360: number }>>(
      `${environment.api_base_url}/ecoles/${environment.id_ecole}/candidats?token=1`,
      profil360_avec_provenance,
      {
        observe: 'body',
        responseType: 'json'
      })
      .pipe(
        map((data: ApiSuccessResponse<{ token: string, id_profil360: number }>) => {
          this.token_candidat = data.results.token;
          this.id_profil360 = data.results.id_profil360;
          return data.results;
        })
      );
  }

  setFormationsCandidat(id_profil360: number | null, id_formation: number, prioritaire: boolean = false) {
    return this.httpClient.post<ApiSuccessResponse<any>>(
      `${environment.api_base_url}/profils360/${id_profil360}/candidatures`, {
        id_formation,
        prioritaire
      },
      {
        observe: 'body',
        responseType: 'json',
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.getToken()}`
        })
      })
      .pipe(
        retry(3),
        map((data: ApiSuccessResponse<any>) => {
          return data.results;
        })
      );
  }

  sendDocumentCandidat(id_profil360: number | null, intitule: string, type_document: string, document: File) {
    const headers = new HttpHeaders();
    const formData = new FormData();

    headers.append('Content-Type', 'multipart/form-data');
    formData.append('id_profil360', String(id_profil360));
    formData.append('intitule', intitule);
    formData.append('type', type_document);
    formData.append('document', document);

    const uploadReq = new HttpRequest('POST', `${environment.api_base_url}/profil360/${id_profil360}/documents`, formData, {
      reportProgress: true,
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.token_candidat}`
      })
    });

    return this.httpClient.request(uploadReq).pipe(retry(3));
  }

  getProfil360(id_profil360: number) {
    return this.httpClient.get<ApiSuccessResponse<Profil360>>(
      `${environment.api_base_url}/profil360/${id_profil360}`,
      {
        observe: 'body',
        responseType: 'json',
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.token_candidat}`
        })
      }
    ).pipe(
      map((data: ApiSuccessResponse<Profil360>) => {
        return data.results;
      })
    );
  }

  updateProfil360(profil360: Profil360) {
    //set du profil 360 mis à jour
    this.profil360 = profil360;
    return this.httpClient.put<ApiSuccessResponse<any>>(
      `${environment.api_base_url}/profil360/${this.id_profil360}`, {
        ...profil360
      },
      {
        observe: 'body',
        responseType: 'json',
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.token_candidat}`
        })
      }
    ).pipe(
      map((data: ApiSuccessResponse<any>) => {
        return data.results;
      })
    );
  }
  getFormations() {
    return this.httpClient.get<ApiSuccessResponse<Formation[]>>(
      `${environment.api_base_url}/ecoles/${environment.id_ecole}/formations`,
      {
        observe: 'body',
        responseType: 'json'
      }
    ).pipe(map((data: ApiSuccessResponse<Formation[]>) => data.results
    ));
  }
  createDiplome(diplome: Diplome) {
    return this.httpClient.post<ApiSuccessResponse<any>>(
      `${environment.api_base_url}/profil360/${this.id_profil360}/diplomes`,
      diplome,
      {
        observe: 'body',
        responseType: 'json',
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.token_candidat}`
        })
      }
    ).pipe(
      map((data: ApiSuccessResponse<any>) => {
        return data.results;
      })
    );
  }

  handleFormError(formGroup: FormGroup) {
    this.toastr.error(`Merci de vérifier les données saisies dans le formulaire`, `Saisie invalide`);
    formGroup.markAllAsTouched();
    setTimeout(() => {
      const yOffset = -130;
      const element = document.querySelector('form .ng-invalid.ng-touched');
      if(!element) {
        return;
      }
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({top: y, behavior: 'smooth'});
    });
  }

  extractTag(tag_name: string, search_string: string | any) {
    const escaped_tag_name = tag_name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // La regex d'origine a été échappée : \[CATEGORIE:(([^\\\]]*|\\])*)?]
    const regex_full_tag = new RegExp(`\\[${escaped_tag_name}:(([^\\\\\\]]*|\\\\])*)?]`);

    if (regex_full_tag.test(search_string)) {
      const full_tag = search_string.match(regex_full_tag)[0];
      const tag_value_with_last_caracter = full_tag.replace(`[${tag_name}:`, '').replace('\\]', ']');
      const last_index_of = tag_value_with_last_caracter.lastIndexOf(']');
      return tag_value_with_last_caracter.slice(0, last_index_of);
    } else {
      return null;
    }
  }

  postResponsableLegal(responsableLegal: null) {
    return this.httpClient.post<ApiSuccessResponse<any>>(
      `${environment.api_base_url}/profil360/${this.id_profil360}/responsables_legaux`,
      responsableLegal,
      {
        observe: 'body',
        responseType: 'json',
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.token_candidat}`
        })
      })
      .pipe(
        map((data: ApiSuccessResponse<any>) => {
          return data.results;
        })
      );
  }
}



