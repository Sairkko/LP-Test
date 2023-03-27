export interface Domaine {
  id: number;
  nom: string;
}

export interface ApiSuccessResponse<T extends Object> {
  results: T;
  message: string;
  code: number;
}
// C'est pour le User? ou pour autre chose?
// export module User {
//   export const CIVILITE_HOMME = 'H';
//   export const CIVILITE_FEMME = 'F';
//
//   export const ROLE_CANDIDAT = 'ROLE_CANDIDAT';
//   export const ROLE_CONTACT_SOCIETE = 'ROLE_CONTACT_SOCIETE';
//   export const ROLE_ADMIN_ECOLE = 'ROLE_ADMIN_ECOLE';
//   export const ROLE_RECRUTEUR = 'ROLE_RECRUTEUR';
//   export const ROLE_SUPER_ADMIN = 'ROLE_SUPER_ADMIN';
// }

export interface User {
  id: number;
  username: string;
  role: string;
  nom: string;
  prenom: string;
  siret_entreprise: string;
  date_naissance: string | null;
  date_connection: string | null;
  date_creation: string;
  civilite: string;
  rgpd: boolean;
  profil_admin_id?: number;
  campagne_defaut?: number;
  ecole?: number;
}

export interface AnneeEntree {
  id: number;
  nom: string;
}

export interface Formation {
  id: number;
  ecole: number;
  nom: string;
  code_formation_ypareo: number;
  description: string;
  nombre_places: number;
  isRecrutementTermine: boolean;
  video: string;
  annees_entree_formation: AnneeEntree[];
  domaines: Domaine[];
  responsable: User;
  cv_est_obligatoire: boolean;
  lettre_de_motivation_est_obligatoire: boolean;
  diplome_est_obligatoire: boolean;
  bulletin_notes_est_obligatoire: boolean;
  url_fiche_presentation: string;
  sites: Site[];
}

export interface Site {
  id: number;
  ecole: number;
  nom: string;
}

export interface Diplome {
  id?: number;
  profil360?: number;
  libelle: string;
  annee_obtention?: string;
  nom_ecole: string;
  ville: string;
  specialite: string;
  est_en_alternance: boolean;
}

export module Profil360 {
  export const PERMIS_NON_OK = -1;
  export const PERMIS_EN_COURS = 0;
  export const PERMIS_OK = 1;
}

export interface Profil360 {
  id: number;
  user: number;
  ecole: number;
  campagne: number;
  civilite: string;
  mission_placement: number;
  date_naissance: string;
  url_avatar: string;
  sortis_sas: boolean;
  email: string;
  nom: string;
  prenom: string;
  adresse: string;
  complement_adresse: string;
  code_postal: string;
  ville: string;
  telephone: string;
  portable: string;
  pays: string;
  nationalite: string;
  lieu_naissance: string;
  parcoursup: boolean | null;
  est_handicape: boolean | null;
  est_futur_entrepreneur: boolean | null;
  aspire_etude_etranger: boolean | null;
  permis: -1 | 0 | 1 | null;
  vehicule: boolean | null;
  mobilite: number | null;
  deja_trouve_entreprise: boolean | null;
  coordonnees_entreprise_deja_trouvee: string;
  principales_communes_mobilite: string;
  pret_prendre_logement_proche_entreprise: boolean | null;
  INE: string;
  latitude: number;
  longitude: number;
  date_creation: string;
  gestionnaire_de_compte: number;
  est_visible_par_candidat: boolean;
  formations_souhaites: number[] | Formation[];
  nbr_mises_en_relations: number;
  provenance: string;
  template_lea: number;
  diplomes?: Diplome[];
  date_placement?: string;
  ids_mission_ajout_manuel?: number[];
  formations_validees?: number[];
  moyenne_avis?: number;
  isCollapsed?: boolean;
  date_connection?: string;
  date_export?: string;
  tous_documents_obligatoires_ok?: boolean;
}

export module DocumentProfil360 {
  export const TYPE_CV = 'CV';
  export const TYPE_LETTRE_MOTIVATION = 'LETTRE_MOTIVATION';
  export const TYPE_DIPLOME_OU_JUSTIFICATIF_OBTENTION = 'DIPLOME_OU_JUSTIFICATIF_OBTENTION';
  export const TYPE_BULLETIN_NOTES = 'BULLETIN_NOTES';
  export const TYPE_AUTRE = 'AUTRE';
}
