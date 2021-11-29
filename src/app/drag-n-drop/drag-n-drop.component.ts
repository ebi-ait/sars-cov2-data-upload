import {Component, ViewChild} from '@angular/core';
import {ContactComponent as cc} from '../email/contact.component';
import {MatTable} from '@angular/material/table';
import {environment as env} from '../../environments/environment';
import * as aws from 'aws-sdk';
import * as emailValidator from 'email-validator';
import * as SparkMD5 from 'spark-md5';
import {WebinAuthService} from './service/webin-auth.service';
import {WebinUser} from './model/WebinUser';

export interface UploadedRecords {
    name: string;
    format: string;
    size: string;
    date: string;
    dateTime: Date;
}

@Component({
    selector: 'app-drag-n-drop',
    templateUrl: './drag-n-drop-new.component.html',
    styleUrls: ['./drag-n-drop.component.css']
})

export class DragNDropComponent {
    accessKey = env.ACCESSKEYBUCKET_1 + env.ACCESSKEYBUCKET_2;
    secKey = env.SECREYKEYBUCKET_1 + env.SECREYKEYBUCKET_2;

    constructor(private webinAuthService: WebinAuthService) {
    }

    @ViewChild(MatTable) table: MatTable<any>;
    displayedColumns: string[] = ['name', 'format', 'size', 'date'];
    uploadedFileList: UploadedRecords[] = [];

    private bucket = new aws.S3({
        apiVersion: '2006-03-01',
        region: 'us-east-1',
        s3ForcePathStyle: true,
        credentials: {
            accessKeyId: this.accessKey,
            secretAccessKey: this.secKey
        },
        endpoint: 'https://uk1s3.embassy.ebi.ac.uk'
    });

    private bucketName = 'covid-utils-ui-88560523';

    folder = '';
    name = '';
    email = '';
    root = 'root';
    files: any[] = [];
    validFileExtensions: any[] = ['.bam', '.cram', '.xls', '.xlsx', '.xlsm', '.tsv', '.csv', '.txt', '.fastq.gz', '.fastq.bz2', '.fq.gz', '.fq.bz2', '.fasta.gz', '.fasta.bz2', '.fasta', '.embl', '.embl.gz'];
    spreadSheetExtensions: any[] = ['.xls', '.xlsx', '.xlsm', '.csv', '.tsv', '.txt'];
    uploadedFiles: any[] = [];
    contactComponent = new cc();
    notes: any;
    toShowUploadArea = true;
    isValidUploadUUID = false;
    tbDisabled = false;
    fileWithInvalidExtension = false;
    spreadSheetPresent = true;
    uploadFinished = false;
    toLoad: boolean;
    emailSent = true;
    submitted = false;
    everythingIsDone = false;
    consent: false;
    consentHandler = true;
    allDetailsEnteredAndValid = true;
    validationMessage = '';
    webinUser: WebinUser;
    errorMessage;
    webinId: any;
    hasWebinId: any;
    showWebinRegistrationLink = false;

    isShowWebinLink() {
        this.showWebinRegistrationLink = false;

        if (!this.hasWebinId) {
            this.showWebinRegistrationLink = true;
        }

        return this.showWebinRegistrationLink;
    }

    getWebinUser() {
        this.errorMessage = '';
        this.webinAuthService.getWebinUser(this.email)
            .subscribe(
                (response) => {
                    this.webinUser = response;
                },
                (error) => {
                    this.errorMessage = error;
                },
                () => {
                });
    }

    validateAllLoginInputs() {
        this.allDetailsEnteredAndValid = true;

        if (!this.email || !this.name || !this.folder || !this.hasWebinId) {
            this.allDetailsEnteredAndValid = false;
            this.validationMessage = 'You have not entered all the required information. ' +
                'Please enter your secure key, name and email address and WEBIN Submission Account ID to Logon';
            return this.allDetailsEnteredAndValid;
        } else if (!this.webinId) {
            this.allDetailsEnteredAndValid = false;
            this.validationMessage = 'Please enter a valid WEBIN Submission Account ID';
        } else if (this.webinId.length <= 6) {
            this.allDetailsEnteredAndValid = false;
            this.validationMessage = 'Please enter a valid WEBIN Submission Account ID';
        } else if (!emailValidator.validate(this.email)) {
            this.allDetailsEnteredAndValid = false;
            this.validationMessage = 'Please enter a valid email address.';
            return this.allDetailsEnteredAndValid;
        }

        /* if (this.allDetailsEnteredAndValid) {
             this.getWebinUser();
         }*/

        return this.allDetailsEnteredAndValid;
    }

    onSelect(event) {
        this.files.push(...event.addedFiles.map(file => {
            return file;
        }));
    }

    onRemove(event) {
        this.files.splice(this.files.indexOf(event), 1);
    }

    async onUpload() {
        const now = new Date();
        aws.config.httpOptions.timeout = 0;
        this.fileWithInvalidExtension = false;
        this.isValidUploadUUID = true;
        this.uploadFinished = false;
        this.spreadSheetPresent = true;
        this.consentHandler = true;

        let metadataSheetPresent = false;

        for (const file of this.files) {
            const indexOfDot = file.name.indexOf('.');
            const lastIndexOfDot = file.name.lastIndexOf('.');
            const extension = file.name.substring(indexOfDot);
            const lastExtension = file.name.substring(lastIndexOfDot);

            if (!(this.validFileExtensions.includes(extension) || this.validFileExtensions.includes(lastExtension))) {
                this.fileWithInvalidExtension = true;
                return;
            }
        }

        for (const file of this.files) {
            const indexOfDot = file.name.lastIndexOf('.');
            const extension = file.name.substring(indexOfDot);

            if (this.spreadSheetExtensions.includes(extension)) {
                metadataSheetPresent = true;
            }
        }

        this.spreadSheetPresent = metadataSheetPresent;

        if (!this.spreadSheetPresent) {
            return;
        }

        this.consentHandler = this.consent;

        if (!this.consentHandler) {
            return;
        }

        for (const file of this.files) {
            if (this.files.includes(file)) {
                file.timestamp = now.getTime();
                this.fileWithInvalidExtension = false;

                const indexOfDot = file.name.indexOf('.');
                const extension = file.name.substring(indexOfDot);

                if (this.spreadSheetExtensions.includes(extension)) {
                    file.id = now.toISOString();
                    await this.executeUploadOfFile(file, true);
                } else {
                    file.id = await this.getMd5Hash(file);
                    await this.executeUploadOfFile(file, false);
                }
            }
        }

        if (this.uploadedFiles.length >= this.files.length) {
            this.uploadFinished = true;
        }
    }

    executeUploadOfFile(file, appendWebinId: boolean) {
        const options = {partSize: 45 * 1024 * 1024, queueSize: 2};
        let key = this.folder + '/' + file.name + '.' + file.id;

        if (appendWebinId) {
            key = this.folder + '/' + this.webinId + '.' + file.name + '.' + file.id;
        }

        const params = {
            Bucket: this.bucketName,
            Key: key,
            Body: file,
            ACL: 'private',
            ContentType: file.type
        };

        return new Promise((resolve, reject) => this.bucket.upload(params, options).on('httpUploadProgress', evt => {
            this.uploadFinished = false;
            // tslint:disable-next-line:triple-equals
            this.files = this.files.filter(f => file.id != f.id);
            file.loaded = evt.loaded;
            file.total = evt.total;
            file.percentage = (evt.loaded / evt.total * 100).toFixed();

            this.uploadedFiles[file.id] = file;
        }).send((err, data) => {
            if (err) {
                alert(err + ' INFORMATION # There has been a Network failure detected while the upload was being done. Please retry.');
                // this.files.push(file);
                reject();
            } else {
                resolve();
            }

            file.location = data.Location;
            this.uploadedFiles[file.id] = file;
        }));
    }

    async loadUploadArea() {
        this.files = [];
        this.fileWithInvalidExtension = false;
        this.uploadedFileList = [];

        this.bucket.headObject({
            Bucket: this.bucketName,
            Key: this.folder + '/',
        })
            .promise()
            .then(
                (res: any) => {
                    this.isValidUploadUUID = true;
                    this.toShowUploadArea = true;
                    this.tbDisabled = true;
                },
                err => {
                    if (err.code === 'NotFound') {
                        this.toShowUploadArea = false;
                        this.isValidUploadUUID = false;
                    }
                }
            );

        this.loadFileList();
    }

    async loadFileList() {
        this.uploadedFileList = [];
        this.toLoad = true;

        this.bucket.listObjects({
            Bucket: this.bucketName,
            Prefix: this.folder + '/',
        }, (err, data) => {
            if (err) {
                console.error(err); // an error occurred
            } else {
                for (const dataFile of data.Contents) {
                    let fileKey = dataFile.Key.split('/');
                    let filename = '';
                    let fileExtension = '';
                    if (fileKey.length > 1) {
                        fileKey = fileKey[1].split('.');
                        if (fileKey.length > 2) {
                            if (fileKey[2] === 'gz' || fileKey[2] === 'bz2') {
                                filename = fileKey[0] + '.' + fileKey[1] + '.' + fileKey[2];
                                fileExtension = fileKey[1] + '.' + fileKey[2];
                            } else {
                                filename = fileKey[0] + '.' + fileKey[1];
                                fileExtension = fileKey[1];
                            }
                        } else {
                            filename = fileKey[0];
                        }
                    }

                    if (filename !== '') {
                        const dataRecord: UploadedRecords = {
                            name: filename,
                            format: fileExtension,
                            size: String(dataFile.Size),
                            date: String(dataFile.LastModified),
                            dateTime: dataFile.LastModified
                        };
                        this.uploadedFileList.push(dataRecord);
                    }
                }
            }
            this.uploadedFileList.sort((a, b) => {
                return b.dateTime.getTime() - a.dateTime.getTime();
            });

            this.table.renderRows();
        });
    }

    onReset() {
        this.folder = '';
        this.tbDisabled = false;
        this.isValidUploadUUID = false;
        this.uploadedFileList = [];
        this.uploadedFiles = [];
    }

    sendEmail() {
        this.loadFileList();
        this.emailSent = this.contactComponent.sendMessage(this.folder, this.name, this.email, this.notes, this.hasWebinId, this.webinId);
        this.notes = '';
        this.submitted = true;
        this.everythingIsDone = true;
    }

    getUploadedFiles(): any[] {
        return Object.values(this.uploadedFiles);
    }

    async computeMD5Checksum(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const chunkSize = 2097152; // Read in chunks of 2MB
            const spark = new SparkMD5.ArrayBuffer();
            const fileReader = new FileReader();

            let cursor = 0; // current cursor in file

            // tslint:disable-next-line:only-arrow-functions
            fileReader.onerror = function(): void {
                reject('MD5 computation failed - error reading the file');
            };

            // read chunk starting at `cursor` into memory
            // tslint:disable-next-line:variable-name
            function processChunk(chunk_start: number): void {
                // tslint:disable-next-line:variable-name
                const chunk_end = Math.min(file.size, chunk_start + chunkSize);
                fileReader.readAsArrayBuffer(file.slice(chunk_start, chunk_end));
            }

            // when it's available in memory, process it
            // tslint:disable-next-line:only-arrow-functions
            fileReader.onload = function(e: any): void {
                spark.append(e.target.result); // Accumulate chunk to md5 computation
                cursor += chunkSize; // Move past this chunk

                if (cursor < file.size) {
                    // Enqueue next chunk to be accumulated
                    processChunk(cursor);
                } else {
                    // Computation ended, last chunk has been processed. Return as Promise value.
                    // This returns the base64 encoded md5 hash, which is what
                    // Rails ActiveStorage or cloud services expect
                    resolve(spark.end());

                    // If you prefer the hexdigest form (looking like
                    // '7cf530335b8547945f1a48880bc421b2'), replace the above line with:
                    // resolve(spark.end());
                }
            };

            processChunk(0);
        });
    }

    async getMd5Hash(file: any) {
        return await this.computeMD5Checksum(file);
    }
}
