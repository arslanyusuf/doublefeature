This is a project I started to keep track of my double feature pairings because I got bored of writing them in a word document. I've made it so anyone can sign up for free and share their own pairings.

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------

After cloning the repo you'll need to add a ".env" file in the root of the folder that includes:

MONGO_URI = 'mongodb+srv://<username>:<password>@<clustername>.ebdfa.mongodb.net/<MyFirstDatabase>?retryWrites=true&w=majority'
  Replace all the fields between <> with the appropriate information from your MongoDB Database.
  
TMDB_API_KEY = ;
  You can get a TMDB API Key from the TMDB website.
  
EMAIL_HOST = ;
EMAIL_USER = ;
EMAIL_PASS = ;
  These are the email credentials you'll need to setup to send verification emails.
  
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
