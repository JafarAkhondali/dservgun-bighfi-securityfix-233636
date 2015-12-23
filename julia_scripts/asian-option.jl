#
# asian-option.jl
#
module AsianOption
export OptionPricer, create_asian_option, print_asian_option
import JSON

  type OptionPricer 
    symbol :: AbstractString
    optionType :: AbstractString
    averaging :: AbstractString
    spotPrice :: Float64
    strikePrice :: Float64 
    riskFreeInterestRate :: Float64
    dividendYield :: Float64
    volatility :: Float64 
    timeToMaturity :: Float64
    randomWalks :: Int
    price :: Float64 # The result of the computation. Default is the min of float.
  end 


  function print_asian_option(aPricer) 
    return string(aPricer.symbol, "|"
      , aPricer.optionType, "|"
      , aPricer.averaging, "|"
      , aPricer.spotPrice, "|"
      , (aPricer.strikePrice), "|"
      , (aPricer.riskFreeInterestRate), "|"
      , (aPricer.dividendYield), "|"
      , (aPricer.volatility), "|"
      , (aPricer.timeToMaturity), "|"
      , (aPricer.randomWalks), "|"
      , (aPricer.price))
  end
  # Creates and computes the asian option. TODO : Fix the names
  function create_asian_option(aStringArray) 
    pricer = OptionPricer(aStringArray[1]
    , aStringArray[2] # type
    , aStringArray[3] # averaging
    , float(aStringArray[4]) # spot price
    , float(aStringArray[5]) # strike 
    , float(aStringArray[6]) # riskFree Interest
    , float(aStringArray[7]) # dividend
    , float(aStringArray[8]) # volatility
    , float(aStringArray[9]) # time to maturity
    , parse(Int, aStringArray[10]) # randomWalks
    , float(aStringArray[11]) # price
    )
    return compute_asian(pricer)
    
  end

  function run_option_pricer(N=1000000)
    pricer = OptionPricer("TEVA", "C", "A"
      , (100)
      , (100) 
      , (.05)
      , (0.0)
      , (0.2)
      , (0.25)
      , (N)
      , (0.0)
      )
      pricer_r = create_option(JSON.parse(JSON.json(pricer)))
      @printf "%s -> %s\n" (pricer_r) (JSON.json(compute_asian(pricer)))

  end

  function compute_asian(pricer) 
      println(pricer)
      S0 = pricer.spotPrice
      K  = pricer.strikePrice 
      r  = pricer.riskFreeInterestRate 
      q  = pricer.dividendYield
      v  = pricer.volatility
      tma = pricer.timeToMaturity
      N   = pricer.randomWalks
      println("Randomwalks ", N)
      T   = 100 # Number of time steps
      dt = tma / T 
      Averaging = pricer.averaging[2]
      PutCall = pricer.optionType[2]
      # Initialize the terminal stock price matrices
      # for the Euler and Milstein discretization schemes.
       S = zeros(Float64,N,T);
        for n=1:N
            S[n,1] = S0;
        end

      # Simulate the stock price under the Euler and Milstein schemes.
      # Take average of terminal stock price.
        println("Looping $N times.");
        A = zeros(Float64,N);
        for n=1:N
            for t=2:T
                dW = (randn(1)[1])*sqrt(dt);
               z0 = (r - q - 0.5*v*v)*S[n,t-1]*dt;
               z1 = v*S[n,t-1]*dW;
                z2 = 0.5*v*v*S[n,t-1]*dW*dW;
                S[n,t] = S[n,t-1] + z0 + z1 + z2;
           end
           if cmp(Averaging,'A') == 0
                A[n] = mean(S[n,:]);
           elseif cmp(Averaging,'G') == 0
                A[n] = exp(mean(log(S[n,:])));
           end
        end

      # Define the payoff
        println("Put call $PutCall")
        P = zeros(Float64,N);
        if cmp(PutCall,'C') == 0
            for n = 1:N
                P[n] = max(A[n] - K, 0);
            end
        elseif cmp(PutCall,'P') == 0
            for n = 1:N
               P[n] = max(K - A[n], 0);
           end
        end
      # Calculate the price of the Asian option
      AsianPrice = exp(-r*tma)*mean(P);
      pricer.price = AsianPrice
      @printf "Price %10.4f\n" AsianPrice
      return pricer
      end 
    end

