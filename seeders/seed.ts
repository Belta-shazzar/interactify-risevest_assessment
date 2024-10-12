import { faker } from "@faker-js/faker";
import { Comment, Post, PrismaClient, User } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main(): Promise<any> {
  console.log("==Seeder initialized==");

  // Generate and seed user data
  const userData: any = await generateTenUsers();
  const users: any = await prisma.user.createManyAndReturn({
    data: userData,
    skipDuplicates: true,
  });

  // Generate and create post for user
  const postData: any = generatePostsForEachUser(users);
  const posts: any = await prisma.post.createManyAndReturn({
    data: postData,
  });

  // Generate and create comment for post
  const commentData: any = generateCommentsForEachPost(posts, users);
  await prisma.comment.createMany({
    data: commentData,
  });

  console.log("==Seeder completed==");
}

async function generateTenUsers() {
  const users: Partial<User>[] = [];

  for (let i = 0; i < 10; i++) {
    const user = {
      name: `${faker.person.firstName()} ${faker.person.lastName()}`,
      email: faker.internet.email(),
      password: await hash("password", 10),
    };

    users.push(user);
  }
  return users;
}

function generatePostsForEachUser(users: User[]) {
  const posts: Partial<Post>[] = [];

  users.forEach((user) => {
    const count: number = getRandomNumberFrom0To9();
    for (let i = 0; i < count; i++) {
      const post: Partial<Post> = {
        authorId: user.id,
        title: "This is a test title",
        content: "This is a test post content",
      };

      posts.push(post);
    }
  });

  return posts;
}

function generateCommentsForEachPost(posts: Post[], users: User[]) {
  const comments: Partial<Comment>[] = [];

  posts.forEach((post) => {
    const count: number = getRandomNumberFrom0To9();
    for (let i = 0; i < count; i++) {
      const userIndex = getRandomNumberFrom0To9();
      const user: User = users[userIndex]; // Select a random user from list of users

      const comment: Partial<Comment> = {
        postId: post.id,
        userId: user.id,
        content: "This is a test comment for post",
      };

      comments.push(comment);
    }
  });

  return comments;
}

function getRandomNumberFrom0To9(): number {
  return Math.floor(Math.random() * (9 - 0 + 1)) + 0;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
