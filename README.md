# Simple CRUD-api 

## How to start
1. clone the repo

        git clone https://github.com/kritskaya/CRUD-api.git

2. move to the created folder

        cd CRUD-api

3. checkout to the development branch

        git checkout develop

4. install all dependencies

        npm i

## How to run application


Run the app in development mode

    npm run start:dev


Run the app in production mode

    npm run start:prod


Run tests scenarios (server started from previos commands should be closed)

    npm test


Run app in cluster mode with one in-memory db for all processes

    npm run start:multi

___


In the console you can see which of the workers responsed on the request.  
Workers are used by round-robin algorithm and the database is consistent between all workers.