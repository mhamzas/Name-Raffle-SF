/**
 * @description       : 
 * @author            : M Hamza Siddiqui
 * @group             : 
 * @last modified on  : 09-16-2021
 * @last modified by  : M Hamza Siddiqui
**/
public without sharing class raffleHandler {
    public raffleHandler() {}

    public class CustomException extends Exception {}
    
    public static CustomException createCustomException(String message) {
        CustomException ex = new CustomException(message);
        ex.setMessage(message);
        return ex;
    }

    @AuraEnabled(cacheable=true)
    public static Session__c getSession(String sessionKey) { 
        Session__c session = new Session__c();
        if(!String.isEmpty(sessionKey)){
            session = [select id, Start_Date__c,Start_Time__c, End_Time__c, Schedule_name__c, AuthCode__c from Session__c where Key__c = :sessionKey];
            if(session != null){
                List<Winners__c> winners = [Select id, Name from Winners__c where Session__c=:session.Id];
                if(winners!=null && winners.size()>0){
                    throw createCustomException('Winner: '+winners[0].Name);
                }
            }
        }
        return session;
    }

    @AuraEnabled(cacheable=true)
    public static List<Winners__c> getWinners() { 
        List<Winners__c> winners = new List<Winners__c>();
        winners = [select id, Participant__r.Name, Participant__r.Webassessor_Email__c from Winners__c];
        return winners;
    }

    @AuraEnabled(cacheable=true)
    public static List<Participant__c> getParticipants(String sessionId) { 
        List<Participant__c> participants = new List<Participant__c>();
        if(!String.isEmpty(sessionId)){
            participants = [select id, name, Session__r.Start_Time__c, Session__r.End_Time__c, Session__r.Schedule_name__c from Participant__c where Session__r.Id = :sessionId];
        }

        if(participants!=null && participants.size()>0){
            List<Winners__c> winners = [Select id, Name from Winners__c where Session__c=:sessionId];
            if(winners!=null && winners.size()>0){
                throw createCustomException('Winner: '+winners[0].Name);
            }
        }
        return participants;
    }

    @AuraEnabled
    public static Boolean createRecord(sObject data){
        try{
            insert data;
        }
        catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
        return true;
    }

}