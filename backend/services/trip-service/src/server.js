import "dotenv/config";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";
import { tripService } from "./tripService.js";

const PROTO_PATH = path.resolve(process.cwd(), "../../protos/trip.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const tripProto = grpc.loadPackageDefinition(packageDefinition).trip;

function main() {
  const server = new grpc.Server();
  server.addService(tripProto.TripService.service, tripService);

  const PORT = process.env.PORT || 50054;
  server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(`Trip Service running on port ${port}`);
  });
}

main();
