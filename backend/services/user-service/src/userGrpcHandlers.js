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
        console.error("UserService Register failed:", error);
        callback(toGrpcError(error));
      }
    },
    async Login(call, callback) {
      try {
        const { user, token } = await userService.login(call.request);
        callback(null, { user, token });
      } catch (error) {
        console.error("UserService Login failed:", error);
        callback(toGrpcError(error));
      }
    },
    async GetProfile(call, callback) {
      try {
        const user = await userService.getProfile(call.request.id);
        callback(null, { user });
      } catch (error) {
        console.error("UserService GetProfile failed:", error);
        callback(toGrpcError(error));
      }
    },
    async AddSavedPassenger(call, callback) {
      try {
        const { user_id, name, email, phone } = call.request;
        const passenger = await userService.addSavedPassenger({ userId: user_id, name, email, phone });
        callback(null, { passenger });
      } catch (error) {
        callback(toGrpcError(error));
      }
    },
    async GetSavedPassengers(call, callback) {
      try {
        const { user_id } = call.request;
        const passengers = await userService.getSavedPassengers(user_id);
        callback(null, { passengers });
      } catch (error) {
        callback(toGrpcError(error));
      }
    },
    async DeleteSavedPassenger(call, callback) {
      try {
        const { id } = call.request;
        await userService.deleteSavedPassenger(id);
        callback(null, { success: true });
      } catch (error) {
        callback(toGrpcError(error));
      }
    }
  };
}
