import { GraphQLError } from 'graphql';
import { grpcClients, callUnary } from './grpcClients.js';

function toGraphQLError(error, fallbackMessage = 'Internal server error') {
  if (error.code === 5) { // NOT_FOUND
    return new GraphQLError(error.details || 'Resource not found', {
      extensions: { code: 'NOT_FOUND' }
    });
  }
  if (error.code === 3) { // INVALID_ARGUMENT
    return new GraphQLError(error.details || 'Invalid argument', {
      extensions: { code: 'BAD_USER_INPUT' }
    });
  }
  if (error.code === 6) { // ALREADY_EXISTS
    return new GraphQLError(error.details || 'Resource already exists', {
      extensions: { code: 'ALREADY_EXISTS' }
    });
  }
  if (error.code === 16) { // UNAUTHENTICATED
    return new GraphQLError(error.details || 'Unauthenticated', {
      extensions: { code: 'UNAUTHENTICATED' }
    });
  }
  return new GraphQLError(fallbackMessage, {
    extensions: { code: 'INTERNAL_SERVER_ERROR' }
  });
}

export const resolvers = {
  Query: {
    me: async (_, __, context) => {
      if (!context.currentUser) {
        return null;
      }
      try {
        const response = await callUnary(grpcClients.user, 'GetProfile', { id: context.currentUser.sub });
        return response.user;
      } catch (error) {
        return null;
      }
    }
  },
  Mutation: {
    register: async (_, { name, email, password }) => {
      try {
        const response = await callUnary(grpcClients.user, 'Register', { name, email, password });
        // After register, we should probably login to get the token.
        // But our gRPC Register returns only User. Let's auto-login if needed,
        // or just throw if we can't get a token. Wait, the user.proto only returns User for Register.
        // I'll call Login right after Register to get the token.
        const loginResponse = await callUnary(grpcClients.user, 'Login', { email, password });
        return loginResponse;
      } catch (error) {
        throw toGraphQLError(error, 'Cannot register user');
      }
    },
    login: async (_, { email, password }) => {
      try {
        const response = await callUnary(grpcClients.user, 'Login', { email, password });
        return response;
      } catch (error) {
        throw toGraphQLError(error, 'Cannot login');
      }
    }
  }
};
