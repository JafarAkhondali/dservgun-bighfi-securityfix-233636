using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WebSocket4Net;

namespace WebSocketsClientDemo
{
    class Program
    {
        static void Main(string[] args)
        {
            Client client = new Client();
            client.Setup("wss://beta.ccardemo.tech/chat", "basic", WebSocketVersion.Rfc6455);
            client.Start();
            Console.ReadLine(); 
        }
    }
}
