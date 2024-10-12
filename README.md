## Interactify --- RiseVest Backend Assessment

This project was built using a class-based architecture to promote a more organized and modular structure. By encapsulating related functionalities within classes, each class can focus on a specific domain, such as User, Post, and Comment management, making the code easier to manage and scale.

Prisma was chosen as the ORM because of its intuitive, type-safe query system and strong support for TypeScript. It simplifies database interactions by providing an abstraction layer that reduces the complexity of raw SQL queries while maintaining performance. Prisma's migration system ensures smooth schema evolution, making it easier to maintain and update the database structure as the project grows. Its integration with TypeScript enhances type safety, preventing runtime errors and making the code more robust.

## Stack
- NodeJs (TypeScript & Express)
- Postgres for pure data
- Prisma for ORM
- Redis for Caching
- Docker for Containerization
- Postman for API Documentation



## Local Development Setup

Docker and Git are Prerequisites.

- Clone the repository
- Create a `.env` file and fill in the required fields. See `.env.example` for blueprint. (For the database url, get it from the docker-compose.dev.yml)
- Run `./start.sh -e dev -c up-build` to build and start the dev container
- Run `./start.sh -e dev -c exec -s server -r "npm run prisma:migrate" ` to sync the database with the prisma defines models
- Connect to the database with your preferred database client
- Test endpoints on your preferred API testing tool

## Test set up
- Clone the repository
- Run `./start.sh -e test -c up-build` to build and start/run the test container


## API Documentation

[https://documenter.getpostman.com/view/20628325/2sAXxS8WmV](https://documenter.getpostman.com/view/20628325/2sAXxS8WmV)
