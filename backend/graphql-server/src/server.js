import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

await server.start();

app.use(
  '/graphql',
  cors(),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      let currentUser = null;
      const authHeader = req.headers.authorization || '';
      if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
          currentUser = jwt.verify(token, JWT_SECRET);
        } catch (e) {
          console.error("Invalid token");
        }
      }
      return { currentUser };
    },
  })
);

app.listen(PORT, () => {
  console.log(`GraphQL Server is running at http://localhost:${PORT}/graphql`);
});
