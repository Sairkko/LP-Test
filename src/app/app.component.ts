import {Component, OnInit} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {Formation} from './app.models';
import { AppService } from './app.service';
import {ActivatedRoute} from "@angular/router";
import {retry} from "rxjs/operators";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  public step = 'STEP_1';
  public formations: Formation[] = [];

  constructor(private router: ActivatedRoute,
              public modal: NgbModal,
              private appService: AppService,
              ) {
  }

  ngOnInit(): void {
    this.router.queryParams.subscribe((params) => {
      if (params['provenance']) {
        this.appService.setCustomProvenance(params['provenance']);
      }
    });

    this.appService.getFormations().pipe(retry(2)).subscribe({
      next: (formations) => {
        this.formations = formations;
      },
      error: () => {
        this.formations = [];
      }
    });
  }

  goToNextStep(step: string) {
    this.step = step;
    setTimeout(() => {
      document.querySelector('#form')!.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'start'
      });
    });
  }
  open(content: any) {
    const modale_instance = this.modal.open(content, {
      ariaLabelledBy: 'modal-title',
      centered: true,
      size: 'lg'
    }).result;
    modale_instance.then(() => {}, () => {});
  }

}
