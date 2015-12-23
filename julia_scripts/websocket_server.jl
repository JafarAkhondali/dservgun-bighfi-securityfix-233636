using HttpServer
using WebSockets
using JSON
import JSON

function process(aString) 
	return aString
end

wsh = WebSocketHandler() do req,client
        while true
            msg = read(client)
            reply = process(msg)
            print("Writing $reply")
            write(client, reply)
        end
      end

server = Server(wsh)

run(server,30000)