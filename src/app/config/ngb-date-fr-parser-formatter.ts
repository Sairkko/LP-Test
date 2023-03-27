import { Injectable } from '@angular/core';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment-timezone';

function padNumber(value: number) {
  if (isNumber(value)) {
    return `0${value}`.slice(-2);
  } else {
    return '';
  }
}

function isNumber(value: any): boolean {
  return !isNaN(toInteger(value));
}

function toInteger(value: any): number {
  return parseInt(`${value}`, 10);
}


@Injectable()
export class NgbDateFRParserFormatter extends NgbDateParserFormatter {
  parse(value: string): NgbDateStruct | null {
    if (value) {
      const dateObj = moment(value, 'DD/MM/YYYY');
      return {
        year: +dateObj.format('YYYY'),
        month: +dateObj.format('M'),
        day: +dateObj.format('D'),
      };
    } else {
      return null;
    }
  }

  format(date: NgbDateStruct): string {
    if (date) {
      const dateObJ = moment.utc();
      dateObJ.set('year', date.year);
      dateObJ.set('month', date.month - 1);
      dateObJ.set('date', date.day);
      dateObJ.startOf('day');
      return dateObJ.format('DD/MM/YYYY');
    } else {
      return '';
    }
  }
}
