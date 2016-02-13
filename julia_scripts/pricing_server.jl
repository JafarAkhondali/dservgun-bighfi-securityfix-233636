push!(LOAD_PATH,"./")
include("asian-option.jl")
import JSON
import AsianOption
portNumber = 20000


function processCommand(aString) 
  obj = split(aString, ['|', '\n'])
  pricer = AsianOption.create_asian_option(obj)
  return AsianOption.print_asian_option(pricer);
end


function server(aPortNumber)
  server = listen(portNumber)
  while true
    println("Waiting for connections on port : " * string(portNumber))
    conn = accept(server)
    println("Accepted connection :" * string(conn))
    @async begin
      try
        while true
          println("Waiting for text")
          line = readline(conn)
          println(line)
          obj = processCommand(line)
          write(conn, string(obj, "\r\n"))
          flush(conn)
        end
      catch err
        println("connection ended with error $err")
      end
    end
  end
end


server(portNumber)
