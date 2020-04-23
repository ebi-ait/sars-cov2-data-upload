import {Component} from '@angular/core';
import * as aws from 'aws-sdk';
import {SES} from 'aws-sdk';
import { environment as env } from '../../environments/environment';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {

  // tslint:disable-next-line:variable-name
  private _ses: SES;

  constructor() {
    this.configureSES();
  }

  public sendMessage(email, folder, notes): void {
    let params;
    params = {
      Destination: {
        ToAddresses: [email]
      },
      Message: {
        Body: {
          Text: {
            Charset: 'UTF-8',
            Data: email + ' has submitted files in ' + folder + '\n with message ' + notes
          }
        },
        Subject: {
          Charset: 'UTF-8',
          Data: 'Submission received from ' + email
        }
      },
      Source: 'dgupta@ebi.ac.uk' // Must be registered with AWS
    };
    this.sendEmail(params);
  }

// tslint:disable-next-line:no-unused-expression
  configureSES(): void {
    aws.config.credentials = {
      accessKeyId: 'AKIAJWJR36TCJUZN5U3Q',
      secretAccessKey: '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'
    },
      aws.config.update({
        region: 'us-west-2'
      });
    this._ses = new SES({
      apiVersion: '2010-12-01'
    });
  }

  sendEmail(params): void {
    // tslint:disable-next-line:only-arrow-functions
    this._ses.sendEmail(params, function(err, data) {
      if (err) {
        console.log(err, err.stack);
      } else {
        console.log(data);
      }
    });
  }
}
