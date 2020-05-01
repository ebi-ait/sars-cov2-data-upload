import {Component, ViewChild} from '@angular/core';
import {ContactComponent as cc} from '../email/contact.component';
import {MatTable} from '@angular/material/table';
import {Md5} from 'ts-md5/dist/md5';
import {environment as env} from '../../environments/environment';
import * as aws from 'aws-sdk';

export interface UploadedRecords {
    name: string;
    format: string;
    size: string;
    date: string;
}

@Component({
    selector: 'app-drag-n-drop',
    templateUrl: './drag-n-drop-new.component.html',
    styleUrls: ['./drag-n-drop.component.css']
})

export class DragNDropComponent {
    accessKey = env.ACCESSKEYBUCKET;
    secKey = env.SECREYKEYBUCKET;

    @ViewChild(MatTable) table: MatTable<any>;
    displayedColumns: string[] = ['name', 'format', 'size', 'date'];
    uploadedFileList: UploadedRecords[] = [];


    private bucket = new aws.S3({
        apiVersion: '2006-03-01',
        region: 'us-east-1',
        credentials: {
            accessKeyId: this.accessKey,
            secretAccessKey: this.secKey
        }
    });

    private bucketName = 'covid-util-upload-areas';

    folder = '';
    root = 'root';
    files: any[] = [];
    validFileExtensions: any[] = ['.bam', '.cram', '.xls', '.xlsx', '.xlsm', '.tsv', '.csv', '.txt', '.fastq.gz', '.fastq.bz2', '.fq.gz', '.fq.bz2'];
    spreadhseetExtensions: any[] = ['.xls', '.xlsx', '.xlsm', '.csv', '.tsv', '.txt'];
    invalidFileNames: any;
    uploadedFiles = {};
    contactComponent = new cc();
    notes: any;
    toShow = true;
    isValid = false;
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

    onSelect(event) {
        this.files.push(...event.addedFiles.map(file => {
            return file;
        }));
    }

    onRemove(event) {
        this.files.splice(this.files.indexOf(event), 1);
    }

    onUpload() {
        aws.config.httpOptions.timeout = 0;
        this.fileWithInvalidExtension = false;
        this.isValid = true;
        this.uploadFinished = false;
        this.spreadSheetPresent = true;
        this.consentHandler = true;

        let metadataSheetPresent = false;

        for (const file of this.files) {
            const indexOfDot = file.name.indexOf('.');
            const extension = file.name.substring(indexOfDot);

            if (!this.validFileExtensions.includes(extension)) {
                this.fileWithInvalidExtension = true;
                return;
            }
        }

        for (const file of this.files) {
            const indexOfDot = file.name.lastIndexOf('.');
            const extension = file.name.substring(indexOfDot);

            if (this.spreadhseetExtensions.includes(extension)) {
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
            this.fileWithInvalidExtension = false;

            const indexOfDot = file.name.indexOf('.');
            const extension = file.name.substring(indexOfDot);

            if (this.spreadhseetExtensions.includes(extension)) {
                const now = new Date();
                file.id = now.toISOString();
            } else {
                file.id = new Md5().appendStr(String(new Date().getTime())).end();
            }

            const params = {
                Bucket: this.bucketName,
                Key: this.folder + '/' + file.name + '.' + file.id,
                Body: file,
                ACL: 'private',
                ContentType: file.type
            };

            const options = {partSize: 20 * 1024 * 1024, queueSize: 10};

            this.bucket.upload(params, options).on('httpUploadProgress', evt => {
                // tslint:disable-next-line:triple-equals
                this.files = this.files.filter(f => file.id != f.id);
                file.loaded = evt.loaded;
                file.total = evt.total;
                file.percentage = evt.loaded / evt.total * 100;

                if (file.percentage === 100) {
                    this.uploadFinished = true;
                }

                this.uploadedFiles[file.id] = file;
            }).send((err, data) => {
                if (err) {
                    alert(err);
                    return;
                }
                file.location = data.Location;
                this.uploadedFiles[file.id] = file;
            });
        }
    }

    onParallelUpload() {
        /*this.fileWithInvalidExtension = false;
       this.isValid = true;
       this.uploadFinished = false;
       this.spreadSheetPresent = true;
       this.consentHandler = true;

       let metadataSheetPresent = false;

       for (const file of this.files) {
           const indexOfDot = file.name.indexOf('.');
           const extension = file.name.substring(indexOfDot);

           if (!this.validFileExtensions.includes(extension)) {
               this.fileWithInvalidExtension = true;
               return;
           }
       }

       for (const file of this.files) {
           const indexOfDot = file.name.lastIndexOf('.');
           const extension = file.name.substring(indexOfDot);

           if (this.spreadhseetExtensions.includes(extension)) {
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
           this.fileWithInvalidExtension = false;

           const indexOfDot = file.name.indexOf('.');
           const extension = file.name.substring(indexOfDot);

           if (this.spreadhseetExtensions.includes(extension)) {
               const now = new Date();
               file.id = now.toISOString();
           } else {
               file.id = new Md5().appendStr(String(new Date().getTime())).end();
           }

           const params = {
               Bucket: this.bucketName,
               Key: this.folder + '/' + file.name + '.' + file.id,
               Body: file,
               ACL: 'private',
               ContentType: file.type
           };

           const options = {partSize: 20 * 1024 * 1024, queueSize: 2};

           this.bucket.upload(params, options).on('httpUploadProgress', evt => {
               // tslint:disable-next-line:triple-equals
               this.files = this.files.filter(f => file.id != f.id);
               file.loaded = evt.loaded;
               file.total = evt.total;
               file.percentage = evt.loaded / evt.total * 100;

               if (file.percentage === 100) {
                   this.uploadFinished = true;
               }

               this.uploadedFiles[file.id] = file;
           }).send((err, data) => {
               if (err) {
                   alert(err);
                   return;
               }
               file.location = data.Location;
               this.uploadedFiles[file.id] = file;
           });
       }

       const PARALLEL_UPLOADS = 10;
       const q = async.queue((task, callback) => {
           this.bucket.upload({
               Bucket: this.bucketName,
               Key: task.dest,
               Body: task.src
           }, callback);
       }, PARALLEL_UPLOADS);

       // tslint:disable-next-line:only-arrow-functions
       q.drain = function() {
           console.log('all items have been processed');
       };

       for (const file of this.files) {
           file.id = new Md5().appendStr(String(new Date().getTime())).end();

           q.push([
               {src: file, dest: this.folder + '/' + file.name + '.' + file.id},
           ]);
       }*/
    }


    getInvalidFiles(): any {
        return this.invalidFileNames;
    }

    async onLoading() {
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
                    this.isValid = true;
                    this.toShow = true;
                    this.tbDisabled = true;
                },
                err => {
                    if (err.code === 'NotFound') {
                        this.toShow = false;
                        this.isValid = false;
                    }
                }
            );

        this.loadList();
    }

    onDelete(file) {
        this.bucket.deleteObject({
            Bucket: this.bucketName,
            Key: this.folder + '/',
        })
            .promise()
            .then(
                () => {
                    console.log('Deleted ' + file);
                },
                err => {
                    console.log(err);
                }
            );
    }

    async loadList() {
        this.toLoad = true;

        this.bucket.listObjects({
            Bucket: this.bucketName,
            Prefix: this.folder + '/',
        }, (err, data) => {
            if (err) {
                console.error(err); // an error occurred
            } else {
                console.log(data.Contents);

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
                            date: String(dataFile.LastModified)
                        };
                        this.uploadedFileList.push(dataRecord);
                        this.table.renderRows();
                    }
                }

            }
        });
    }

    onReset() {
        this.folder = '';
        this.tbDisabled = false;
        this.isValid = false;
        this.uploadedFileList = [];
        this.uploadedFiles = [];
    }

    async sendEmail() {
        this.uploadedFileList = [];
        const email = 'virus-dataflow@ebi.ac.uk';
        this.emailSent = await this.contactComponent.sendMessage(email, this.folder, this.notes);
        this.notes = '';
        this.submitted = true;
        this.everythingIsDone = true;
        this.loadList();
    }

    getUploadedFiles(): any[] {
        return Object.values(this.uploadedFiles);
    }

    alertUser() {
        if (!this.everythingIsDone) {
            alert('Do you really want to leave');
        }
    }

    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
