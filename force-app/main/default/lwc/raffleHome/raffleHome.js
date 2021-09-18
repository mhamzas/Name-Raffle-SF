import { LightningElement,api, wire } from 'lwc';
import newParticipant from '@salesforce/apex/raffleHandler.createRecord';
import getSession from '@salesforce/apex/raffleHandler.getSession';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class RaffleHome extends LightningElement {
    // Flexipage provides recordId and objectApiName
    @api sessionKey;
    @api authCode;
    authCodeValid=false;
    sessionData;
    sessionId;
    showError= false;
    showForm = false;
    showSuccess=false;
    recData;
    title;
    showRaffle=false;

    rec = {
        sobjectType: 'Participant__c',
        Name : '',
        Email__c : '',
        Phone__c : '',
        Webassessor_Email__c: '',
        City__c: '',
        Country__c: ''
    };

    @wire(getSession, {sessionKey: '$sessionKey'})
    wiredSession({error, data}) {
        if (data) {
			//console.log('sessionData: ' + JSON.stringify(data));
            this.sessionData = data;
            this.sessionId = this.sessionData.Id;
            this.title='Participate for the Raffle - '+this.sessionData.Schedule_name__c;
            // Making sure the authCode is valid
            //console.log(this.authCode+' && '+this.authCode+'==='+this.sessionData.AuthCode__c);
            if(this.authCode && this.authCode===this.sessionData.AuthCode__c){
                this.authCodeValid = true;
                this.showRaffle=true;
                this.showForm=false;
                //console.log("authCodeValid");
            } else {
                // Timestamp Comparison to make sure the session time has started
                // console.log(new Date(Date.parse(this.sessionData.Start_Date__c+' '+this.msToTime(this.sessionData.Start_Time__c))).toUTCString()+ '<' +new Date().toUTCString());
                // console.log(new Date(Date.parse(this.sessionData.Start_Date__c+' '+this.msToTime(this.sessionData.End_Time__c))).toUTCString()+ '>' +new Date().toUTCString());
                // if(new Date(Date.parse(this.sessionData.Start_Date__c+' '+this.msToTime(this.sessionData.Start_Time__c))).toUTCString() < new Date().toUTCString() && new Date(Date.parse(this.sessionData.Start_Date__c+' '+this.msToTime(this.sessionData.End_Time__c))).toUTCString() > new Date().toUTCString()){
                //     // Checking if event end time is 15min after the start time
                //     console.log(new Date(Date.parse(this.sessionData.Start_Date__c+' '+this.msToTime(this.sessionData.End_Time__c - 15*60*1000))).toUTCString() +'> '+new Date().toUTCString());
                //     if(new Date(Date.parse(this.sessionData.Start_Date__c+' '+this.msToTime(this.sessionData.End_Time__c - 15*60*1000))).toUTCString() < new Date().toUTCString()){
                //         this.showError = true;
                //         this.showForm = false;
                //     } else{
                //         this.showError = false;
                //         this.showForm = true;
                //     }
                // } else {
                    this.showError = false;
                    this.showForm = true;
                //}
            }
            //console.log('sessionData: ' + JSON.stringify(this.sessionData));
        } else if (error) {
            console.log('error: ' + JSON.stringify(error));
            this.showError = true;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'HHmm.. that did not work!',
                    message: error.body.message,
                    variant: 'error',
                }),
            );
        }
    }

    connectedCallback() {
        if(this.authCodeValid) { 
         this.showRaffle=true;
        }
    }
    handleFieldChange(event) {

        if(event.target.label==='Name'){
            this.rec.Name = event.target.value;
        }
        if(event.target.label==='Email'){
            this.rec.Email__c = event.target.value;
        }
        if(event.target.label==='Webassessor Email'){
            this.rec.Webassessor_Email__c = event.target.value;
        }
        if(event.target.label==='Phone'){
            this.rec.Phone__c = event.target.value;
        }
        if(event.target.label==='City'){
            this.rec.City__c = event.target.value;
        }
        if(event.target.label==='Country'){
            this.rec.Country__c = event.target.value;
        }
    }

    createParticipant(event){
        this.rec.Session__c = this.sessionData.Id;
		//console.log(this.rec);
        newParticipant({data:this.rec})
        .then(result =>{
            this.message = result;
                this.error = undefined;
                if(this.message !== undefined) {
										this.showForm = false;
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'You have successfully registered!',
                            variant: 'success',
                        }),
                    );
                }
                this.showForm=false;
                this.showSuccess=true;
                console.log(JSON.stringify(result));
                console.log("result", this.message);
                
        })
        .catch(error=>{
            this.message = undefined;
            this.error = error;
            
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'HHmm.. that did not work!',
                    message: error.body.message,
                    variant: 'error',
                }),
            );
            console.log("error", JSON.stringify(this.error));
        });
    }

    msToTime(s){
        let ms = s % 1000;
        s = (s - ms) / 1000;
        let secs = s % 60;
        s = (s - secs) / 60;
        let mins = s % 60;
        let hrs = (s - mins) / 60;
        hrs = hrs < 10 ? '0' + hrs : hrs;
        mins = mins < 10 ? '0' + mins : mins;
        //console.log(hrs + '  ' + mins);
        //return hrs+':' + mins + ':00.000Z';
        return hrs+':' + mins + ':00 GMT+5';
    }

}