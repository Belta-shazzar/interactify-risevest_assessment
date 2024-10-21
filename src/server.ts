import { App } from "@/app";
import { AuthRoute } from "@/routes/auth.route";
import { CommentRoute } from "@/routes/comment.route";
import { UserRoute } from "@/routes/user.route";
import { PostRoute } from "@/routes/post.route";
import { AppRoute } from "@/routes/app.route";

const app = new App([
  new AppRoute(),
  new AuthRoute(),
  new UserRoute(),
  new PostRoute(),
  new CommentRoute(),
]);

app.listen()