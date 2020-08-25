import { File } from '@ionic-native/file';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { AwsProvider } from './../../providers/aws/aws';
import { Component } from '@angular/core';
import { NavController, ActionSheetController, ToastController, LoadingController } from 'ionic-angular';
// import { ReadKeyExpr } from '@angular/compiler';
//  import {base64img} from 'base64-img';
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  images = [];
  im: any;
  im1:any;
 
  constructor(public navCtrl: NavController, private loadingCtrl: LoadingController, private toastCtrl: ToastController, private awsProvider: AwsProvider, private actionSheetCtrl: ActionSheetController,private file: File, private camera: Camera) { }
 
  ionViewWillEnter() {
    this.loadImages();
  }
 
  loadImages() {
    this.images = [];
    this.awsProvider.getFileList().subscribe(files => {
      for (let name of files) {
        this.awsProvider.getSignedFileRequest(name).subscribe(res => {
          this.images.push({key: name, url: res})
        });
      }
    });
  }
 
  presentActionSheet() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Select Image Source',
      buttons: [
        {
          text: 'Load from Library',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        },
        {
          text: 'Use Camera',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.CAMERA);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }
 
  takePicture(sourceType) {
    // Create options for the Camera Dialog
    const options: CameraOptions = {
      quality: 10,
      correctOrientation: true,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: sourceType
    }
 
    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      let base64Image = 'data:image/jpeg;base64,' + imageData;
      this.im = base64Image;
// this.im1  =   base64img.imgSync('data:image/png;base64,...','','2');
// console.log(this.im1);
      this.awsProvider.uploadFile(this.im).subscribe(result => {
        console.log("uploaded "); 
      })
  
     }, (err) => {
      // Handle error
     });
    // Get the picture
//     this.camera.getPicture(options).then((imageData) => {
    
//       let loading = this.loadingCtrl.create();
//       loading.present();
 
//       // Resolve the picture URI to a file
//       this.file.resolveLocalFilesystemUrl(imageData).then(oneFile => {
 
//         // Convert the File to an ArrayBuffer for upload
//         this.file.readAsArrayBuffer(this.file.tempDirectory, oneFile.name).then(realFile => {
//           let type = 'jpg';
//           let newName = this.awsProvider.randomString(6) + new Date().getTime() + '.' + type;
 
//           // Get the URL for our PUT request
//           this.awsProvider.getSignedUploadRequest(newName, 'image/jpeg').subscribe(data => {
//                let reqUrl = data.signedRequest;
//  console.log(reqUrl);
//             // Finally upload the file (arrayBuffer) to AWS
//             this.awsProvider.uploadFile(realFile).subscribe(result => {
 
//               // Add the resolved URL of the file to our local array
           
//               this.awsProvider.getSignedFileRequest(newName).subscribe(res => {
//                 this.images.push({key: newName, url: res});
//                 loading.dismiss();
//               });
//             });
//           });
//         });
//       }, err => {
//         console.log('err: ', err);
//       })
//     }, (err) => {
//       console.log('err: ', err);
   
    
    // });
  } 
 
  deleteImage(index) {
    let toRemove = this.images.splice(index, 1);
    this.awsProvider.deleteFile(toRemove[0]['key']).subscribe(res => {
      let toast = this.toastCtrl.create({
        message: res['msg'],
        duration: 2000
      });
      toast.present();
    })
  }
  hit(){
    this.awsProvider.hit().subscribe(res => {
      console.log("hittt");
    })
  }
}