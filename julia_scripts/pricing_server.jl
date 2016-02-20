push!(LOAD_PATH,"./")
include("asian-option.jl")
import JSON
import MPI
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

function mpiServer()
  println("Starting mpiserver...")
  MPI.Init()
  println ("MPI server initialized");
  comm = MPI.COMM_WORLD
  MPI.Barrier(comm)
  rank = MPI.Comm_rank(comm)
  size = MPI.Comm_size(comm)
  root = 0
  println ("Rank and size $rank, $size")
  # Root is the producer.
  @async begin 
    try 
      while true
        if rank == 1 
          println("Receiving message from server");
          recv_mesg = MPI.recv(root, 0, comm)
          println("Received $recv_mesg")
          obj = processCommand(recv_mesg)
          MPI.send(obj, root, defaultTag, comm)
        else 
          ## Debug println("Not our rank. NOP")
        end
      end
    catch err 
      println("mpi server exited with error $err")
    end
  end
end


function main() 
  @async server(portNumber)
  @async mpiServer()
  while true
    print(".")
    sleep(2)
  end
  MPI.Finalize()
end

main()
