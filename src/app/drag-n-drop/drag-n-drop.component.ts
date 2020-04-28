import {Component, ViewChild} from '@angular/core';
import * as S3 from 'aws-sdk/clients/s3';
import {v4 as uuidv4} from 'uuid';
import {ContactComponent as cc} from '../email/contact.component';
import {environment as env} from '../../environments/environment';
import {MatTable} from '@angular/material/table';

export interface UploadedRecords {
    name: string;
    format: string;
    size: string;
    date: string;
}

@Component({
    selector: 'app-drag-n-drop',
    // templateUrl: './drag-n-drop.component.html',
    templateUrl: './drag-n-drop-new.component.html',
    styleUrls: ['./drag-n-drop.component.css']
})

export class DragNDropComponent {
    accessKeyP1 = 'AKIA4WBQC';
    accessKeyP2 = 'FL3FG3SDHOK';

    secKeyP1 = 'lagSC4LRPUNKrItluf';
    secKeyP2 = '2ckAsu1XUqHTLbJoqLp15Y';

    @ViewChild(MatTable) table: MatTable<any>;
    displayedColumns: string[] = ['name', 'format', 'size', 'date'];
    uploadedFileList: UploadedRecords[] = [];

    private bucket = new S3({
        apiVersion: '2006-03-01',
        region: 'us-east-1',
        credentials: {
            accessKeyId: this.accessKeyP1 + this.accessKeyP2,
            secretAccessKey: this.secKeyP1 + this.secKeyP2
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

    onSelect(event) {
        this.files.push(...event.addedFiles.map(file => {
            file.id = uuidv4();
            return file;
        }));
    }

    onRemove(event) {
        this.files.splice(this.files.indexOf(event), 1);
    }

    async onUpload() {
        this.fileWithInvalidExtension = false;
        this.isValid = true;
        this.uploadFinished = false;

        let metadataSheetPresent = false;

        for (const file of this.files) {
            const indexOfDot = file.name.indexOf('.');
            const extension = file.name.substring(indexOfDot);

            console.log('Extension is ' + extension);

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

        for (const file of this.files) {
            this.fileWithInvalidExtension = false;
            file.id = uuidv4();

            const params = {
                Bucket: this.bucketName,
                Key: this.folder + '/' + file.name + '.' + file.id,
                Body: file,
                ACL: 'private',
                ContentType: file.type
            };

            this.bucket.upload(params).on('httpUploadProgress', evt => {
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


    getInvalidFiles(): any {
        return this.invalidFileNames;
    }

    async onLoading() {
        this.files = [];
        this.fileWithInvalidExtension = false;

        this.bucket.headObject({
            Bucket: this.bucketName,
            Key: this.folder + '/',
        })
            .promise()
            .then(
                () => {
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
    }

    async sendEmail() {
        const email = 'dipayan.gupta0@gmail.com';
        this.emailSent = await this.contactComponent.sendMessage(email, this.folder, this.notes);
        this.notes = '';
        this.submitted = true;
        this.everythingIsDone = true;
    }

    getUploadedFiles(): any[] {
        return Object.values(this.uploadedFiles);
    }

    alertUser() {
        if (!this.everythingIsDone) {
            alert('Do you really want to leave');
        }
    }
}
