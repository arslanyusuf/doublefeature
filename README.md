This is a project I started to keep track of my double feature pairings because I got bored of writing them in a word document. I've made it so anyone can sign up for free and share their own pairings.

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------

After cloning the repo you'll need to add a ".env" file in the root of the folder that includes:  


Replace all the fields between <> with the appropriate information from your MongoDB Database.
```
MONGO_URI = 'mongodb+srv://<username>:<password>@<clustername>.ebdfa.mongodb.net/<MyFirstDatabase>?retryWrites=true&w=majority'  
```

You can get a TMDB API Key from the TMDB website.
```
TMDB_API_KEY = ;  
```

These are the email credentials you'll need to setup to send verification emails.
```
EMAIL_HOST = ;
EMAIL_USER = ;
EMAIL_PASS = ; 
```
  
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Run the following command to install all the packages and their dependencies
```
  npm install
```

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Run the following command to run the app
```
  npm run dev
```
