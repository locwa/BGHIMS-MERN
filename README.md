# BGHIMS-MERN

## Modules Used

| Frontend     | Backend   | Controller | Database |   
|--------------|-----------|------------|----------| 
| Vite         | Node.js   | Express.js | MySQL    |
| React        | Sequelize |            |          |
| React-Router |           |            |          | 

## Installation and Usage
1. run `cd backend` and run `npm i`
2. run `cd ..`
3. run `cd frontend` and run `npm i`
4. run `cd ..`
5. Setup the backend <br>
5.1. create a MySQL database (The naming should be based on `backend/config/config.json`)<br> 
5.2. run `npx sequelize-cli db:migrate`<br>
5.3. run `npx sequelize-cli db:seed:all`<br>
5.4. run `cd backend` and run `npm start`<br>
6. Start the frontend <br>
6.1. run `cd frontend` and run `npm run dev`(for development build)<br>
7. 