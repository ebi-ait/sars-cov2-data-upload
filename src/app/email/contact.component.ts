import {Component} from '@angular/core';
import * as aws from 'aws-sdk';
import {SES} from 'aws-sdk';
import {environment as env} from '../../environments/environment';
import {WebinUser} from '../drag-n-drop/model/WebinUser';

@Component({
    selector: 'app-contact',
    templateUrl: './contact.component.html',
    styleUrls: ['./contact.component.css']
})
export class ContactComponent {

    // tslint:disable-next-line:variable-name
    private _ses: SES;
    accessKey = env.ACCESSKEYEMAIL_1 + env.ACCESSKEYEMAIL_2;
    secKey = env.SECRETKEYEMAIL_1 + env.SECRETKEYEMAIL_2;

    constructor() {
        this.configureSES();
    }

    // tslint:disable-next-line:max-line-length
    public sendMessage(folder: string, username: string, useremail: string, notes: string, webinUser: WebinUser): boolean {
        let params;
        let webinUserId = '';

        if (webinUser === undefined) {
            webinUserId = 'NOT FOUND';
        } else {
            webinUserId = webinUser.principle;
        }

        params = {
            Destination: {
                ToAddresses: ['virus-dataflow@ebi.ac.uk', 'dgupta@ebi.ac.uk']
            },
            Message: {
                Body: {
                    Text: {
                        Charset: 'UTF-8',
                        Data: 'New files have been submitted in ' + folder + '\nwith message: ' + notes + '.' +
                            '\nSubmitter details are as: \n[name] ' + username + '\n[email] ' + useremail +
                            '\nSubmitter Webin Submission Account ' + webinUserId
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
