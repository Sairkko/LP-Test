import * as moment from 'moment-timezone';
import localeFr from '@angular/common/locales/fr';
import localeFrExtra from '@angular/common/locales/extra/fr';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormInfosCandidatsComponent } from './forms/form-infos-candidants/form-infos-candidats.component';
import { NgxMaskDirective, provideNgxMask} from 'ngx-mask'
import {registerLocaleData} from "@angular/common";
import { NgbDateAdapter, NgbDateParserFormatter, NgbDatepickerI18n, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CustomDatepickerI18n, I18n } from './config/ng-bootstrap-datepicker-i18n';
import { NgbDateFRParserFormatter } from './config/ngb-date-fr-parser-formatter';
import { NgbIsoDateAdapter } from './config/ngb-iso-date-adapter';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { ToastrModule } from 'ngx-toastr';
import {AppService} from "./app.service";
import {HttpClientModule} from "@angular/common/http";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import { FormDocumentsComponent } from './forms/form-documents/form-documents.component';
import {FormFormationsComponent} from "./forms/form-formations/form-formations.component";
import {NgSelectModule} from "@ng-select/ng-select";

@NgModule({
  declarations: [
    AppComponent,
    FormInfosCandidatsComponent,
    FormDocumentsComponent,
    FormFormationsComponent
  ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        NgxMaskDirective,
        ReactiveFormsModule,
        NgbModule,
        FormsModule,
        HttpClientModule,
        ToastrModule.forRoot(),
        NgSelectModule,
    ],
  providers: [provideNgxMask(),
    I18n,
    AppService,
    {provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n},
    {provide: NgbDateParserFormatter, useClass: NgbDateFRParserFormatter},
    {provide: NgbDateAdapter, useClass: NgbIsoDateAdapter}],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() {
    // Paramétrer la locale d'angular en français + forcer le timezone de moment.js à celui de Paris
    moment.tz.setDefault('Europe/Paris');
    registerLocaleData(localeFr, 'fr-FR', localeFrExtra);
  }
}
