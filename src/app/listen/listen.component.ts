import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { Words } from './../words';
import { SpeechService } from './../speech.service';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import { DataServiceService } from 'app/services/data-service.service';

@Component({
  selector: 'app-listen',
  templateUrl: './listen.component.html',
  styleUrls: ['./listen.component.scss']
})
export class ListenComponent implements OnInit, OnDestroy {

  
  @Output() searchedData: EventEmitter<any> = new EventEmitter();

  nouns: string[] = new Words().array;
  verbs: string[] = new Words().array;
  adjs: string[] = new Words().array;
  nounSub: Subscription;
  verbSub: Subscription;
  adjSub: Subscription;
  arrayFull: string;
  errorsSub: Subscription;
  errorMsg: string;
  textField: string = '';
  patentCollections : string;
  publicationNumber: string = '';
  public suggestedData: string = '';

 
 oxygenCorona = [
  { serialNo: 1,publicationNumber: "US6290801B1", title: 'Cold seal package and method for making the same' , dwpiTitle : 'Cold seal package including two substrates sealed together by a non resealable seal'},
   { serialNo: 2,publicationNumber: "EP3810425A1", title: ' METHODS OF FORMING CONTACT LENSES TO CONTAIN BIOACTIVE AGENTS' , dwpiTitle : 'Method for forming and/or using contact lens, involves pad printing bioactive agents to form layer, and curing layer to form portion of contact lens, and forming contact lens so that layer of agents is fixed within interior of lens'},
   { serialNo: 3,publicationNumber: "CA2224856C", title: 'SURFACE MODIFICATION OF POLYMERS AND CARBON-BASED MATERIALS' , dwpiTitle : 'Polymeric material having a thin surface layer enriched with silicon comprises material modified chemically for gradation of layers through to unmodified material, useful for water resistant package or textile'},
];


  constructor(private dataService: DataServiceService, public speech: SpeechService) { }

  ngOnInit() {
    this.speech.init();
    // this._listenNouns();
    // this._listenVerbs();
    // this._listenAdj();
    
    this._listenErrors();
    this._listentextField();
    this._listenPublicationNumber();
    this._listenSubmit();
    this._listenReadTheRecords();
    this._listenStopReadRecords();
  }

  get btnLabel(): string {
    return this.speech.listening ? 'Listening...' : 'Listen';
  }

  private _listentextField(){
     this.speech.textField$.subscribe((item :any)=>{
       console.log(item)
       this._setError();
      this.textField = item.textField;
      this.suggestedData = this.dataService.getPnBySearch(this.textField);
    })
  }

  private _listenReadTheRecords(){
    this.speech.readTheRecords$.subscribe((item :any)=>{
      console.log(item);
      this._setError();
    //  this.textField = item.textField
      if(item){
        this.speech.synthesizeSpeechFromText("Say Stop if you want to stop");
        this.oxygenCorona.forEach(record=>{
          this.speech.synthesizeSpeechFromText("Record Number " + record.serialNo + " "+ record.title);
        })
        // this.speech.synthesizeSpeechFromText("hello");
        this.speech.readTheRecords$.next(false)
      }
   })
 }

 private _listenStopReadRecords(){
  this.speech.stopReading$.subscribe((item :any)=>{
    console.log(item);
    this._setError();
  //  this.textField = item.textField
    if(item){
      this.speech.stopSynthesize();
      this.speech.stopReading$.next(false)
    }
 })
}

  private _listenPublicationNumber(){
    this.speech.publicationNumber$.subscribe((item :any)=>{
      console.log(item)
      this._setError();
     this.publicationNumber = item
   })
 }

 private _listenSubmit(){
  this.speech.submit$.subscribe((item :any)=>{
    console.log(item)
    this._setError();
    if(item){
      this.submitForm()
      this.speech.submit$.next(false)
    }
  
 })
}


 public submitForm() {
   //alert("you have submiited TEXT FIELD ="+ this.textField + " PUBLICATION NUMBER = " +  this.publicationNumber);
  this.speech.synthesizeSpeechFromText("would you like me to read the titles.. yes or no");
  this.dataService.searchedQuery.next({text: this.textField, pnNumber: this.publicationNumber});
 }

  // private _listenNouns() {
  //   this.nounSub = this.speech.words$
  //     .filter(obj => obj.type === 'noun')
  //     .map(nounObj => nounObj.word)
  //     .subscribe(
  //       noun => {
  //         this._setError();
  //         this.nouns = this._updateWords('nouns', this.nouns, noun);
  //       }
  //     );
  // }



  private _listenErrors() {
    this.errorsSub = this.speech.errors$
      .subscribe(err => this._setError(err));
  }

  private _setError(err?: any) {
    if (err) {
      console.log('Speech Recognition:', err);
      this.errorMsg = err.message;
    } else {
      this.errorMsg = null;
    }
  }

  ngOnDestroy() {
    this.errorsSub.unsubscribe();
  }

  getSuggestions() {
    this.suggestedData = this.dataService.getPnBySearch(this.textField);
  }

  selectedQuery(data: any) {
    this.textField = data;
    this.dataService.searchedQuery.next({text: data, pnNumber: this.publicationNumber});
    this.suggestedData = '';
  }
}
