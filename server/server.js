const express = require("express");
const path = require("path");
const { ApolloServer } = require("apollo-server-express");
const { typeDefs, resolvers } = require("./schema");
const { authMiddleware } = require("./utils/auth");
const db = require("./config/connection");

const PORT = process.env.PORT || 3001;
// create a new apollo server and pass in our schema data
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// create a new instand of an apollo server witht heg raphqls chema
const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  // integrate our apollo server with the express application as middleware
  server.applyMiddleware({ app });

  //serve up static assets
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/build")));
  }
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build/index.html"));
  });

  db.once("open", () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
    });
  });
};

startApolloServer(typeDefs, resolvers);
