## Interactify --- RiseVest Backend Assessment

This project was built using a class-based architecture to promote a more organized and modular structure. By encapsulating related functionalities within classes, each class can focus on a specific domain, such as User, Post, and Comment management, making the code easier to manage and scale.

Prisma was chosen as the ORM because of its intuitive, type-safe query system and strong support for TypeScript. It simplifies database interactions by providing an abstraction layer that reduces the complexity of raw SQL queries while maintaining performance. Prisma's migration system ensures smooth schema evolution, making it easier to maintain and update the database structure as the project grows. Its integration with TypeScript enhances type safety, preventing runtime errors and making the code more robust.

## Query Optimization Task

`WITH UserPostCounts AS ( SELECT "authorId", COUNT(id)::INTEGER AS post_count FROM "Post" GROUP BY "authorId" ), LatestUserComments AS ( SELECT DISTINCT ON (c."userId") c."userId", c.content, c."createdAt" FROM "Comment" c ORDER BY c."userId", c."createdAt" DESC ) SELECT u.id, u.name, COALESCE(upc.post_count, 0) AS post_count, luc.content AS latest_comment, luc."createdAt" AS latest_comment_date FROM "User" u LEFT JOIN UserPostCounts upc ON u.id = upc."authorId" LEFT JOIN LatestUserComments luc ON u.id = luc."userId" ORDER BY post_count DESC LIMIT 3; `

The above query is an optimized version of what was given me in the **readme.md** of my assessment. While the query uses correlated subqueries in both the WHERE and ORDER BY clauses, which can be performance-intensive on large datasets, my query employs Common Table Expressions (CTEs) to pre-calculate post counts and latest comments, improving performance and ensuring clarity and maintainability with a structure that's easier to read, modify, or extend. Additionally, my query handles null values with COALESCE to return 0 for users with no posts, and offers flexibility for adding more complex logic without complicating the main query.

To test that it works, run `yarn seeder:seed` to seed the database after setting up the project in development mode. see [Local Development Setup](#local-development-setup)

### Link to the Assessment

[https://github.com/risevest/senior-backend-test/blob/master/README.md](https://github.com/risevest/senior-backend-test/blob/master/README.md)

## Stack

- NodeJs (TypeScript & Express)
- Postgres for pure data
- Prisma for ORM
- Redis for Caching
- Docker for Containerization
- Postman for API Documentation

## Local Development Setup

- Clone the repository
- Create a `.env` file and fill in the require fields for local development. See `.env.example` for blueprint.
- Run `yarn install` or `yarn` to install all project dependency
- Run `docker compose up` to start all services(core, database, database client) used in this application
- Run `yarn prisma:migrate` to sync models with database
- Connect to database with your choice database client

## API Documentation

[https://documenter.getpostman.com/view/20628325/2sAXxS8WmV](https://documenter.getpostman.com/view/20628325/2sAXxS8WmV)

## Live URL

[https://interactify-risevest-assessment-3.onrender.com](https://interactify-risevest-assessment-3.onrender.com)
