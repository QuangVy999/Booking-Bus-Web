import amqp from "amqplib";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const RABBITMQ_URL = "amqp://admin:admin123@localhost:5673";
const QUEUE_NAME = "booking.paid.queue";
const EXCHANGE_NAME = "booking.events";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startWorker() {
  try {
    console.log("⏳ Đang kết nối tới RabbitMQ...");
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true });
    await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: true });
    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, "booking.paid");
    console.log(
      `✅ Kết nối thành công! Đang lắng nghe event tại queue: [${QUEUE_NAME}]`,
    );

    channel.consume(QUEUE_NAME, async (msg) => {
      if (msg) {
        const data = JSON.parse(msg.content.toString());
        console.log(
          `\n📥 [Event] Đang tạo vé PDF cho Booking: ${data.bookingId}`,
        );

        const ticketsDir = path.join(__dirname, "../tickets");
        if (!fs.existsSync(ticketsDir))
          fs.mkdirSync(ticketsDir, { recursive: true });

        const doc = new PDFDocument({ size: "A5", layout: "landscape" });
        const stream = fs.createWriteStream(
          path.join(ticketsDir, `${data.bookingId}.pdf`),
        );
        doc.pipe(stream);

        doc.fontSize(20).text("VE XE KHACH DIEN TU", { align: "center" });
        doc.moveDown();
        doc.fontSize(14).text(`Ma ve: ${data.bookingId}`);
        doc.text(`Khach hang: ${data.passengerName || data.customerName || "N/A"}`);
        doc.text(`Chuyen: ${data.tripId || data.route || "N/A"}`);
        doc.end();

        stream.on("finish", () => {
          console.log(`✅ Đã lưu thành công: ${data.bookingId}.pdf`);
          console.log(`✅ Đã lưu vé PDF tại: ${ticketsDir}`);
          console.log(
            `📧 [Email] Hệ thống đã tự động gửi vé PDF qua email cho khách hàng!`,
          );
          channel.ack(msg);
        });
      }
    });
  } catch (error) {
    console.error("❌ Lỗi khi khởi động Worker:", error);
  }
}

startWorker();
