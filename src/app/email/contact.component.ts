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
  accessKeyP1 = 'KP1';
  accessKeyP2 = 'KP2';

  secKeyP1 = 'SKP1';
  secKeyP2 = 'SKP2';

  constructor() {
    this.configureSES();
  }

  public async sendMessage(email, folder, notes): Promise<boolean> {
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

    return await this.sendEmail(params);
  }

// tslint:disable-next-line:no-unused-expression
  configureSES(): void {
    aws.config.credentials = {
      accessKeyId: this.accessKeyP1 + this.accessKeyP2,
      secretAccessKey: this.secKeyP1 + this.secKeyP2
    },
      aws.config.update({
        region: 'us-west-2'
      });
    this._ses = new SES({
      apiVersion: '2010-12-01'
    });
  }

  async sendEmail(params): Promise<boolean> {
    // tslint:disable-next-line:only-arrow-functions
    let sendEmail = false;
    // tslint:disable-next-line:only-arrow-functions
    await this._ses.sendEmail(params, function(err, data) {
      if (err) {
        console.log(err, err.stack);
      } else {
        console.log(data);
        console.log('Email sent');
        sendEmail = true;
      }
    });

    return sendEmail;
  }
}
