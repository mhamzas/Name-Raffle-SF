import { LightningElement,wire,api } from 'lwc';
//import getParticipants from '@salesforce/apex/raffleHandler.getParticipants';
import getParticipants from '@salesforce/apex/raffleHandler.getParticipantsForRaffle';
import newWinner from '@salesforce/apex/raffleHandler.createRecord';
import getWinners from '@salesforce/apex/raffleHandler.getWinners';
export default class Raffle extends LightningElement {
    @api sessionId;
    headerNames='Are you READY?';
    sessionName;
    // Add list of names here
    namesList = [];
    winners=[];
    winnerEmails = [];
    participants={};
    //partEmails = {};
    intervalHandle = null;
    showTimer = true;
    showStartBtn = false;
    showStopBtn = false;
    showWinner= false;
    rec = {
        sobjectType: 'Winners__c',
        Name : '',
        Session__c: '',
        Participant__c: ''
    };

    @wire(getParticipants, {sessionId: '$sessionId'})
    wiredParticipants({error, data}) {
        if (data) {
            // console.log(this.sessionId);
			// console.log('Participants: ' + JSON.stringify(data));
            this.sessionName = data[0].Session__r.Schedule_name__c;

            // Getting all the Winners to compare with the namesList
            getWinners().then(result =>{
                this.winners = result;
                //console.log('Winners'+JSON.stringify(result));
                // Winner Emails
                for(let i = 0; i < result.length; i++) {
                    this.winnerEmails.push(result[i].Participant__r.Webassessor_Email__c);
                }
                
            }).catch(error=>{
                console.log("error", JSON.stringify(error));
            });

            ///console.log('WinnerNames ::'+ JSON.stringify(this.winnerEmails));
            //Looping on all the participants
            for(let i = 0; i < data.length; i++) {
                // Populating Object/Map for Participants against their Name
                this.participants[data[i].Name] = data[i].Id; 
                //this.partEmails[data[i].Webassessor_Email__c] = data[i].Id;
                //console.log('this.winnerEmails.indexOf('+data[i].Webassessor_Email__c+')='+this.winnerEmails.indexOf(data[i].Webassessor_Email__c))
                // // Checking if this.winners doesn't contain this.partEmails
                if(this.winnerEmails.indexOf(data[i].Webassessor_Email__c) === -1) {
                    this.namesList.push(data[i].Name);
                }

                // // Checking if participant is already in the winners list
                // if(this.winners.indexOf(data[i].Name) == -1) {
                //     if(!data[i].Name.includes("Saad")) {
                //         this.namesList.push(data[i].Name);
                //     }
                // }
            }
            this.showStartBtn=true;
            //console.log('Eligible Names'+JSON.stringify(this.namesList));
        } else if (error) {
            console.log('error: ' + JSON.stringify(error));
            this.showStartBtn = false;
            this.showStopBtn = false;
            if(error.body.message){
                this.headerNames =error.body.message;
            }
        }
    }

    startRaffle(event) {
        let i = 0;
        this.showStartBtn = false;
        this.showStopBtn = true;
        this.intervalHandle = setInterval(function () {
            this.headerNames = this.namesList[i++ % this.namesList.length];
        }.bind(this), 50); //https://omkardeokar95.medium.com/how-setinterval-is-bad-and-a-way-to-make-your-life-better-in-lwc-salesforce-8c0b2fc082da
    }
    stopRaffle(event) {
        this.showStartBtn = false;
        this.showStopBtn = false;
        clearInterval(this.intervalHandle);
        this.showWinner=true;

        //Get Winner Name
        let winnerName = this.headerNames;
        // Getting Participant Id
        let participantId = this.participants[winnerName];
        this.rec.Participant__c=participantId;
        this.rec.Name=winnerName;
        this.rec.Session__c=this.sessionId;
        console.log(JSON.stringify(this.rec));
        //Creating DB record
        newWinner({data:this.rec}).then(result =>{
                console.log(JSON.stringify(result));
        }).catch(error=>{
            console.log("error", JSON.stringify(error));
        });
    }
}