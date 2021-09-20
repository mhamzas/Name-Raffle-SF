This app initially built for Pakistan Dreamin' 2021.

<a href="https://githubsfdeploy.herokuapp.com">
  <img alt="Deploy to Salesforce"
       src="https://raw.githubusercontent.com/afawcett/githubsfdeploy/master/deploy.png">
</a>

You can preview the app using the url: https://hosted-scratch.herokuapp.com/launch?template=https://github.com/mhamzas/Name-Raffle-SF

Please feel free to contribute and use in your projects.

Installation Steps, 
1. Create Public Experience Site (Community)
2. Drag n Drop the raffleHome LWC Component
3. Use {!session} and {!authCode} values for the component attributes (Which will be collected through QueryString)
4. Update Community Site url to the Custom Label

Usage,
1. Use the Urls generated on the Session record.
2. Moderator URL will allow RUN Raffle Button and Registration URL is for Public to Participate.
3. Participation and Raffle will run on the Session Date/Time only.
4. Once Winner is selected for any session, will be skipped for future Raffles.
