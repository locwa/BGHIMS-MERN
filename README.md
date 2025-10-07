# BGHIMS-MERN

## Modules Used

| Frontend      | Backend   | Controller | Database |   
|---------------|-----------|------------|----------| 
| Vite          | Node.js   | Express.js | MySQL    |
| React         | Sequelize |            |          |
| React-Router  | SheetJS   |            |          | 
| TailwindCSS   |           |            |          |
| Font Awesome  |           |            |          |  

## Installation and Usage
>[!IMPORTANT]
> Make sure that you are in the `BGHIMS-MERN` project directory 
1. run `cd backend` and run `npm i`
2. run `cd ..`
3. run `cd frontend` and run `npm i`
4. run `cd ..`
5. Set up and start the backend <br>
5.1. create a MySQL database (The naming should be based on `backend/config/config.json`)<br> 
5.2. run `npx sequelize-cli db:migrate`<br>
5.3. (Optional for dev environment) run `npx sequelize-cli db:seed:all`<br>
5.4. run `cd backend` and run `npm start`<br>
6. Start the frontend <br>
6.1. start a new terminal and go to the `BGHIMS-MERN` directory<br>
6.2. run `cd frontend` and run `npm run dev`(for development build)<br>
## Sequelize Migration Commands
Run migrations:
```
npx sequelize-cli db:migrate
```
Undo most recent migration:
```
npx sequelize-cli db:migrate:undo
```
Undo all migrations:
```
npx sequelize-cli db:migrate:undo:all --to XXXXXXXXXXXXXX-create-posts.js
```

## Sequelize Seeding Commands
Run seeds:
```
npx sequelize-cli db:seed:all
```
Undo most recent seed:
```
npx sequelize-cli db:seed:undo
```
Undo specific seed:
```
npx sequelize-cli db:seed:undo --seed name-of-seed-as-in-data
```
Undo all seeds:
```
npx sequelize-cli db:seed:undo:all
```