import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {WebcamImage, WebcamInitError, WebcamUtil} from 'ngx-webcam';

import {
  SpeechSynthesisUtteranceFactoryService,
  SpeechSynthesisService,
} from '@kamiazya/ngx-speech-synthesis';

const subscriptionKey = '2b8282930bf6447fb8fc107625a7036b';

const OctetHttpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/octet-stream',
    'Ocp-Apim-Subscription-Key': subscriptionKey
  })
};

const FaceApiBaseUrl = "https://westcentralus.api.cognitive.microsoft.com/face/v1.0/";

const jsonHttpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
    'Ocp-Apim-Subscription-Key': subscriptionKey
  })
};

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.css'],
  providers: [
    SpeechSynthesisUtteranceFactoryService,
  ],
})
export class CameraComponent implements OnInit {


  constructor(
    private http:HttpClient,
    public f: SpeechSynthesisUtteranceFactoryService,
    public svc: SpeechSynthesisService,) { }

    
    speech(textToSpeak: string) {
      this.svc.speak(this.f.text(textToSpeak));
    }
  
    cancel() {
      this.svc.cancel();
    }
    pause() {
      this.svc.pause();
    }
  
    resume() {
      this.svc.resume();
    }

  @Output()
  public pictureTaken = new EventEmitter<WebcamImage>();

  // toggle webcam on/off
  public showWebcam = true;
  public allowCameraSwitch = true;
  public multipleWebcamsAvailable = false;
  public deviceId: string;
  public videoOptions: MediaTrackConstraints = {
    // width: {ideal: 1024},
    // height: {ideal: 576}
  };
  public errors: WebcamInitError[] = [];

  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();
  // switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
  private nextWebcam: Subject<boolean|string> = new Subject<boolean|string>();

  public ngOnInit(): void {
    WebcamUtil.getAvailableVideoInputs()
      .then((mediaDevices: MediaDeviceInfo[]) => {
        this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
      });

  }


  public handleImage(webcamImage: WebcamImage): void {
    console.info('received webcam image', webcamImage);
    //console.log(webcamImage.imageAsBase64)
    this.DetectImage(webcamImage.imageAsDataUrl)

    this.pictureTaken.emit(webcamImage);
  }

  public DetectImage(base64Image: string)
  {
    var blobImage = this.makeblob(base64Image);
    console.log(blobImage);
    this.CallDetectImageApi(blobImage)
    
  }

  public CallDetectImageApi(blobImage)
  {
    this.http.post(FaceApiBaseUrl+'detect?returnFaceId=true&returnFaceLandmarks=false&returnFaceAttributes=age%2Cgender%2Cemotion&recognitionModel=recognition_02',
    blobImage,
    OctetHttpOptions).
    subscribe((result) => this.detectSuccess(result), (error) => console.log(error));
  }

  detectSuccess(result: any) {
    
    this.CallIdentifyApi(result)
  }

  public CallIdentifyApi(detectResult)
  {
    var faceIds = [];

    detectResult.forEach(element => {
        faceIds.push(element.faceId);
    });

    var IdentifyBody = {
        "personGroupId": "tlagroup",
        "faceIds": faceIds,
        "maxNumOfCandidatesReturned": 1,
        "confidenceThreshold": 0.5
    };

    this.http.post(FaceApiBaseUrl+'identify',
    IdentifyBody,
    jsonHttpOptions).
    subscribe((result) => this.identifySuccess(result), (error) => console.log(error));

  }

  identifySuccess(result: any) {
    
    result.forEach(element => {
        console.log(element)
        if(element.candidates.length < 1)
        {
          this.speech("Authentication Failed!");
        }
        element.candidates.forEach(element2 => {
          this.CallPersonInfoApi(element2.personId);
        });
    });

    
  }

  public CallPersonInfoApi(personId : string)
  {
    this.http.get(FaceApiBaseUrl+"persongroups/tlagroup/persons/"+personId,
    jsonHttpOptions).
    subscribe((result) => this.personInfoSuccess(result), (error) => console.log(error));
  }

  personInfoSuccess(result: any) {
    var jsonObject: any = result;
    console.log(jsonObject.name);
    this.speech("Authentication Successful. Welcome "+jsonObject.name);
    this.speech("What can I do for you?");

  }



  public triggerSnapshot(): void {
    this.trigger.next();
  }

  public toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }

  public handleInitError(error: WebcamInitError): void {
    this.errors.push(error);
  }

  public showNextWebcam(directionOrDeviceId: boolean|string): void {
    // true => move forward through devices
    // false => move backwards through devices
    // string => move to device with given deviceId
    this.nextWebcam.next(directionOrDeviceId);
  }

  

  private makeblob(dataURL) {
      const BASE64_MARKER = ';base64,';
      const parts = dataURL.split(BASE64_MARKER);
      const contentType = parts[0].split(':')[1];
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);

      for (let i = 0; i < rawLength; ++i) {
          uInt8Array[i] = raw.charCodeAt(i);
      }

      return new Blob([uInt8Array], { type: contentType });
  }

  public cameraWasSwitched(deviceId: string): void {
    console.log('active device: ' + deviceId);
    this.deviceId = deviceId;
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public get nextWebcamObservable(): Observable<boolean|string> {
    return this.nextWebcam.asObservable();
  }

  
  

  //ngOnInit() {
    
  //}

  

  // makeblob(dataURL) {
  //   const BASE64_MARKER = ';base64,';
  //   const parts = dataURL.split(BASE64_MARKER);
  //   const contentType = parts[0].split(':')[1];
  //   const raw = window.atob(parts[1]);
  //   const rawLength = raw.length;
  //   const uInt8Array = new Uint8Array(rawLength);

  //   for (let i = 0; i < rawLength; ++i) {
  //     uInt8Array[i] = raw.charCodeAt(i);
  //   }

  //   return new Blob([uInt8Array], { type: contentType });
  // }

  //body = this.makeblob(dataURL);
  
}
