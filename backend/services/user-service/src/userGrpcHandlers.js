import grpc from '@grpc/grpc-js';

function toGrpcError(error) {
  if (error.code === 'INVALID_ARGUMENT') {
    return { code: grpc.status.INVALID_ARGUMENT, message: error.message };
  }
  if (error.code === 'ALREADY_EXISTS') {
    return { code: grpc.status.ALREADY_EXISTS, message: error.message };
  }
  if (error.code === 'UNAUTHENTICATED') {
    return { code: grpc.status.UNAUTHENTICATED, message: error.message };
  }
  if (error.code === 'NOT_FOUND') {
    return { code: grpc.status.NOT_FOUND, message: error.message };
  }
  return { code: grpc.status.INTERNAL, message: 'Internal server error' };
}

export function createUserGrpcHandlers(userService) {
  return {
    async Register(call, callback) {
      try {
        const user = await userService.register(call.request);
        callback(null, { user });
      } catch (error) {
        callback(toGrpcError(error));
      }
    },
    async Login(call, callback) {
      try {
        const { user, token } = await userService.login(call.request);
        callback(null, { user, token });
      } catch (error) {
        callback(toGrpcError(error));
      }
    },
    async GetProfile(call, callback) {
      try {
        const user = await userService.getProfile(call.request.id);
        callback(null, { user });
      } catch (error) {
        callback(toGrpcError(error));
      }
    }
  };
}
