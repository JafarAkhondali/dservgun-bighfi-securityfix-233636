package model;


class HistoricalStressValue {
	public var creator(default, null) : String;
	public var portfolioId (default, null) : String;
	public var portfolioSymbol (default, null ): String;
	public var date (default, null) : String;
	public var commandType (default, null) : CommandType;
	public var nickName (default,null) : String;
	public var portfolioValue(default,null) : Float;
	public function new (creator : String, portfolioId : String , portfolioSymbol : String
			, date : String 
			, commandType : CommandType , nickName: String,  portfolioValue : String) {
		this.creator = creator;
		this.portfolioId = portfolioId;
		this.portfolioSymbol = portfolioSymbol;
		this.date = date;
		this.commandType = commandType;
		this.nickName = nickName;
		this.portfolioValue = Std.parseFloat(portfolioValue);
	}

	public static function getStressValue(incomingMessage) : HistoricalStressValue {
		if(incomingMessage == null){
			trace("Invalid message. Returning");
		}
		if(incomingMessage.portfolioSymbol != null) {
			var portfolioS  = incomingMessage.portfolioSymbol;
			var cType = Type.createEnum(CommandType, incomingMessage.commandType);
			var creator = incomingMessage.nickName;
			var date = incomingMessage.date;
			var n : String = incomingMessage.nickName;
			return new HistoricalStressValue(creator 
					, portfolioS.portfolioId
					, portfolioS.symbol
					, date
					, cType 
					, n
					, incomingMessage.portfolioValue);
		}else {
			return null;
		}
	}

}