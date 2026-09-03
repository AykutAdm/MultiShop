using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Threading.Tasks;

namespace MultiShop.RabbitMQ.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MessagesController : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> CreateMessage()
        {
            var connectionFactory = new ConnectionFactory()
            {
                HostName = "localhost"
            };

            using var connection = await connectionFactory.CreateConnectionAsync();
            using var channel = await connection.CreateChannelAsync();

            await channel.QueueDeclareAsync(
                queue: "Kuyruk1",
                durable: false,
                exclusive: false,
                autoDelete: false,
                arguments: null);

            var messageContent = "Merhaba bu bir RabbitMQ kuyruk mesajidir.";
            var body = Encoding.UTF8.GetBytes(messageContent);

            await channel.BasicPublishAsync(
                exchange: "",
                routingKey: "Kuyruk1",
                body: body);

            return Ok("Mesajiniz Alinmistir");
        }


        [HttpGet]
        public async Task<IActionResult> ReadMessage()
        {
            var connectionFactory = new ConnectionFactory()
            {
                HostName = "localhost"
            };

            using var connection = await connectionFactory.CreateConnectionAsync();

            using var channel = await connection.CreateChannelAsync();

            string receivedMessage = null;

            var consumer = new AsyncEventingBasicConsumer(channel);
            consumer.ReceivedAsync += async (model, x) =>
              {
                  var byteMessage = x.Body.ToArray();
                  var message = Encoding.UTF8.GetString(byteMessage);
                  await channel.BasicAckAsync(deliveryTag: x.DeliveryTag, multiple: false);
              };

            await channel.BasicConsumeAsync(queue: "Kuyruk1", autoAck: false, consumer: consumer);

            return Ok(receivedMessage);

        }
    }
}
