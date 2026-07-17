import amqp from "amqplib";

// Giữ đúng cấu hình port và tài khoản của nhóm
const RABBITMQ_URL = "amqp://admin:admin123@localhost:5673";
const QUEUE_NAME = "booking.paid.queue";

async function emitTestEvent() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    // Dữ liệu mô phỏng một khách hàng vừa thanh toán xong
    const mockBookingEvent = {
      bookingId: "BK-2302700185",
      customerName: "Nguyễn Quang Vỹ",
      route: "Sài Gòn - Đà Lạt",
    };

    const messageBuffer = Buffer.from(JSON.stringify(mockBookingEvent));

    // Đẩy event vào RabbitMQ
    channel.sendToQueue(QUEUE_NAME, messageBuffer, { persistent: true });

    console.log(
      `🚀 Đã bắn tín hiệu thanh toán cho vé: ${mockBookingEvent.bookingId}`,
    );

    // Đợi 0.5s rồi đóng kết nối
    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
  } catch (error) {
    console.error("❌ Lỗi:", error);
  }
}

emitTestEvent();
