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

## Server API

Implemented endpoint:  
`api/users` or `api/users/` (final slash is allowed)

Methods:

**GET** `api/users` is used to get all persons  
Server should answer with status code 200 and all users records
  
**GET** `api/users/${userId}`  
Server answers with status code **200** and record with `id === userId` if it exists  
Server answers with status code **400** and corresponding message if `userId` is invalid (not uuid)  
Server answers with status code **404** and corresponding message if record with `id === userId` doesn't exist  
   
**POST** `api/users is used` to create record about new user and store it in database  
Server answers with status code **201** and newly created record  
Server answers with status code **400** and corresponding message if request body does not contain required fields  
   
**PUT** `api/users/{userId}` is used to update existing user  
Server answers with status code **200** and updated record  
Server answers with status code **400** and corresponding message if `userId` is invalid (not uuid)  
Server answers with status code **404** and corresponding message if record with `id === userId` doesn't exist  
   
**DELETE** `api/users/${userId}` is used to delete existing user from database  
Server answers with status code **204** if the record is found and deleted  
Server answers with status code **400** and corresponding message if `userId` is invalid (not uuid)  
Server answers with status code **404** and corresponding message if record with `id === userId` doesn't exist  