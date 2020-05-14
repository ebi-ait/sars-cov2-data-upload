import {Component} from '@angular/core';
import * as aws from 'aws-sdk';
import {SES} from 'aws-sdk';
import {environment as env} from '../../environments/environment';

@Component({
    selector: 'app-contact',
    templateUrl: './contact.component.html',
    styleUrls: ['./contact.component.css']
})
export class ContactComponent {

    // tslint:disable-next-line:variable-name
    private _ses: SES;
    accessKey = env.ACCESSKEYEMAIL;
    secKey = env.SECRETKEYEMAIL;

    constructor() {
        this.configureSES();
    }

    public sendMessage(email, folder, username, useremail, notes): boolean {
        let params;
        params = {
            Destination: {
                ToAddresses: [email]
            },
            Message: {
                Body: {
                    Text: {
                        Charset: 'UTF-8',
                        Data: 'New files have been submitted in ' + folder + '\nwith message: ' + notes + '.' +
                            '\nSubmitter details are as: \n[name] ' + username + ' and \n[email] ' + useremail
                    }
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data: 'Submission received in ' + folder
                }
            },
            Source: 'dgupta@ebi.ac.uk' // Must be registered with AWS
        };

        return this.sendEmail(params);
    }

// tslint:disable-next-line:no-unused-expression
    configureSES(): void {
        aws.config.credentials = {
            accessKeyId: this.accessKey,
            secretAccessKey: this.secKey
        },
            aws.config.update({
                region: 'us-east-1'
            });
        this._ses = new SES({
            apiVersion: '2010-12-01'
        });
    }

    sendEmail(params): boolean {
        // tslint:disable-next-line:only-arrow-functions
        let sendEmail = false;
        // tslint:disable-next-line:only-arrow-functions
        this._ses.sendEmail(params, function(err, data) {
            if (err) {
                console.log(err, err.stack);
            } else {
                console.log('Email sent');
                sendEmail = true;
            }
        });

        return sendEmail;
    }
}
