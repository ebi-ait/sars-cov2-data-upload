import {Component} from '@angular/core';
import * as S3 from 'aws-sdk/clients/s3';
import {v4 as uuidv4} from 'uuid';
import {ContactComponent as cc} from '../email/contact.component';
import { environment as env } from '../../environments/environment';

export interface UploadedRecords {
  name: string;
  format: string;
  size: string;
  date: string;
}

@Component({
  selector: 'app-drag-n-drop',
  templateUrl: './drag-n-drop.component.html',
  styleUrls: ['./drag-n-drop.component.css']
})
export class DragNDropComponent {
  accessKeyP1 = 's1';
  accessKeyP2 = 's2';

  secKeyP1 = 'sp1';
  secKeyP2 = 'sp2';

  displayedColumns: string[] = ['name', 'format', 'size', 'date'];
  uploadedFileList: UploadedRecords[] = [
    {name: 'hello', format: 'pdf', size: '10MB', date: '01-04-2034'},
    {name: 'world', format: 'pdf', size: '10MB', date: '01-04-2034'},
    {name: 'upload', format: 'pdf', size: '10MB', date: '01-04-2034'},
    {name: 'file', format: 'pdf', size: '10MB', date: '01-04-2034'}];

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
  listedFiles: any[];
  uploadedFiles = {};
  toShow = true;
  isValid = false;
  email: any;
  tbDisabled = false;
  toLoad: boolean;
  contactComponent = new cc();
  notes: any;

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
    for (const file of this.files) {
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

  async onLoading() {
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
  }

  loadList(): any[] {
    this.bucket.listObjects({
      Bucket: this.bucketName,
      Prefix: this.folder + '/',
      // tslint:disable-next-line:only-arrow-functions
    }, function(err, data) {
      if (err) {
        console.error(err); // an error occurred
      } else {
        console.log(data.Contents);
      }

      if (data != null) {
        this.listedFiles.concat(data.Contents);
      }
    });

    if (this.listedFiles.length > 0) {
      this.toLoad = true;
    }
    return this.listedFiles;
  }

  onReset(){
    this.folder = '';
    this.email = '';
    this.tbDisabled = false;
    this.isValid = false;
  }

  sendEmail() {
    console.log('Notes ' + this.notes);
    this.contactComponent.sendMessage(this.email, this.folder, this.notes);
  }

  getUploadedFiles(): any[] {
    return Object.values(this.uploadedFiles);
  }
}
