import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROTO_PATH = path.resolve(__dirname, '../../protos/catalog.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const catalogProto = grpc.loadPackageDefinition(packageDefinition).catalog;

const client = new catalogProto.CatalogService(
  'localhost:50054',
  grpc.credentials.createInsecure()
);

console.log('Calling SearchTrips (TP.HCM -> Đà Lạt, 2026-07-27)...');
client.searchTrips({
  origin: 'TP.HCM',
  destination: 'Đà Lạt',
  date: '2026-07-27'
}, (err, response) => {
  if (err) {
    console.error('searchTrips Error:', err);
    process.exit(1);
  }
  console.log('searchTrips Response:', JSON.stringify(response, null, 2));
  
  console.log('Calling GetTripDetail for trip_test_001...');
  client.getTripDetail({ trip_id: 'trip_test_001' }, (err2, response2) => {
    if (err2) {
      console.error('getTripDetail Error:', err2);
      process.exit(1);
    }
    console.log('getTripDetail Response:', JSON.stringify(response2, null, 2));
    process.exit(0);
  });
});
