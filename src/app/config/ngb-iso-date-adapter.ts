import { Injectable } from '@angular/core';
import { NgbDateAdapter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment-timezone';

@Injectable()
export class NgbIsoDateAdapter extends NgbDateAdapter<string> {

  fromModel(date: string): NgbDateStruct | null {
    const dateObj = moment(date);

    if (dateObj.isValid()) {
      return {
        year: +dateObj.format('YYYY'),
        month: +dateObj.format('M'),
        day: +dateObj.format('D'),
      };
    } else {
      return null;
    }
  }

  toModel(date: NgbDateStruct): string | null {
    if (date) {
      const dateObJ = moment.utc();
      dateObJ.set('year', date.year);
      dateObJ.set('month', date.month - 1);
      dateObJ.set('date', date.day);
      dateObJ.startOf('day');
      return dateObJ.format('YYYY-MM-DD[T]HH:mm:ssZZ');
    } else {
      return null;
    }
  }
}

