# EzDues Backend

## Prerequisites

- Install `node_modules`, by running the following command (Note: package manager used for this project is **npm**)
  ```console
  $ npm i
  ```
- Create a `.env` file, with the following contents:

  ```env
  PORT=5000
  NODE_ENV='development' # would be subject to change.
  ```

- Install MySQL server and MySQL Workbench.

- Create Database as per the URI set in the env

- Apply migrations to database by running the following command:
  ```console
  $ npm run prisma migrate dev
  ```

## How to run?

- For development (You are most likely concerned with this command)
  ```console
  $ npm run dev
  ```

- For non-daemon process
  ```console
  $ npm run start
  ```

## Database (MySQL with Prisma)

1. Make sure that you have populated the `DATABASE_URL` environment variable in your `.env` file with a valid URL.
2. Populate the file `prisma/schema.prisma` with appropriate models.
3. Run the following command:
   ```console
   $ npm run prisma migrate dev --name <NAME>
   ```
   Here _NAME_ is the name of the migration you wish to give.
4. The above command takes care of 2 things:
   - Makes appropriate changes to the database.
   - generates `@prisma/client` which has typing and functions for each model as ORM.
5. The `prisma/seed.js` file creates a Super Admin whenever we migrate prisma or we can do it manually by command:
    ```console
   $ npx prisma db seed
   ```

## Conventions you might wanna abide by.

- Use _kebab-case_ for URL paths.

  - Undesirable Examples:
    - `/user/forgotPassword` ❌
    - `/User/Forgot-Password` ❌
    - `/get_User_Details` ❌
  - Acceptable Examples:
    - `/user/forgot-password` ✅
    - `/get-user-details` ✅
