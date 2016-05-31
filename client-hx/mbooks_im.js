(function (console, $hx_exports, $global) { "use strict";
$hx_exports.promhx = $hx_exports.promhx || {};
$hx_exports.massive = $hx_exports.massive || {};
$hx_exports.massive.munit = $hx_exports.massive.munit || {};
$hx_exports.massive.munit.util = $hx_exports.massive.munit.util || {};
var $estr = function() { return js_Boot.__string_rec(this,''); };
function $extend(from, fields) {
	function Inherit() {} Inherit.prototype = from; var proto = new Inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var EReg = function(r,opt) {
	opt = opt.split("u").join("");
	this.r = new RegExp(r,opt);
};
EReg.__name__ = ["EReg"];
EReg.prototype = {
	match: function(s) {
		if(this.r.global) this.r.lastIndex = 0;
		this.r.m = this.r.exec(s);
		this.r.s = s;
		return this.r.m != null;
	}
	,matched: function(n) {
		if(this.r.m != null && n >= 0 && n < this.r.m.length) return this.r.m[n]; else throw new js__$Boot_HaxeError("EReg::matched");
	}
	,__class__: EReg
};
var HxOverrides = function() { };
HxOverrides.__name__ = ["HxOverrides"];
HxOverrides.dateStr = function(date) {
	var m = date.getMonth() + 1;
	var d = date.getDate();
	var h = date.getHours();
	var mi = date.getMinutes();
	var s = date.getSeconds();
	return date.getFullYear() + "-" + (m < 10?"0" + m:"" + m) + "-" + (d < 10?"0" + d:"" + d) + " " + (h < 10?"0" + h:"" + h) + ":" + (mi < 10?"0" + mi:"" + mi) + ":" + (s < 10?"0" + s:"" + s);
};
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) return undefined;
	return x;
};
HxOverrides.substr = function(s,pos,len) {
	if(pos != null && pos != 0 && len != null && len < 0) return "";
	if(len == null) len = s.length;
	if(pos < 0) {
		pos = s.length + pos;
		if(pos < 0) pos = 0;
	} else if(len < 0) len = s.length + len - pos;
	return s.substr(pos,len);
};
HxOverrides.iter = function(a) {
	return { cur : 0, arr : a, hasNext : function() {
		return this.cur < this.arr.length;
	}, next : function() {
		return this.arr[this.cur++];
	}};
};
var Lambda = function() { };
Lambda.__name__ = ["Lambda"];
Lambda.has = function(it,elt) {
	var $it0 = $iterator(it)();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		if(x == elt) return true;
	}
	return false;
};
var List = function() {
	this.length = 0;
};
List.__name__ = ["List"];
List.prototype = {
	add: function(item) {
		var x = [item];
		if(this.h == null) this.h = x; else this.q[1] = x;
		this.q = x;
		this.length++;
	}
	,pop: function() {
		if(this.h == null) return null;
		var x = this.h[0];
		this.h = this.h[1];
		if(this.h == null) this.q = null;
		this.length--;
		return x;
	}
	,isEmpty: function() {
		return this.h == null;
	}
	,iterator: function() {
		return new _$List_ListIterator(this.h);
	}
	,__class__: List
};
var _$List_ListIterator = function(head) {
	this.head = head;
	this.val = null;
};
_$List_ListIterator.__name__ = ["_List","ListIterator"];
_$List_ListIterator.prototype = {
	hasNext: function() {
		return this.head != null;
	}
	,next: function() {
		this.val = this.head[0];
		this.head = this.head[1];
		return this.val;
	}
	,__class__: _$List_ListIterator
};
var MBooks_$im = function() {
	this.keepAliveInterval = 5000;
	this.portNumber = 3000;
	this.protocol = "wss";
	this.serverHost = "localhost";
	this.attempts = 0;
	this.maxAttempts = 3;
	console.log("Calling MBooks_im");
	this.reset();
	this.person = new model_Person("","","","");
	this.outputEventStream = new promhx_Deferred();
	this.hideDivField(MBooks_$im.MESSAGING_DIV);
	console.log("Registering nickname");
	var blurStream = this.initializeElementStream(this.getNickNameElement(),"blur");
	blurStream.then($bind(this,this.sendLoginBlur));
	console.log("Registering password");
	var rStream = this.initializeElementStream(this.getRegisterElement(),"click");
	rStream.then($bind(this,this.registerUser));
	this.userLoggedIn = new promhx_Deferred();
	this.userLoggedIn.then($bind(this,this.authenticationChecks));
	this.selectedCompanyStream = new promhx_Deferred();
	this.assignCompanyStream = new promhx_Deferred();
	this.activeCompanyStream = new promhx_Deferred();
	this.activeCompanyStream.then($bind(this,this.displayUserElements));
	this.portfolioListStream = new promhx_Deferred();
	this.portfolioStream = new promhx_Deferred();
	this.applicationErrorStream = new promhx_Deferred();
	this.applicationErrorStream.then($bind(this,this.updateErrorMessages));
	this.getUserLoggedInStream().then($bind(this,this.processSuccessfulLogin));
	var oauthStream = this.initializeElementStream(this.getGmailOauthButton(),"click");
	oauthStream.then($bind(this,this.performGmailOauth));
	this.entitlements = new view_Entitlement();
	this.marketDataStream = new promhx_Deferred();
	this.historicalPriceStream = new promhx_Deferred();
	this.optionAnalyticsStream = new promhx_Deferred();
	this.historicalStressValueStream = new promhx_Deferred();
	this.companyEntitlements = new view_CompanyEntitlement(this.entitlements,this.selectedCompanyStream);
	this.symbolChart = new view_SymbolChart(this.historicalPriceStream,this.historicalStressValueStream);
};
MBooks_$im.__name__ = ["MBooks_im"];
MBooks_$im.getSingleton = function() {
	return MBooks_$im.singleton;
};
MBooks_$im.main = function() {
	MBooks_$im.singleton = new MBooks_$im();
	MBooks_$im.singleton.optionAnalyticsView = new view_OptionAnalyticsView();
	MBooks_$im.singleton.setupStreams();
	MBooks_$im.singleton.connect();
};
MBooks_$im.getDynamic = function(name) {
	return __js__(name);
};
MBooks_$im.prototype = {
	reset: function() {
		this.clearValue(this.getNickNameElement());
		this.getNickNameElement().disabled = false;
		this.clearValue(this.getMessageHistoryElement());
		this.clearValue(this.getPasswordElement());
		this.clearValue(this.getFirstNameElement());
		this.clearValue(this.getLastNameElement());
	}
	,performGmailOauth: function(incoming) {
		console.log("Processing gmail outh" + Std.string(incoming));
		var oauthRequest = new XMLHttpRequest();
		var url = "http://" + window.location.hostname + "/" + MBooks_$im.GOAUTH_URL;
		oauthRequest.open("GET",url);
		oauthRequest.onloadend = $bind(this,this.oauthRequestData);
		oauthRequest.send();
	}
	,oauthRequestData: function(data) {
		var message = data;
		console.log("Data " + Std.string(message.data));
	}
	,getGmailOauthButton: function() {
		return window.document.getElementById(MBooks_$im.SETUP_GMAIL);
	}
	,displayUserElements: function(companySelected) {
		console.log("Displaying user elements the current user is entitled for");
		this.showDivField(MBooks_$im.WORKBENCH);
		this.showDivField(MBooks_$im.MESSAGING_DIV);
	}
	,processSuccessfulLogin: function(loginEvent) {
		console.log("Process successful login " + Std.string(loginEvent));
		this.hideDivField(MBooks_$im.MESSAGING_DIV);
		if(loginEvent.userName == this.getNickName()) {
			MBooks_$im.singleton.company = new view_Company();
			MBooks_$im.singleton.project = new model_Project(MBooks_$im.singleton.company);
			MBooks_$im.singleton.ccar = new model_CCAR("","","");
			MBooks_$im.singleton.ccar.setupStreams();
			MBooks_$im.singleton.portfolio = new view_Portfolio();
			MBooks_$im.singleton.portfolioSymbolModel = new model_PortfolioSymbol();
			MBooks_$im.singleton.portfolioSymbolView = new view_PortfolioSymbol(MBooks_$im.singleton.portfolioSymbolModel);
		} else console.log("A new user logged in " + Std.string(loginEvent));
	}
	,connectionString: function() {
		return this.protocol + "://" + window.location.hostname + "/chat";
	}
	,connect: function() {
		console.log("Calling connect");
		try {
			this.websocket = new WebSocket(this.connectionString());
			this.websocket.onclose = $bind(this,this.onClose);
			this.websocket.onerror = $bind(this,this.onServerConnectionError);
			var openStream = this.initializeElementStream(this.websocket,"open");
			openStream.then($bind(this,this.onOpen));
			var eventStream = this.initializeElementStream(this.websocket,"message");
			eventStream.then($bind(this,this.onMessage));
			var closeStream = this.initializeElementStream(this.websocket,"close");
			closeStream.then($bind(this,this.onClose));
			var errorStream = this.initializeElementStream(this.websocket,"error");
			errorStream.then($bind(this,this.onServerConnectionError));
		} catch( err ) {
			haxe_CallStack.lastException = err;
			if (err instanceof js__$Boot_HaxeError) err = err.val;
			console.log("Error establishing connection " + Std.string(err));
		}
		console.log("Connection successful");
	}
	,logout: function() {
		console.log("Logging out ");
		if(this.websocket != null) this.websocket.close(); else console.log("No valid connection found");
	}
	,getOutputEventStream: function() {
		return this.outputEventStream.stream();
	}
	,initializeElementStream: function(ws,event,useCapture) {
		try {
			var def = new promhx_Deferred();
			ws.addEventListener(event,$bind(def,def.resolve),useCapture);
			return def.stream();
		} catch( err ) {
			haxe_CallStack.lastException = err;
			if (err instanceof js__$Boot_HaxeError) err = err.val;
			console.log("Error creating element stream for " + event);
			throw new js__$Boot_HaxeError("Unable to setup stream");
		}
	}
	,onOpen: function(ev) {
		console.log("Connection opened");
		this.getOutputEventStream().then($bind(this,this.sendEvents));
	}
	,onClose: function(ev) {
		console.log("Connection closed " + ev.code + "->" + ev.reason);
		this.setError(ev.code + ":" + ev.reason);
		this.cleanup();
		this.disableKeepAlive();
	}
	,cleanup: function() {
		console.log("Do all of the cleanup");
	}
	,onServerConnectionError: function(ev) {
		console.log("Error " + Std.string(ev));
		this.getOutputEventStream().end();
		this.websocket.close();
		this.applicationErrorStream.resolve("Server Not found. Please reach out to support");
	}
	,parseCommandType: function(incomingMessage) {
		var commandType = incomingMessage.commandType;
		if(commandType == null) {
			if(incomingMessage.Right != null) {
				commandType = incomingMessage.Right.commandType;
				if(commandType == null) console.log("Command type not defined");
			}
		}
		try {
			console.log("Command type " + commandType);
			return Type.createEnum(model_CommandType,commandType);
		} catch( e ) {
			haxe_CallStack.lastException = e;
			if (e instanceof js__$Boot_HaxeError) e = e.val;
			console.log("Error " + Std.string(e) + " Command type " + commandType);
			return model_CommandType.Undefined;
		}
	}
	,parseIncomingMessage: function(incomingMessage) {
		var commandType = this.parseCommandType(incomingMessage);
		switch(commandType[1]) {
		case 0:
			var person = incomingMessage.Right.login;
			var login = model_Login.createLoginResponse(incomingMessage,person);
			this.processLoginResponse(login);
			break;
		case 11:
			console.log("Parsing ccar upload " + Std.string(incomingMessage));
			this.ccar.processCCARUpload(incomingMessage);
			break;
		case 18:
			this.company.processManageCompany(incomingMessage);
			break;
		case 20:
			console.log("Updating company list event stream");
			this.company.getSelectListEventStream().resolve(incomingMessage);
			break;
		case 23:
			console.log("Processing get supported scripts");
			try {
				this.project.getSupportedScriptsStream().resolve(incomingMessage);
			} catch( err ) {
				haxe_CallStack.lastException = err;
				if (err instanceof js__$Boot_HaxeError) err = err.val;
				console.log("Error processing supported scripts " + Std.string(err));
			}
			break;
		case 24:
			console.log("Processing query active workbenches");
			try {
				this.project.activeProjectWorkbench.queryActiveWorkbenchesStream.resolve(incomingMessage);
			} catch( err1 ) {
				haxe_CallStack.lastException = err1;
				if (err1 instanceof js__$Boot_HaxeError) err1 = err1.val;
				console.log("Error processing query active workbenches " + Std.string(err1));
			}
			break;
		case 25:
			console.log("Processing manage workbench ");
			try {
				this.project.activeProjectWorkbench.manageWorkbenchStream.resolve(incomingMessage);
			} catch( err2 ) {
				haxe_CallStack.lastException = err2;
				if (err2 instanceof js__$Boot_HaxeError) err2 = err2.val;
				console.log("Error processing manage workbench " + Std.string(err2));
			}
			break;
		case 26:
			console.log("Processing execute workbench");
			try {
				this.project.activeProjectWorkbench.executeWorkbenchStream.resolve(incomingMessage);
			} catch( err3 ) {
				haxe_CallStack.lastException = err3;
				if (err3 instanceof js__$Boot_HaxeError) err3 = err3.val;
				console.log("Error processing execute workbench " + Std.string(err3));
			}
			break;
		case 21:
			console.log("Processing all active projects ");
			this.project.getSelectActiveProjectsStream().resolve(incomingMessage);
			break;
		case 22:
			console.log("Manage project");
			this.project.processManageProject(incomingMessage);
			break;
		case 12:
			console.log("Parsing ccar text " + Std.string(incomingMessage));
			this.ccar.processParsedCCARText(incomingMessage);
			break;
		case 2:
			this.processManageUser(incomingMessage);
			break;
		case 3:
			break;
		case 4:
			break;
		case 6:
			break;
		case 5:
			break;
		case 7:
			break;
		case 8:
			break;
		case 9:
			break;
		case 10:
			break;
		case 1:
			this.processSendMessage(incomingMessage);
			break;
		case 14:
			this.processUserJoined(incomingMessage);
			break;
		case 17:
			this.processUserBanned(incomingMessage);
			break;
		case 16:
			this.processUserLoggedIn(incomingMessage);
			break;
		case 15:
			this.processUserLeft(incomingMessage);
			break;
		case 27:
			console.log("Processing assigning company");
			this.assignCompanyStream.resolve(incomingMessage);
			break;
		case 19:
			console.log("Processing keep alive");
			break;
		case 28:
			console.log("Processing " + Std.string(incomingMessage));
			this.portfolioSymbolModel.typesStream.resolve(incomingMessage);
			break;
		case 29:
			console.log("Processing " + Std.string(incomingMessage));
			this.portfolioSymbolModel.sidesStream.resolve(incomingMessage);
			break;
		case 30:
			console.log("Processing " + Std.string(incomingMessage));
			this.portfolioListStream.resolve(incomingMessage);
			break;
		case 31:
			console.log("Processing " + Std.string(incomingMessage));
			this.portfolioStream.resolve(incomingMessage);
			break;
		case 32:
			console.log("Processing " + Std.string(incomingMessage));
			this.portfolioSymbolView.manage(incomingMessage);
			break;
		case 34:
			console.log("Processing " + Std.string(incomingMessage));
			this.portfolioSymbolView.symbolQueryResponse.resolve(incomingMessage);
			break;
		case 35:
			console.log("Processing " + Std.string(incomingMessage));
			this.entitlements.modelResponseStream.resolve(incomingMessage);
			break;
		case 36:
			this.entitlements.queryEntitlementResponse.resolve(incomingMessage);
			break;
		case 37:
			this.companyEntitlements.userListResponse.resolve(incomingMessage);
			break;
		case 33:
			this.marketDataStream.resolve(incomingMessage);
			break;
		case 38:
			this.optionAnalyticsStream.resolve(incomingMessage);
			break;
		case 39:
			console.log("Incoming message " + Std.string(incomingMessage));
			this.historicalPriceStream.resolve(incomingMessage);
			break;
		case 40:
			console.log("Incoming message " + Std.string(incomingMessage));
			var historicalSV = model_HistoricalStressValue.getStressValue(incomingMessage.Right);
			this.historicalStressValueStream.resolve(historicalSV);
			break;
		case 13:
			this.processUndefinedCommandType(incomingMessage);
			this.entitlements.modelResponseStream.resolve(incomingMessage);
			break;
		}
	}
	,incomingMessageNull: function(source) {
		var errorMessage = "Incoming message is null. Should never happen. @ " + source;
		MBooks_$im.getSingleton().applicationErrorStream.resolve(errorMessage);
	}
	,processUndefinedCommandType: function(incomingMessage) {
		console.log("Unhandled command type " + Std.string(incomingMessage));
	}
	,onMessage: function(ev) {
		console.log("Received stream " + Std.string(ev.data));
		var incomingMessage = JSON.parse(ev.data);
		console.log("Printing incoming message " + JSON.stringify(incomingMessage));
		this.parseIncomingMessage(incomingMessage);
	}
	,processLoginResponse: function(lR) {
		console.log("Processing login object " + Std.string(lR));
		console.log("Processing lR status " + lR.loginStatus);
		if(lR.loginStatus == null) {
			console.log("Undefined state");
			return;
		}
		var lStatus = Type.createEnum(model_LoginStatus,lR.loginStatus);
		if(this.getNickName() == lR.login.nickName) {
			this.person.setPassword(lR.login.password);
			this.person.setFirstName(lR.login.firstName);
			this.person.setLastName(lR.login.lastName);
		} else throw new js__$Boot_HaxeError("Nick name and responses dont match!!!! -> " + this.getNickName() + " not the same as " + lR.login.nickName);
		console.log("Processing lStatus " + Std.string(lStatus));
		if(lStatus == model_LoginStatus.UserNotFound) {
			this.showDivField(MBooks_$im.DIV_PASSWORD);
			this.showDivField(MBooks_$im.DIV_FIRST_NAME);
			this.showDivField(MBooks_$im.DIV_LAST_NAME);
			this.showDivField(MBooks_$im.DIV_REGISTER);
			this.initializeKeepAlive();
			this.getPasswordElement().focus();
		}
		if(lStatus == model_LoginStatus.UserExists) {
			this.showDivField(MBooks_$im.DIV_PASSWORD);
			var pStream = this.initializeElementStream(this.getPasswordElement(),"blur");
			pStream.then($bind(this,this.validatePassword));
			this.getPasswordElement().focus();
		}
		if(lStatus == model_LoginStatus.InvalidPassword) {
		}
		if(lStatus == model_LoginStatus.Undefined) throw new js__$Boot_HaxeError("Undefined status");
	}
	,setInitWelcome: function(p) {
		try {
			var person = p;
			var inputElement = this.getInitWelcomeElement();
			inputElement.innerHTML = inputElement.innerHTML + "," + person.nickName;
			this.showDivField(MBooks_$im.INIT_WELCOME_MESSAGE_DIV);
		} catch( err ) {
			haxe_CallStack.lastException = err;
			if (err instanceof js__$Boot_HaxeError) err = err.val;
			console.log(err);
			this.setError(err);
		}
	}
	,processManageUser: function(p) {
		if(p.Right != null) {
			var person = p.Right.person;
			this.setInitWelcome(person);
		} else {
			console.log("Error processing manage user " + Std.string(p));
			this.setError(p);
		}
	}
	,processSendMessage: function(incomingMessage) {
		var textAreaElement = window.document.getElementById(MBooks_$im.MESSAGE_HISTORY);
		if(incomingMessage.privateMessage != "") textAreaElement.value = textAreaElement.value + incomingMessage.sentTime + "@" + incomingMessage.from + ":" + incomingMessage.privateMessage + "\n";
	}
	,updateMessageHistory: function(currentTime,localMessage) {
		var textAreaElement = window.document.getElementById(MBooks_$im.MESSAGE_HISTORY);
		if(textAreaElement == null) {
			console.log("Element not found");
			return;
		}
		if(localMessage != "") textAreaElement.value = textAreaElement.value + Std.string(currentTime) + "@" + this.getNickName() + ":" + localMessage + "\n";
	}
	,processUserJoined: function(incomingMessage) {
		console.log("User joined " + Std.string(new Date()));
	}
	,processUserLoggedIn: function(incomingMessage) {
		if(incomingMessage.userName != this.getNickName()) this.addToUsersOnline(incomingMessage.userName);
		this.userLoggedIn.resolve(incomingMessage);
	}
	,processUserLeft: function(incomingMessage) {
		var userNickName = incomingMessage.userName;
		this.removeFromUsersOnline(userNickName);
	}
	,processUserBanned: function(incomingMessage) {
		var userNickName = incomingMessage.userName;
		this.removeFromUsersOnline(userNickName);
	}
	,isEntitledFor: function(fieldName) {
		if(fieldName == MBooks_$im.MESSAGING_DIV) return false;
		return true;
	}
	,showDivField: function(fieldName) {
		if(!this.isEntitledFor(fieldName)) {
			console.log("Not entitled for " + fieldName);
			return;
		}
		var div = window.document.getElementById(fieldName);
		if(div == null) {
			console.log("Element not found " + fieldName);
			return;
		}
		div.setAttribute("style","display:normal");
	}
	,hideDivField: function(fieldName) {
		var div = window.document.getElementById(fieldName);
		if(div == null) {
			console.log("Div not found");
			return;
		}
		div.setAttribute("style","display:none");
	}
	,initializeKeepAlive: function() {
		if(this.timer == null) {
			this.timer = new haxe_Timer(this.keepAliveInterval);
			this.timer.run = $bind(this,this.keepAliveFunction);
		} else console.log("Timer already running. This should not happen");
	}
	,disableKeepAlive: function() {
		if(this.timer == null) console.log("Nothing to disable"); else {
			console.log("Stopping the timer");
			this.timer.stop();
		}
	}
	,keepAliveFunction: function() {
		var commandType = "KeepAlive";
		var payload = { nickName : this.getNickName(), commandType : commandType, keepAlive : "Ping"};
		console.log("Sending keep alive " + Std.string(payload));
		this.doSendJSON(payload);
	}
	,sendEvents: function(aMessage) {
		this.websocket.send(JSON.stringify(aMessage));
		console.log("Sent " + Std.string(aMessage));
	}
	,getInitWelcomeElement: function() {
		return window.document.getElementById(MBooks_$im.INIT_WELCOME_MESSAGE);
	}
	,getKickUserElement: function() {
		return window.document.getElementById(MBooks_$im.KICK_USER);
	}
	,doSendJSON: function(aMessage) {
		console.log("Sending " + Std.string(aMessage));
		this.outputEventStream.resolve(aMessage);
	}
	,getNickName: function() {
		return this.getNickNameElement().value;
	}
	,getSendMessageElement: function() {
		return window.document.getElementById(MBooks_$im.SEND_MESSAGE);
	}
	,getStatusMessageElement: function() {
		return window.document.getElementById(MBooks_$im.STATUS_MESSAGE);
	}
	,getNickNameElement: function() {
		var inputElement = window.document.getElementById(MBooks_$im.NICK_NAME);
		return inputElement;
	}
	,getPasswordElement: function() {
		var inputElement = window.document.getElementById(MBooks_$im.PASSWORD);
		return inputElement;
	}
	,getPassword: function() {
		return StringTools.trim(this.getPasswordElement().value);
	}
	,getFirstName: function() {
		return this.getFirstNameElement().value;
	}
	,getFirstNameElement: function() {
		var inputElement = window.document.getElementById(MBooks_$im.FIRST_NAME);
		return inputElement;
	}
	,getLastName: function() {
		return this.getLastNameElement().value;
	}
	,getLastNameElement: function() {
		var inputElement = window.document.getElementById(MBooks_$im.LAST_NAME);
		return inputElement;
	}
	,getRegisterElement: function() {
		var buttonElement = window.document.getElementById(MBooks_$im.REGISTER);
		return buttonElement;
	}
	,getMessageInput: function() {
		var inputElement = window.document.getElementById(MBooks_$im.MESSAGE_INPUT);
		return inputElement;
	}
	,getMessage: function() {
		return this.getMessageInput().value;
	}
	,getMessageHistoryElement: function() {
		var inputElement = window.document.getElementById(MBooks_$im.MESSAGE_HISTORY);
		return inputElement;
	}
	,getMessageHistory: function() {
		return this.getMessageHistoryElement().value;
	}
	,addToUsersOnline: function(nickName) {
		var usersOnline = window.document.getElementById(MBooks_$im.USERS_ONLINE);
		if(usersOnline == null) {
			console.log("Element not found ");
			return;
		}
		var nickNameId = "NICKNAME" + "_" + nickName;
		var optionElement = window.document.getElementById(nickNameId);
		if(optionElement == null) {
			optionElement = (function($this) {
				var $r;
				var _this = window.document;
				$r = _this.createElement("option");
				return $r;
			}(this));
			optionElement.id = nickNameId;
			optionElement.text = nickName;
			usersOnline.appendChild(optionElement);
		} else throw new js__$Boot_HaxeError("This user was already online" + nickName);
	}
	,removeFromUsersOnline: function(nickName) {
		console.log("Deleting user from the list " + nickName);
		var usersOnline = window.document.getElementById(MBooks_$im.USERS_ONLINE);
		if(usersOnline == null) {
			console.log("Element not found");
			return;
		}
		var nickNameId = "NICKNAME" + "_" + nickName;
		var optionElement = window.document.getElementById(nickNameId);
		if(optionElement != null) usersOnline.removeChild(optionElement); else console.log("This user was already removed : ?" + nickName);
	}
	,loginAsGuest: function() {
		var payload = { nickName : this.getNickName(), userName : this.getKickUserElement().value, commandType : "GuestUser"};
		this.doSendJSON(payload);
		this.initializeKeepAlive();
		this.hideDivField(MBooks_$im.KICK_USER_DIV);
		this.hideDivField(MBooks_$im.MESSAGING_DIV);
	}
	,getLoginRequest: function(nickName,status) {
		var lStatus = status;
		var cType = Std.string(model_CommandType.Login);
		var l = new model_Login(cType,this.person,lStatus);
		return l;
	}
	,sendLoginBlur: function(ev) {
		var inputElement = ev.target;
		var inputValue = StringTools.trim(inputElement.value);
		console.log("Sending login information: " + inputValue + ":");
		if(inputValue != "") {
			this.person.setNickName(inputElement.value);
			var lStatus = model_LoginStatus.Undefined;
			var cType = Std.string(model_CommandType.Login);
			var l = new model_Login(cType,this.person,lStatus);
			console.log("Sending login status " + Std.string(l));
			this.doSendJSON(l);
		} else console.log("Not sending any login");
	}
	,sendLogin: function(ev) {
		var inputElement = ev.target;
		console.log("Inside send login " + ev.keyCode);
		if(util_Util.isSignificantWS(ev.keyCode)) {
			var inputValue = StringTools.trim(inputElement.value);
			console.log("Sending login information: " + inputValue + ":");
			if(inputValue != "") {
				this.person.setNickName(inputElement.value);
				var lStatus = model_LoginStatus.Undefined;
				var cType = Std.string(model_CommandType.Login);
				var l = new model_Login(cType,this.person,lStatus);
				console.log("Sending login status " + Std.string(l));
				this.doSendJSON(l);
			} else console.log("Not sending any login");
		}
	}
	,sendMessageFromButton: function(ev) {
		console.log("Sending message from button " + Std.string(ev));
		var sentTime = new Date();
		var payload = { nickName : this.getNickName(), from : this.getNickName(), to : this.getNickName(), privateMessage : this.getMessage(), commandType : "SendMessage", destination : { tag : "Broadcast", contents : []}, sentTime : sentTime};
		this.doSendJSON(payload);
		this.updateMessageHistory(sentTime,this.getMessage());
		var inputElement = this.getMessageInput();
		inputElement.value = "";
	}
	,sendMessage: function(ev) {
		var inputElement = ev.target;
		if(util_Util.isBackspace(ev.keyCode)) {
		}
		if(util_Util.isSignificantWS(ev.keyCode)) {
			var sentTime = new Date();
			var payload = { nickName : this.getNickName(), from : this.getNickName(), to : this.getNickName(), privateMessage : this.getMessage(), commandType : "SendMessage", destination : { tag : "Broadcast", contents : []}, sentTime : sentTime};
			this.doSendJSON(payload);
			this.updateMessageHistory(sentTime,this.getMessage());
			inputElement.value = "";
		}
	}
	,validatePassword: function(ev) {
		console.log("Password: " + this.getPassword() + ":");
		if(this.getPassword() == "") {
			console.log("Not sending password");
			return;
		}
		if(this.getPassword() != this.person.password) {
			js_Browser.alert("Invalid password. Try again");
			this.attempts++;
			if(this.attempts > this.maxAttempts) {
				this.loginAsGuest();
				console.log("Logging in as guest");
			}
		} else {
			console.log("Password works!");
			var userLoggedIn = { userName : this.getNickName(), commandType : "UserLoggedIn"};
			this.getNickNameElement().disabled = true;
			this.doSendJSON(userLoggedIn);
			this.addStatusMessage(this.getNickName());
			this.showDivField("statusMessageDiv");
			this.initializeKeepAlive();
		}
	}
	,addStatusMessage: function(userMessage) {
		this.getStatusMessageElement().innerHTML = this.getStatusMessageElement().innerHTML + " : " + userMessage;
	}
	,kickUser: function(ev) {
		if(util_Util.isSignificantWS(ev.keyCode)) {
			var payload = { nickName : this.getNickName(), userName : this.getKickUserElement().value, commandType : "UserBanned"};
			this.doSendJSON(payload);
		} else {
		}
	}
	,registerUser: function(ev) {
		var commandType = "ManageUser";
		var operation = new model_UserOperation("Create");
		var modelPerson = new model_Person(this.getFirstName(),this.getLastName(),this.getNickName(),this.getPassword());
		var uo = { commandType : "ManageUser", nickName : this.getNickName(), operation : "Create", person : modelPerson};
		this.doSendJSON(uo);
		this.initializeKeepAlive();
	}
	,clearValue: function(inputElement) {
		if(inputElement != null) inputElement.value = ""; else console.log("Null value for input element");
	}
	,getApplicationErrorElement: function() {
		return window.document.getElementById(MBooks_$im.APPLICATION_ERROR);
	}
	,setServerError: function(anError) {
		this.getServerErrorElement().value = anError;
	}
	,updateErrorMessages: function(incomingError) {
		this.getApplicationErrorElement().value = this.getApplicationErrorElement().value + ("" + Std.string(incomingError));
		this.showDivField(MBooks_$im.SERVER_ERROR_MESSAGES_DIV_FIELD);
		this.setServerError(incomingError);
	}
	,getServerErrorElement: function() {
		return window.document.getElementById(MBooks_$im.SERVER_ERROR);
	}
	,setError: function(aMessage) {
		this.applicationErrorStream.resolve(aMessage);
	}
	,getCompany: function() {
		return this.company;
	}
	,getUserLoggedInStream: function() {
		return this.userLoggedIn;
	}
	,setupStreams: function() {
	}
	,authenticationChecks: function(incoming) {
		console.log("Processing " + Std.string(incoming));
		this.entitlements.queryAllEntitlements();
	}
	,__class__: MBooks_$im
};
Math.__name__ = ["Math"];
var Reflect = function() { };
Reflect.__name__ = ["Reflect"];
Reflect.field = function(o,field) {
	try {
		return o[field];
	} catch( e ) {
		haxe_CallStack.lastException = e;
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		return null;
	}
};
Reflect.setField = function(o,field,value) {
	o[field] = value;
};
Reflect.callMethod = function(o,func,args) {
	return func.apply(o,args);
};
Reflect.fields = function(o) {
	var a = [];
	if(o != null) {
		var hasOwnProperty = Object.prototype.hasOwnProperty;
		for( var f in o ) {
		if(f != "__id__" && f != "hx__closures__" && hasOwnProperty.call(o,f)) a.push(f);
		}
	}
	return a;
};
Reflect.isFunction = function(f) {
	return typeof(f) == "function" && !(f.__name__ || f.__ename__);
};
Reflect.deleteField = function(o,field) {
	if(!Object.prototype.hasOwnProperty.call(o,field)) return false;
	delete(o[field]);
	return true;
};
Reflect.makeVarArgs = function(f) {
	return function() {
		var a = Array.prototype.slice.call(arguments);
		return f(a);
	};
};
var Std = function() { };
Std.__name__ = ["Std"];
Std.string = function(s) {
	return js_Boot.__string_rec(s,"");
};
Std.parseInt = function(x) {
	var v = parseInt(x,10);
	if(v == 0 && (HxOverrides.cca(x,1) == 120 || HxOverrides.cca(x,1) == 88)) v = parseInt(x);
	if(isNaN(v)) return null;
	return v;
};
var StringTools = function() { };
StringTools.__name__ = ["StringTools"];
StringTools.isSpace = function(s,pos) {
	var c = HxOverrides.cca(s,pos);
	return c > 8 && c < 14 || c == 32;
};
StringTools.ltrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,r)) r++;
	if(r > 0) return HxOverrides.substr(s,r,l - r); else return s;
};
StringTools.rtrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,l - r - 1)) r++;
	if(r > 0) return HxOverrides.substr(s,0,l - r); else return s;
};
StringTools.trim = function(s) {
	return StringTools.ltrim(StringTools.rtrim(s));
};
var ValueType = { __ename__ : true, __constructs__ : ["TNull","TInt","TFloat","TBool","TObject","TFunction","TClass","TEnum","TUnknown"] };
ValueType.TNull = ["TNull",0];
ValueType.TNull.toString = $estr;
ValueType.TNull.__enum__ = ValueType;
ValueType.TInt = ["TInt",1];
ValueType.TInt.toString = $estr;
ValueType.TInt.__enum__ = ValueType;
ValueType.TFloat = ["TFloat",2];
ValueType.TFloat.toString = $estr;
ValueType.TFloat.__enum__ = ValueType;
ValueType.TBool = ["TBool",3];
ValueType.TBool.toString = $estr;
ValueType.TBool.__enum__ = ValueType;
ValueType.TObject = ["TObject",4];
ValueType.TObject.toString = $estr;
ValueType.TObject.__enum__ = ValueType;
ValueType.TFunction = ["TFunction",5];
ValueType.TFunction.toString = $estr;
ValueType.TFunction.__enum__ = ValueType;
ValueType.TClass = function(c) { var $x = ["TClass",6,c]; $x.__enum__ = ValueType; $x.toString = $estr; return $x; };
ValueType.TEnum = function(e) { var $x = ["TEnum",7,e]; $x.__enum__ = ValueType; $x.toString = $estr; return $x; };
ValueType.TUnknown = ["TUnknown",8];
ValueType.TUnknown.toString = $estr;
ValueType.TUnknown.__enum__ = ValueType;
var Type = function() { };
Type.__name__ = ["Type"];
Type.getSuperClass = function(c) {
	return c.__super__;
};
Type.getClassName = function(c) {
	var a = c.__name__;
	if(a == null) return null;
	return a.join(".");
};
Type.createInstance = function(cl,args) {
	var _g = args.length;
	switch(_g) {
	case 0:
		return new cl();
	case 1:
		return new cl(args[0]);
	case 2:
		return new cl(args[0],args[1]);
	case 3:
		return new cl(args[0],args[1],args[2]);
	case 4:
		return new cl(args[0],args[1],args[2],args[3]);
	case 5:
		return new cl(args[0],args[1],args[2],args[3],args[4]);
	case 6:
		return new cl(args[0],args[1],args[2],args[3],args[4],args[5]);
	case 7:
		return new cl(args[0],args[1],args[2],args[3],args[4],args[5],args[6]);
	case 8:
		return new cl(args[0],args[1],args[2],args[3],args[4],args[5],args[6],args[7]);
	default:
		throw new js__$Boot_HaxeError("Too many arguments");
	}
	return null;
};
Type.createEmptyInstance = function(cl) {
	function empty() {}; empty.prototype = cl.prototype;
	return new empty();
};
Type.createEnum = function(e,constr,params) {
	var f = Reflect.field(e,constr);
	if(f == null) throw new js__$Boot_HaxeError("No such constructor " + constr);
	if(Reflect.isFunction(f)) {
		if(params == null) throw new js__$Boot_HaxeError("Constructor " + constr + " need parameters");
		return Reflect.callMethod(e,f,params);
	}
	if(params != null && params.length != 0) throw new js__$Boot_HaxeError("Constructor " + constr + " does not need parameters");
	return f;
};
Type["typeof"] = function(v) {
	var _g = typeof(v);
	switch(_g) {
	case "boolean":
		return ValueType.TBool;
	case "string":
		return ValueType.TClass(String);
	case "number":
		if(Math.ceil(v) == v % 2147483648.0) return ValueType.TInt;
		return ValueType.TFloat;
	case "object":
		if(v == null) return ValueType.TNull;
		var e = v.__enum__;
		if(e != null) return ValueType.TEnum(e);
		var c = js_Boot.getClass(v);
		if(c != null) return ValueType.TClass(c);
		return ValueType.TObject;
	case "function":
		if(v.__name__ || v.__ename__) return ValueType.TObject;
		return ValueType.TFunction;
	case "undefined":
		return ValueType.TNull;
	default:
		return ValueType.TUnknown;
	}
};
Type.enumEq = function(a,b) {
	if(a == b) return true;
	try {
		if(a[0] != b[0]) return false;
		var _g1 = 2;
		var _g = a.length;
		while(_g1 < _g) {
			var i = _g1++;
			if(!Type.enumEq(a[i],b[i])) return false;
		}
		var e = a.__enum__;
		if(e != b.__enum__ || e == null) return false;
	} catch( e1 ) {
		haxe_CallStack.lastException = e1;
		if (e1 instanceof js__$Boot_HaxeError) e1 = e1.val;
		return false;
	}
	return true;
};
var format_csv_Reader = function(separator,escape,endOfLine) {
	var _g = this;
	if(separator != null) this.sep = separator; else this.sep = ",";
	if(this.stringLength(this.sep) != 1) throw new js__$Boot_HaxeError("Separator string \"" + this.sep + "\" not allowed, only single char");
	if(escape != null) this.esc = escape; else this.esc = "\"";
	if(this.stringLength(this.esc) != 1) throw new js__$Boot_HaxeError("Escape string \"" + this.esc + "\" not allowed, only single char");
	if(endOfLine != null) this.eol = endOfLine; else this.eol = ["\r\n","\n"];
	if(Lambda.has(this.eol,null) || Lambda.has(this.eol,"")) throw new js__$Boot_HaxeError("EOL sequences can't be empty");
	this.eol.sort(function(a,b) {
		return _g.stringLength(b) - _g.stringLength(a);
	});
	this.eolsize = this.eol.map($bind(this,this.stringLength));
	this.open(null,null);
};
format_csv_Reader.__name__ = ["format","csv","Reader"];
format_csv_Reader.readCsv = function(stream,separator,escape,endOfLine) {
	var p = new format_csv_Reader(separator,escape,endOfLine);
	p.inp = stream;
	return p;
};
format_csv_Reader.parseCsv = function(text,separator,escape,endOfLine) {
	var p = new format_csv_Reader(separator,escape,endOfLine);
	p.buffer = text;
	return p.readAll();
};
format_csv_Reader.read = function(text,separator,escape,endOfLine) {
	return format_csv_Reader.parseCsv(text,separator,escape,endOfLine);
};
format_csv_Reader.prototype = {
	substring: function(str,pos,length) {
		return HxOverrides.substr(str,pos,length);
	}
	,stringLength: function(str) {
		return str.length;
	}
	,fetchBytes: function(n) {
		if(this.inp == null) return null;
		try {
			var bytes = haxe_io_Bytes.alloc(n);
			var got = this.inp.readBytes(bytes,0,n);
			return bytes.getString(0,got);
		} catch( e ) {
			haxe_CallStack.lastException = e;
			if (e instanceof js__$Boot_HaxeError) e = e.val;
			if( js_Boot.__instanceof(e,haxe_io_Eof) ) {
				return null;
			} else throw(e);
		}
	}
	,get: function(p,len) {
		var bpos = p - this.bufferOffset;
		if(bpos + len > this.stringLength(this.buffer)) {
			var more = this.fetchBytes(4096);
			if(more != null) {
				this.buffer = this.substring(this.buffer,this.pos - this.bufferOffset) + more;
				this.bufferOffset = this.pos;
				bpos = p - this.bufferOffset;
			}
		}
		var ret = this.substring(this.buffer,bpos,len);
		if(ret != "") return ret; else return null;
	}
	,peekToken: function(skip) {
		if(skip == null) skip = 0;
		var token = this.cachedToken;
		var p = this.pos;
		if(token != null) {
			p = this.cachedPos;
			skip--;
		}
		while(skip-- >= 0) {
			token = this.get(p,1);
			if(token == null) break;
			var _g1 = 0;
			var _g = this.eol.length;
			while(_g1 < _g) {
				var i = _g1++;
				var t = this.get(p,this.eolsize[i]);
				if(t == this.eol[i]) {
					token = t;
					break;
				}
			}
			p += this.stringLength(token);
			if(this.cachedToken == null) {
				this.cachedToken = token;
				this.cachedPos = p;
			}
		}
		return token;
	}
	,nextToken: function() {
		var ret = this.peekToken();
		if(ret == null) return null;
		this.pos = this.cachedPos;
		this.cachedToken = null;
		return ret;
	}
	,readSafeChar: function() {
		var cur = this.peekToken();
		if(cur == this.sep || cur == this.esc || Lambda.has(this.eol,cur)) return null;
		return this.nextToken();
	}
	,readEscapedChar: function() {
		var cur = this.peekToken();
		if(cur == this.esc) {
			if(this.peekToken(1) != this.esc) return null;
			this.nextToken();
		}
		return this.nextToken();
	}
	,readEscapedString: function() {
		var buf_b = "";
		var x = this.readEscapedChar();
		while(x != null) {
			if(x == null) buf_b += "null"; else buf_b += "" + x;
			x = this.readEscapedChar();
		}
		return buf_b;
	}
	,readString: function() {
		var buf_b = "";
		var x = this.readSafeChar();
		while(x != null) {
			if(x == null) buf_b += "null"; else buf_b += "" + x;
			x = this.readSafeChar();
		}
		return buf_b;
	}
	,readField: function() {
		var cur = this.peekToken();
		if(cur == this.esc) {
			this.nextToken();
			var s = this.readEscapedString();
			var fi = this.nextToken();
			if(fi != this.esc) throw new js__$Boot_HaxeError("Missing " + this.esc + " at the end of escaped field " + (s.length > 15?HxOverrides.substr(s,0,10) + "[...]":s));
			return s;
		} else return this.readString();
	}
	,readRecord: function() {
		var r = [];
		r.push(this.readField());
		while(this.peekToken() == this.sep) {
			this.nextToken();
			r.push(this.readField());
		}
		return r;
	}
	,open: function(string,stream) {
		if(string != null) this.buffer = string; else this.buffer = "";
		this.inp = stream;
		this.pos = 0;
		this.bufferOffset = 0;
		this.cachedToken = null;
		this.cachedPos = 0;
		return this;
	}
	,reset: function(string,stream) {
		return this.open(string,stream);
	}
	,readAll: function() {
		var r = [];
		var nl;
		while(this.peekToken() != null) {
			r.push(this.readRecord());
			nl = this.nextToken();
			if(nl != null && !Lambda.has(this.eol,nl)) throw new js__$Boot_HaxeError("Unexpected \"" + nl + "\" after record");
		}
		return r;
	}
	,hasNext: function() {
		return this.peekToken() != null;
	}
	,next: function() {
		var r = this.readRecord();
		var nl = this.nextToken();
		if(nl != null && !Lambda.has(this.eol,nl)) throw new js__$Boot_HaxeError("Unexpected \"" + nl + "\" after record");
		return r;
	}
	,iterator: function() {
		return this;
	}
	,__class__: format_csv_Reader
};
var haxe_StackItem = { __ename__ : true, __constructs__ : ["CFunction","Module","FilePos","Method","LocalFunction"] };
haxe_StackItem.CFunction = ["CFunction",0];
haxe_StackItem.CFunction.toString = $estr;
haxe_StackItem.CFunction.__enum__ = haxe_StackItem;
haxe_StackItem.Module = function(m) { var $x = ["Module",1,m]; $x.__enum__ = haxe_StackItem; $x.toString = $estr; return $x; };
haxe_StackItem.FilePos = function(s,file,line) { var $x = ["FilePos",2,s,file,line]; $x.__enum__ = haxe_StackItem; $x.toString = $estr; return $x; };
haxe_StackItem.Method = function(classname,method) { var $x = ["Method",3,classname,method]; $x.__enum__ = haxe_StackItem; $x.toString = $estr; return $x; };
haxe_StackItem.LocalFunction = function(v) { var $x = ["LocalFunction",4,v]; $x.__enum__ = haxe_StackItem; $x.toString = $estr; return $x; };
var haxe_CallStack = function() { };
haxe_CallStack.__name__ = ["haxe","CallStack"];
haxe_CallStack.getStack = function(e) {
	if(e == null) return [];
	var oldValue = Error.prepareStackTrace;
	Error.prepareStackTrace = function(error,callsites) {
		var stack = [];
		var _g = 0;
		while(_g < callsites.length) {
			var site = callsites[_g];
			++_g;
			if(haxe_CallStack.wrapCallSite != null) site = haxe_CallStack.wrapCallSite(site);
			var method = null;
			var fullName = site.getFunctionName();
			if(fullName != null) {
				var idx = fullName.lastIndexOf(".");
				if(idx >= 0) {
					var className = HxOverrides.substr(fullName,0,idx);
					var methodName = HxOverrides.substr(fullName,idx + 1,null);
					method = haxe_StackItem.Method(className,methodName);
				}
			}
			stack.push(haxe_StackItem.FilePos(method,site.getFileName(),site.getLineNumber()));
		}
		return stack;
	};
	var a = haxe_CallStack.makeStack(e.stack);
	Error.prepareStackTrace = oldValue;
	return a;
};
haxe_CallStack.exceptionStack = function() {
	return haxe_CallStack.getStack(haxe_CallStack.lastException);
};
haxe_CallStack.makeStack = function(s) {
	if(s == null) return []; else if(typeof(s) == "string") {
		var stack = s.split("\n");
		if(stack[0] == "Error") stack.shift();
		var m = [];
		var rie10 = new EReg("^   at ([A-Za-z0-9_. ]+) \\(([^)]+):([0-9]+):([0-9]+)\\)$","");
		var _g = 0;
		while(_g < stack.length) {
			var line = stack[_g];
			++_g;
			if(rie10.match(line)) {
				var path = rie10.matched(1).split(".");
				var meth = path.pop();
				var file = rie10.matched(2);
				var line1 = Std.parseInt(rie10.matched(3));
				m.push(haxe_StackItem.FilePos(meth == "Anonymous function"?haxe_StackItem.LocalFunction():meth == "Global code"?null:haxe_StackItem.Method(path.join("."),meth),file,line1));
			} else m.push(haxe_StackItem.Module(StringTools.trim(line)));
		}
		return m;
	} else return s;
};
var haxe_IMap = function() { };
haxe_IMap.__name__ = ["haxe","IMap"];
var haxe__$Int64__$_$_$Int64 = function(high,low) {
	this.high = high;
	this.low = low;
};
haxe__$Int64__$_$_$Int64.__name__ = ["haxe","_Int64","___Int64"];
haxe__$Int64__$_$_$Int64.prototype = {
	__class__: haxe__$Int64__$_$_$Int64
};
var haxe_Timer = function(time_ms) {
	var me = this;
	this.id = setInterval(function() {
		me.run();
	},time_ms);
};
haxe_Timer.__name__ = ["haxe","Timer"];
haxe_Timer.prototype = {
	stop: function() {
		if(this.id == null) return;
		clearInterval(this.id);
		this.id = null;
	}
	,run: function() {
	}
	,__class__: haxe_Timer
};
var haxe_ds_ObjectMap = function() {
	this.h = { };
	this.h.__keys__ = { };
};
haxe_ds_ObjectMap.__name__ = ["haxe","ds","ObjectMap"];
haxe_ds_ObjectMap.__interfaces__ = [haxe_IMap];
haxe_ds_ObjectMap.prototype = {
	set: function(key,value) {
		var id = key.__id__ || (key.__id__ = ++haxe_ds_ObjectMap.count);
		this.h[id] = value;
		this.h.__keys__[id] = key;
	}
	,keys: function() {
		var a = [];
		for( var key in this.h.__keys__ ) {
		if(this.h.hasOwnProperty(key)) a.push(this.h.__keys__[key]);
		}
		return HxOverrides.iter(a);
	}
	,iterator: function() {
		return { ref : this.h, it : this.keys(), hasNext : function() {
			return this.it.hasNext();
		}, next : function() {
			var i = this.it.next();
			return this.ref[i.__id__];
		}};
	}
	,__class__: haxe_ds_ObjectMap
};
var haxe_ds_Option = { __ename__ : true, __constructs__ : ["Some","None"] };
haxe_ds_Option.Some = function(v) { var $x = ["Some",0,v]; $x.__enum__ = haxe_ds_Option; $x.toString = $estr; return $x; };
haxe_ds_Option.None = ["None",1];
haxe_ds_Option.None.toString = $estr;
haxe_ds_Option.None.__enum__ = haxe_ds_Option;
var haxe_ds__$StringMap_StringMapIterator = function(map,keys) {
	this.map = map;
	this.keys = keys;
	this.index = 0;
	this.count = keys.length;
};
haxe_ds__$StringMap_StringMapIterator.__name__ = ["haxe","ds","_StringMap","StringMapIterator"];
haxe_ds__$StringMap_StringMapIterator.prototype = {
	hasNext: function() {
		return this.index < this.count;
	}
	,next: function() {
		return this.map.get(this.keys[this.index++]);
	}
	,__class__: haxe_ds__$StringMap_StringMapIterator
};
var haxe_ds_StringMap = function() {
	this.h = { };
};
haxe_ds_StringMap.__name__ = ["haxe","ds","StringMap"];
haxe_ds_StringMap.__interfaces__ = [haxe_IMap];
haxe_ds_StringMap.prototype = {
	set: function(key,value) {
		if(__map_reserved[key] != null) this.setReserved(key,value); else this.h[key] = value;
	}
	,get: function(key) {
		if(__map_reserved[key] != null) return this.getReserved(key);
		return this.h[key];
	}
	,exists: function(key) {
		if(__map_reserved[key] != null) return this.existsReserved(key);
		return this.h.hasOwnProperty(key);
	}
	,setReserved: function(key,value) {
		if(this.rh == null) this.rh = { };
		this.rh["$" + key] = value;
	}
	,getReserved: function(key) {
		if(this.rh == null) return null; else return this.rh["$" + key];
	}
	,existsReserved: function(key) {
		if(this.rh == null) return false;
		return this.rh.hasOwnProperty("$" + key);
	}
	,remove: function(key) {
		if(__map_reserved[key] != null) {
			key = "$" + key;
			if(this.rh == null || !this.rh.hasOwnProperty(key)) return false;
			delete(this.rh[key]);
			return true;
		} else {
			if(!this.h.hasOwnProperty(key)) return false;
			delete(this.h[key]);
			return true;
		}
	}
	,keys: function() {
		var _this = this.arrayKeys();
		return HxOverrides.iter(_this);
	}
	,arrayKeys: function() {
		var out = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) out.push(key);
		}
		if(this.rh != null) {
			for( var key in this.rh ) {
			if(key.charCodeAt(0) == 36) out.push(key.substr(1));
			}
		}
		return out;
	}
	,iterator: function() {
		return new haxe_ds__$StringMap_StringMapIterator(this,this.arrayKeys());
	}
	,__class__: haxe_ds_StringMap
};
var haxe_io_Bytes = function(data) {
	this.length = data.byteLength;
	this.b = new Uint8Array(data);
	this.b.bufferValue = data;
	data.hxBytes = this;
	data.bytes = this.b;
};
haxe_io_Bytes.__name__ = ["haxe","io","Bytes"];
haxe_io_Bytes.alloc = function(length) {
	return new haxe_io_Bytes(new ArrayBuffer(length));
};
haxe_io_Bytes.prototype = {
	getString: function(pos,len) {
		if(pos < 0 || len < 0 || pos + len > this.length) throw new js__$Boot_HaxeError(haxe_io_Error.OutsideBounds);
		var s = "";
		var b = this.b;
		var fcc = String.fromCharCode;
		var i = pos;
		var max = pos + len;
		while(i < max) {
			var c = b[i++];
			if(c < 128) {
				if(c == 0) break;
				s += fcc(c);
			} else if(c < 224) s += fcc((c & 63) << 6 | b[i++] & 127); else if(c < 240) {
				var c2 = b[i++];
				s += fcc((c & 31) << 12 | (c2 & 127) << 6 | b[i++] & 127);
			} else {
				var c21 = b[i++];
				var c3 = b[i++];
				var u = (c & 15) << 18 | (c21 & 127) << 12 | (c3 & 127) << 6 | b[i++] & 127;
				s += fcc((u >> 10) + 55232);
				s += fcc(u & 1023 | 56320);
			}
		}
		return s;
	}
	,__class__: haxe_io_Bytes
};
var haxe_io_Eof = function() { };
haxe_io_Eof.__name__ = ["haxe","io","Eof"];
haxe_io_Eof.prototype = {
	toString: function() {
		return "Eof";
	}
	,__class__: haxe_io_Eof
};
var haxe_io_Error = { __ename__ : true, __constructs__ : ["Blocked","Overflow","OutsideBounds","Custom"] };
haxe_io_Error.Blocked = ["Blocked",0];
haxe_io_Error.Blocked.toString = $estr;
haxe_io_Error.Blocked.__enum__ = haxe_io_Error;
haxe_io_Error.Overflow = ["Overflow",1];
haxe_io_Error.Overflow.toString = $estr;
haxe_io_Error.Overflow.__enum__ = haxe_io_Error;
haxe_io_Error.OutsideBounds = ["OutsideBounds",2];
haxe_io_Error.OutsideBounds.toString = $estr;
haxe_io_Error.OutsideBounds.__enum__ = haxe_io_Error;
haxe_io_Error.Custom = function(e) { var $x = ["Custom",3,e]; $x.__enum__ = haxe_io_Error; $x.toString = $estr; return $x; };
var haxe_io_FPHelper = function() { };
haxe_io_FPHelper.__name__ = ["haxe","io","FPHelper"];
haxe_io_FPHelper.i32ToFloat = function(i) {
	var sign = 1 - (i >>> 31 << 1);
	var exp = i >>> 23 & 255;
	var sig = i & 8388607;
	if(sig == 0 && exp == 0) return 0.0;
	return sign * (1 + Math.pow(2,-23) * sig) * Math.pow(2,exp - 127);
};
haxe_io_FPHelper.floatToI32 = function(f) {
	if(f == 0) return 0;
	var af;
	if(f < 0) af = -f; else af = f;
	var exp = Math.floor(Math.log(af) / 0.6931471805599453);
	if(exp < -127) exp = -127; else if(exp > 128) exp = 128;
	var sig = Math.round((af / Math.pow(2,exp) - 1) * 8388608) & 8388607;
	return (f < 0?-2147483648:0) | exp + 127 << 23 | sig;
};
haxe_io_FPHelper.i64ToDouble = function(low,high) {
	var sign = 1 - (high >>> 31 << 1);
	var exp = (high >> 20 & 2047) - 1023;
	var sig = (high & 1048575) * 4294967296. + (low >>> 31) * 2147483648. + (low & 2147483647);
	if(sig == 0 && exp == -1023) return 0.0;
	return sign * (1.0 + Math.pow(2,-52) * sig) * Math.pow(2,exp);
};
haxe_io_FPHelper.doubleToI64 = function(v) {
	var i64 = haxe_io_FPHelper.i64tmp;
	if(v == 0) {
		i64.low = 0;
		i64.high = 0;
	} else {
		var av;
		if(v < 0) av = -v; else av = v;
		var exp = Math.floor(Math.log(av) / 0.6931471805599453);
		var sig;
		var v1 = (av / Math.pow(2,exp) - 1) * 4503599627370496.;
		sig = Math.round(v1);
		var sig_l = sig | 0;
		var sig_h = sig / 4294967296.0 | 0;
		i64.low = sig_l;
		i64.high = (v < 0?-2147483648:0) | exp + 1023 << 20 | sig_h;
	}
	return i64;
};
var haxe_io_Input = function() { };
haxe_io_Input.__name__ = ["haxe","io","Input"];
haxe_io_Input.prototype = {
	readByte: function() {
		throw new js__$Boot_HaxeError("Not implemented");
	}
	,readBytes: function(s,pos,len) {
		var k = len;
		var b = s.b;
		if(pos < 0 || len < 0 || pos + len > s.length) throw new js__$Boot_HaxeError(haxe_io_Error.OutsideBounds);
		while(k > 0) {
			b[pos] = this.readByte();
			pos++;
			k--;
		}
		return len;
	}
	,__class__: haxe_io_Input
};
var haxe_rtti_Meta = function() { };
haxe_rtti_Meta.__name__ = ["haxe","rtti","Meta"];
haxe_rtti_Meta.getMeta = function(t) {
	return t.__meta__;
};
haxe_rtti_Meta.getFields = function(t) {
	var meta = haxe_rtti_Meta.getMeta(t);
	if(meta == null || meta.fields == null) return { }; else return meta.fields;
};
var js__$Boot_HaxeError = function(val) {
	Error.call(this);
	this.val = val;
	this.message = String(val);
	if(Error.captureStackTrace) Error.captureStackTrace(this,js__$Boot_HaxeError);
};
js__$Boot_HaxeError.__name__ = ["js","_Boot","HaxeError"];
js__$Boot_HaxeError.__super__ = Error;
js__$Boot_HaxeError.prototype = $extend(Error.prototype,{
	__class__: js__$Boot_HaxeError
});
var js_Boot = function() { };
js_Boot.__name__ = ["js","Boot"];
js_Boot.getClass = function(o) {
	if((o instanceof Array) && o.__enum__ == null) return Array; else {
		var cl = o.__class__;
		if(cl != null) return cl;
		var name = js_Boot.__nativeClassName(o);
		if(name != null) return js_Boot.__resolveNativeClass(name);
		return null;
	}
};
js_Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str2 = o[0] + "(";
				s += "\t";
				var _g1 = 2;
				var _g = o.length;
				while(_g1 < _g) {
					var i1 = _g1++;
					if(i1 != 2) str2 += "," + js_Boot.__string_rec(o[i1],s); else str2 += js_Boot.__string_rec(o[i1],s);
				}
				return str2 + ")";
			}
			var l = o.length;
			var i;
			var str1 = "[";
			s += "\t";
			var _g2 = 0;
			while(_g2 < l) {
				var i2 = _g2++;
				str1 += (i2 > 0?",":"") + js_Boot.__string_rec(o[i2],s);
			}
			str1 += "]";
			return str1;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			haxe_CallStack.lastException = e;
			if (e instanceof js__$Boot_HaxeError) e = e.val;
			return "???";
		}
		if(tostr != null && tostr != Object.toString && typeof(tostr) == "function") {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) {
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str.length != 2) str += ", \n";
		str += s + k + " : " + js_Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str += "\n" + s + "}";
		return str;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
};
js_Boot.__interfLoop = function(cc,cl) {
	if(cc == null) return false;
	if(cc == cl) return true;
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g1 = 0;
		var _g = intf.length;
		while(_g1 < _g) {
			var i = _g1++;
			var i1 = intf[i];
			if(i1 == cl || js_Boot.__interfLoop(i1,cl)) return true;
		}
	}
	return js_Boot.__interfLoop(cc.__super__,cl);
};
js_Boot.__instanceof = function(o,cl) {
	if(cl == null) return false;
	switch(cl) {
	case Int:
		return (o|0) === o;
	case Float:
		return typeof(o) == "number";
	case Bool:
		return typeof(o) == "boolean";
	case String:
		return typeof(o) == "string";
	case Array:
		return (o instanceof Array) && o.__enum__ == null;
	case Dynamic:
		return true;
	default:
		if(o != null) {
			if(typeof(cl) == "function") {
				if(o instanceof cl) return true;
				if(js_Boot.__interfLoop(js_Boot.getClass(o),cl)) return true;
			} else if(typeof(cl) == "object" && js_Boot.__isNativeObj(cl)) {
				if(o instanceof cl) return true;
			}
		} else return false;
		if(cl == Class && o.__name__ != null) return true;
		if(cl == Enum && o.__ename__ != null) return true;
		return o.__enum__ == cl;
	}
};
js_Boot.__nativeClassName = function(o) {
	var name = js_Boot.__toStr.call(o).slice(8,-1);
	if(name == "Object" || name == "Function" || name == "Math" || name == "JSON") return null;
	return name;
};
js_Boot.__isNativeObj = function(o) {
	return js_Boot.__nativeClassName(o) != null;
};
js_Boot.__resolveNativeClass = function(name) {
	return $global[name];
};
var js_Browser = function() { };
js_Browser.__name__ = ["js","Browser"];
js_Browser.alert = function(v) {
	window.alert(js_Boot.__string_rec(v,""));
};
var js_d3__$D3_InitPriority = function() { };
js_d3__$D3_InitPriority.__name__ = ["js","d3","_D3","InitPriority"];
var js_html_compat_ArrayBuffer = function(a) {
	if((a instanceof Array) && a.__enum__ == null) {
		this.a = a;
		this.byteLength = a.length;
	} else {
		var len = a;
		this.a = [];
		var _g = 0;
		while(_g < len) {
			var i = _g++;
			this.a[i] = 0;
		}
		this.byteLength = len;
	}
};
js_html_compat_ArrayBuffer.__name__ = ["js","html","compat","ArrayBuffer"];
js_html_compat_ArrayBuffer.sliceImpl = function(begin,end) {
	var u = new Uint8Array(this,begin,end == null?null:end - begin);
	var result = new ArrayBuffer(u.byteLength);
	var resultArray = new Uint8Array(result);
	resultArray.set(u);
	return result;
};
js_html_compat_ArrayBuffer.prototype = {
	slice: function(begin,end) {
		return new js_html_compat_ArrayBuffer(this.a.slice(begin,end));
	}
	,__class__: js_html_compat_ArrayBuffer
};
var js_html_compat_DataView = function(buffer,byteOffset,byteLength) {
	this.buf = buffer;
	if(byteOffset == null) this.offset = 0; else this.offset = byteOffset;
	if(byteLength == null) this.length = buffer.byteLength - this.offset; else this.length = byteLength;
	if(this.offset < 0 || this.length < 0 || this.offset + this.length > buffer.byteLength) throw new js__$Boot_HaxeError(haxe_io_Error.OutsideBounds);
};
js_html_compat_DataView.__name__ = ["js","html","compat","DataView"];
js_html_compat_DataView.prototype = {
	getInt8: function(byteOffset) {
		var v = this.buf.a[this.offset + byteOffset];
		if(v >= 128) return v - 256; else return v;
	}
	,getUint8: function(byteOffset) {
		return this.buf.a[this.offset + byteOffset];
	}
	,getInt16: function(byteOffset,littleEndian) {
		var v = this.getUint16(byteOffset,littleEndian);
		if(v >= 32768) return v - 65536; else return v;
	}
	,getUint16: function(byteOffset,littleEndian) {
		if(littleEndian) return this.buf.a[this.offset + byteOffset] | this.buf.a[this.offset + byteOffset + 1] << 8; else return this.buf.a[this.offset + byteOffset] << 8 | this.buf.a[this.offset + byteOffset + 1];
	}
	,getInt32: function(byteOffset,littleEndian) {
		var p = this.offset + byteOffset;
		var a = this.buf.a[p++];
		var b = this.buf.a[p++];
		var c = this.buf.a[p++];
		var d = this.buf.a[p++];
		if(littleEndian) return a | b << 8 | c << 16 | d << 24; else return d | c << 8 | b << 16 | a << 24;
	}
	,getUint32: function(byteOffset,littleEndian) {
		var v = this.getInt32(byteOffset,littleEndian);
		if(v < 0) return v + 4294967296.; else return v;
	}
	,getFloat32: function(byteOffset,littleEndian) {
		return haxe_io_FPHelper.i32ToFloat(this.getInt32(byteOffset,littleEndian));
	}
	,getFloat64: function(byteOffset,littleEndian) {
		var a = this.getInt32(byteOffset,littleEndian);
		var b = this.getInt32(byteOffset + 4,littleEndian);
		return haxe_io_FPHelper.i64ToDouble(littleEndian?a:b,littleEndian?b:a);
	}
	,setInt8: function(byteOffset,value) {
		if(value < 0) this.buf.a[byteOffset + this.offset] = value + 128 & 255; else this.buf.a[byteOffset + this.offset] = value & 255;
	}
	,setUint8: function(byteOffset,value) {
		this.buf.a[byteOffset + this.offset] = value & 255;
	}
	,setInt16: function(byteOffset,value,littleEndian) {
		this.setUint16(byteOffset,value < 0?value + 65536:value,littleEndian);
	}
	,setUint16: function(byteOffset,value,littleEndian) {
		var p = byteOffset + this.offset;
		if(littleEndian) {
			this.buf.a[p] = value & 255;
			this.buf.a[p++] = value >> 8 & 255;
		} else {
			this.buf.a[p++] = value >> 8 & 255;
			this.buf.a[p] = value & 255;
		}
	}
	,setInt32: function(byteOffset,value,littleEndian) {
		this.setUint32(byteOffset,value,littleEndian);
	}
	,setUint32: function(byteOffset,value,littleEndian) {
		var p = byteOffset + this.offset;
		if(littleEndian) {
			this.buf.a[p++] = value & 255;
			this.buf.a[p++] = value >> 8 & 255;
			this.buf.a[p++] = value >> 16 & 255;
			this.buf.a[p++] = value >>> 24;
		} else {
			this.buf.a[p++] = value >>> 24;
			this.buf.a[p++] = value >> 16 & 255;
			this.buf.a[p++] = value >> 8 & 255;
			this.buf.a[p++] = value & 255;
		}
	}
	,setFloat32: function(byteOffset,value,littleEndian) {
		this.setUint32(byteOffset,haxe_io_FPHelper.floatToI32(value),littleEndian);
	}
	,setFloat64: function(byteOffset,value,littleEndian) {
		var i64 = haxe_io_FPHelper.doubleToI64(value);
		if(littleEndian) {
			this.setUint32(byteOffset,i64.low);
			this.setUint32(byteOffset,i64.high);
		} else {
			this.setUint32(byteOffset,i64.high);
			this.setUint32(byteOffset,i64.low);
		}
	}
	,__class__: js_html_compat_DataView
};
var js_html_compat_Uint8Array = function() { };
js_html_compat_Uint8Array.__name__ = ["js","html","compat","Uint8Array"];
js_html_compat_Uint8Array._new = function(arg1,offset,length) {
	var arr;
	if(typeof(arg1) == "number") {
		arr = [];
		var _g = 0;
		while(_g < arg1) {
			var i = _g++;
			arr[i] = 0;
		}
		arr.byteLength = arr.length;
		arr.byteOffset = 0;
		arr.buffer = new js_html_compat_ArrayBuffer(arr);
	} else if(js_Boot.__instanceof(arg1,js_html_compat_ArrayBuffer)) {
		var buffer = arg1;
		if(offset == null) offset = 0;
		if(length == null) length = buffer.byteLength - offset;
		if(offset == 0) arr = buffer.a; else arr = buffer.a.slice(offset,offset + length);
		arr.byteLength = arr.length;
		arr.byteOffset = offset;
		arr.buffer = buffer;
	} else if((arg1 instanceof Array) && arg1.__enum__ == null) {
		arr = arg1.slice();
		arr.byteLength = arr.length;
		arr.byteOffset = 0;
		arr.buffer = new js_html_compat_ArrayBuffer(arr);
	} else throw new js__$Boot_HaxeError("TODO " + Std.string(arg1));
	arr.subarray = js_html_compat_Uint8Array._subarray;
	arr.set = js_html_compat_Uint8Array._set;
	return arr;
};
js_html_compat_Uint8Array._set = function(arg,offset) {
	var t = this;
	if(js_Boot.__instanceof(arg.buffer,js_html_compat_ArrayBuffer)) {
		var a = arg;
		if(arg.byteLength + offset > t.byteLength) throw new js__$Boot_HaxeError("set() outside of range");
		var _g1 = 0;
		var _g = arg.byteLength;
		while(_g1 < _g) {
			var i = _g1++;
			t[i + offset] = a[i];
		}
	} else if((arg instanceof Array) && arg.__enum__ == null) {
		var a1 = arg;
		if(a1.length + offset > t.byteLength) throw new js__$Boot_HaxeError("set() outside of range");
		var _g11 = 0;
		var _g2 = a1.length;
		while(_g11 < _g2) {
			var i1 = _g11++;
			t[i1 + offset] = a1[i1];
		}
	} else throw new js__$Boot_HaxeError("TODO");
};
js_html_compat_Uint8Array._subarray = function(start,end) {
	var t = this;
	var a = js_html_compat_Uint8Array._new(t.slice(start,end));
	a.byteOffset = start;
	return a;
};
var js_promhx_JQueryTools = function() { };
js_promhx_JQueryTools.__name__ = ["js","promhx","JQueryTools"];
js_promhx_JQueryTools.bindStream = function(f) {
	var def = new promhx_Deferred();
	var str = new promhx_Stream(def);
	f($bind(def,def.resolve));
	return str;
};
js_promhx_JQueryTools.eventStream = function(jq,events) {
	var def = new promhx_Deferred();
	var str = new promhx_Stream(def);
	jq.on(events,$bind(def,def.resolve));
	return str;
};
js_promhx_JQueryTools.loadPromise = function(jq,url,data) {
	var def = new promhx_Deferred();
	var pro = new promhx_Promise(def);
	jq.load(url,data,function(responseText,textStatus) {
		def.resolve({ responseText : responseText, textStatus : textStatus});
	});
	return pro;
};
var massive_haxe_Exception = function(message,info) {
	this.message = message;
	this.info = info;
	this.type = massive_haxe_util_ReflectUtil.here({ fileName : "Exception.hx", lineNumber : 70, className : "massive.haxe.Exception", methodName : "new"}).className;
};
massive_haxe_Exception.__name__ = ["massive","haxe","Exception"];
massive_haxe_Exception.prototype = {
	toString: function() {
		var str = this.type + ": " + this.message;
		if(this.info != null) str += " at " + this.info.className + "#" + this.info.methodName + " (" + this.info.lineNumber + ")";
		return str;
	}
	,__class__: massive_haxe_Exception
};
var massive_haxe_util_ReflectUtil = function() { };
massive_haxe_util_ReflectUtil.__name__ = ["massive","haxe","util","ReflectUtil"];
massive_haxe_util_ReflectUtil.here = function(info) {
	return info;
};
var massive_munit_Assert = function() { };
massive_munit_Assert.__name__ = ["massive","munit","Assert"];
massive_munit_Assert.isTrue = function(value,info) {
	massive_munit_Assert.assertionCount++;
	if(value != true) massive_munit_Assert.fail("Expected TRUE but was [" + (value == null?"null":"" + value) + "]",info);
};
massive_munit_Assert.isFalse = function(value,info) {
	massive_munit_Assert.assertionCount++;
	if(value != false) massive_munit_Assert.fail("Expected FALSE but was [" + (value == null?"null":"" + value) + "]",info);
};
massive_munit_Assert.isNull = function(value,info) {
	massive_munit_Assert.assertionCount++;
	if(value != null) massive_munit_Assert.fail("Value [" + Std.string(value) + "] was not NULL",info);
};
massive_munit_Assert.isNotNull = function(value,info) {
	massive_munit_Assert.assertionCount++;
	if(value == null) massive_munit_Assert.fail("Value [" + Std.string(value) + "] was NULL",info);
};
massive_munit_Assert.isNaN = function(value,info) {
	massive_munit_Assert.assertionCount++;
	if(!isNaN(value)) massive_munit_Assert.fail("Value [" + value + "]  was not NaN",info);
};
massive_munit_Assert.isNotNaN = function(value,info) {
	massive_munit_Assert.assertionCount++;
	if(isNaN(value)) massive_munit_Assert.fail("Value [" + value + "] was NaN",info);
};
massive_munit_Assert.isType = function(value,type,info) {
	massive_munit_Assert.assertionCount++;
	if(!js_Boot.__instanceof(value,type)) massive_munit_Assert.fail("Value [" + Std.string(value) + "] was not of type: " + Type.getClassName(type),info);
};
massive_munit_Assert.isNotType = function(value,type,info) {
	massive_munit_Assert.assertionCount++;
	if(js_Boot.__instanceof(value,type)) massive_munit_Assert.fail("Value [" + Std.string(value) + "] was of type: " + Type.getClassName(type),info);
};
massive_munit_Assert.areEqual = function(expected,actual,info) {
	massive_munit_Assert.assertionCount++;
	var equal;
	{
		var _g = Type["typeof"](expected);
		switch(_g[1]) {
		case 7:
			equal = Type.enumEq(expected,actual);
			break;
		default:
			equal = expected == actual;
		}
	}
	if(!equal) massive_munit_Assert.fail("Value [" + Std.string(actual) + "] was not equal to expected value [" + Std.string(expected) + "]",info);
};
massive_munit_Assert.areNotEqual = function(expected,actual,info) {
	massive_munit_Assert.assertionCount++;
	var equal;
	{
		var _g = Type["typeof"](expected);
		switch(_g[1]) {
		case 7:
			equal = Type.enumEq(expected,actual);
			break;
		default:
			equal = expected == actual;
		}
	}
	if(equal) massive_munit_Assert.fail("Value [" + Std.string(actual) + "] was equal to value [" + Std.string(expected) + "]",info);
};
massive_munit_Assert.areSame = function(expected,actual,info) {
	massive_munit_Assert.assertionCount++;
	if(expected != actual) massive_munit_Assert.fail("Value [" + Std.string(actual) + "] was not the same as expected value [" + Std.string(expected) + "]",info);
};
massive_munit_Assert.areNotSame = function(expected,actual,info) {
	massive_munit_Assert.assertionCount++;
	if(expected == actual) massive_munit_Assert.fail("Value [" + Std.string(actual) + "] was the same as expected value [" + Std.string(expected) + "]",info);
};
massive_munit_Assert.fail = function(msg,info) {
	throw new js__$Boot_HaxeError(new massive_munit_AssertionException(msg,info));
};
var massive_munit_MUnitException = function(message,info) {
	massive_haxe_Exception.call(this,message,info);
	this.type = massive_haxe_util_ReflectUtil.here({ fileName : "MUnitException.hx", lineNumber : 50, className : "massive.munit.MUnitException", methodName : "new"}).className;
};
massive_munit_MUnitException.__name__ = ["massive","munit","MUnitException"];
massive_munit_MUnitException.__super__ = massive_haxe_Exception;
massive_munit_MUnitException.prototype = $extend(massive_haxe_Exception.prototype,{
	__class__: massive_munit_MUnitException
});
var massive_munit_AssertionException = function(msg,info) {
	massive_munit_MUnitException.call(this,msg,info);
	this.type = massive_haxe_util_ReflectUtil.here({ fileName : "AssertionException.hx", lineNumber : 49, className : "massive.munit.AssertionException", methodName : "new"}).className;
};
massive_munit_AssertionException.__name__ = ["massive","munit","AssertionException"];
massive_munit_AssertionException.__super__ = massive_munit_MUnitException;
massive_munit_AssertionException.prototype = $extend(massive_munit_MUnitException.prototype,{
	__class__: massive_munit_AssertionException
});
var massive_munit_ITestResultClient = function() { };
massive_munit_ITestResultClient.__name__ = ["massive","munit","ITestResultClient"];
massive_munit_ITestResultClient.prototype = {
	__class__: massive_munit_ITestResultClient
};
var massive_munit_IAdvancedTestResultClient = function() { };
massive_munit_IAdvancedTestResultClient.__name__ = ["massive","munit","IAdvancedTestResultClient"];
massive_munit_IAdvancedTestResultClient.__interfaces__ = [massive_munit_ITestResultClient];
massive_munit_IAdvancedTestResultClient.prototype = {
	__class__: massive_munit_IAdvancedTestResultClient
};
var massive_munit_ICoverageTestResultClient = function() { };
massive_munit_ICoverageTestResultClient.__name__ = ["massive","munit","ICoverageTestResultClient"];
massive_munit_ICoverageTestResultClient.__interfaces__ = [massive_munit_IAdvancedTestResultClient];
massive_munit_ICoverageTestResultClient.prototype = {
	__class__: massive_munit_ICoverageTestResultClient
};
var massive_munit_TestClassHelper = function(type,isDebug) {
	if(isDebug == null) isDebug = false;
	this.type = type;
	this.isDebug = isDebug;
	this.tests = [];
	this.index = 0;
	this.className = Type.getClassName(type);
	this.beforeClass = $bind(this,this.nullFunc);
	this.afterClass = $bind(this,this.nullFunc);
	this.before = $bind(this,this.nullFunc);
	this.after = $bind(this,this.nullFunc);
	this.parse(type);
};
massive_munit_TestClassHelper.__name__ = ["massive","munit","TestClassHelper"];
massive_munit_TestClassHelper.prototype = {
	hasNext: function() {
		return this.index < this.tests.length;
	}
	,next: function() {
		if(this.hasNext()) return this.tests[this.index++]; else return null;
	}
	,current: function() {
		if(this.index <= 0) return this.tests[0]; else return this.tests[this.index - 1];
	}
	,parse: function(type) {
		this.test = Type.createEmptyInstance(type);
		var inherintanceChain = this.getInheritanceChain(type);
		var fieldMeta = this.collateFieldMeta(inherintanceChain);
		this.scanForTests(fieldMeta);
		this.tests.sort($bind(this,this.sortTestsByName));
	}
	,getInheritanceChain: function(clazz) {
		var inherintanceChain = [clazz];
		while((clazz = Type.getSuperClass(clazz)) != null) inherintanceChain.push(clazz);
		return inherintanceChain;
	}
	,collateFieldMeta: function(inherintanceChain) {
		var meta = { };
		while(inherintanceChain.length > 0) {
			var clazz = inherintanceChain.pop();
			var newMeta = haxe_rtti_Meta.getFields(clazz);
			var markedFieldNames = Reflect.fields(newMeta);
			var _g = 0;
			while(_g < markedFieldNames.length) {
				var fieldName = markedFieldNames[_g];
				++_g;
				var recordedFieldTags = Reflect.field(meta,fieldName);
				var newFieldTags = Reflect.field(newMeta,fieldName);
				var newTagNames = Reflect.fields(newFieldTags);
				if(recordedFieldTags == null) {
					var tagsCopy = { };
					var _g1 = 0;
					while(_g1 < newTagNames.length) {
						var tagName = newTagNames[_g1];
						++_g1;
						Reflect.setField(tagsCopy,tagName,Reflect.field(newFieldTags,tagName));
					}
					meta[fieldName] = tagsCopy;
				} else {
					var ignored = false;
					var _g11 = 0;
					while(_g11 < newTagNames.length) {
						var tagName1 = newTagNames[_g11];
						++_g11;
						if(tagName1 == "Ignore") ignored = true;
						if(!ignored && (tagName1 == "Test" || tagName1 == "AsyncTest") && Object.prototype.hasOwnProperty.call(recordedFieldTags,"Ignore")) Reflect.deleteField(recordedFieldTags,"Ignore");
						var tagValue = Reflect.field(newFieldTags,tagName1);
						recordedFieldTags[tagName1] = tagValue;
					}
				}
			}
		}
		return meta;
	}
	,scanForTests: function(fieldMeta) {
		var fieldNames = Reflect.fields(fieldMeta);
		var _g = 0;
		while(_g < fieldNames.length) {
			var fieldName = fieldNames[_g];
			++_g;
			var f = Reflect.field(this.test,fieldName);
			if(Reflect.isFunction(f)) {
				var funcMeta = Reflect.field(fieldMeta,fieldName);
				this.searchForMatchingTags(fieldName,f,funcMeta);
			}
		}
	}
	,searchForMatchingTags: function(fieldName,func,funcMeta) {
		var _g = 0;
		var _g1 = massive_munit_TestClassHelper.META_TAGS;
		while(_g < _g1.length) {
			var tag = _g1[_g];
			++_g;
			if(Object.prototype.hasOwnProperty.call(funcMeta,tag)) {
				var args = Reflect.field(funcMeta,tag);
				var description;
				if(args != null) description = args[0]; else description = "";
				var isAsync = args != null && description == "Async";
				var isIgnored = Object.prototype.hasOwnProperty.call(funcMeta,"Ignore");
				if(isAsync) description = ""; else if(isIgnored) {
					args = Reflect.field(funcMeta,"Ignore");
					if(args != null) description = args[0]; else description = "";
				}
				switch(tag) {
				case "BeforeClass":
					this.beforeClass = func;
					break;
				case "AfterClass":
					this.afterClass = func;
					break;
				case "Before":
					this.before = func;
					break;
				case "After":
					this.after = func;
					break;
				case "AsyncTest":
					if(!this.isDebug) this.addTest(fieldName,func,this.test,true,isIgnored,description);
					break;
				case "Test":
					if(!this.isDebug) this.addTest(fieldName,func,this.test,isAsync,isIgnored,description);
					break;
				case "TestDebug":
					if(this.isDebug) this.addTest(fieldName,func,this.test,isAsync,isIgnored,description);
					break;
				}
			}
		}
	}
	,addTest: function(field,testFunction,testInstance,isAsync,isIgnored,description) {
		var result = new massive_munit_TestResult();
		result.async = isAsync;
		result.ignore = isIgnored;
		result.className = this.className;
		result.description = description;
		result.name = field;
		var data = { test : testFunction, scope : testInstance, result : result};
		this.tests.push(data);
	}
	,sortTestsByName: function(x,y) {
		if(x.result.name == y.result.name) return 0;
		if(x.result.name > y.result.name) return 1; else return -1;
	}
	,nullFunc: function() {
	}
	,__class__: massive_munit_TestClassHelper
};
var massive_munit_TestResult = function() {
	this.passed = false;
	this.executionTime = 0.0;
	this.name = "";
	this.className = "";
	this.description = "";
	this.async = false;
	this.ignore = false;
	this.error = null;
	this.failure = null;
};
massive_munit_TestResult.__name__ = ["massive","munit","TestResult"];
massive_munit_TestResult.prototype = {
	get_location: function() {
		if(this.name == "" && this.className == "") return ""; else return this.className + "#" + this.name;
	}
	,get_type: function() {
		if(this.error != null) return massive_munit_TestResultType.ERROR;
		if(this.failure != null) return massive_munit_TestResultType.FAIL;
		if(this.ignore == true) return massive_munit_TestResultType.IGNORE;
		if(this.passed == true) return massive_munit_TestResultType.PASS;
		return massive_munit_TestResultType.UNKNOWN;
	}
	,__class__: massive_munit_TestResult
};
var massive_munit_TestResultType = { __ename__ : true, __constructs__ : ["UNKNOWN","PASS","FAIL","ERROR","IGNORE"] };
massive_munit_TestResultType.UNKNOWN = ["UNKNOWN",0];
massive_munit_TestResultType.UNKNOWN.toString = $estr;
massive_munit_TestResultType.UNKNOWN.__enum__ = massive_munit_TestResultType;
massive_munit_TestResultType.PASS = ["PASS",1];
massive_munit_TestResultType.PASS.toString = $estr;
massive_munit_TestResultType.PASS.__enum__ = massive_munit_TestResultType;
massive_munit_TestResultType.FAIL = ["FAIL",2];
massive_munit_TestResultType.FAIL.toString = $estr;
massive_munit_TestResultType.FAIL.__enum__ = massive_munit_TestResultType;
massive_munit_TestResultType.ERROR = ["ERROR",3];
massive_munit_TestResultType.ERROR.toString = $estr;
massive_munit_TestResultType.ERROR.__enum__ = massive_munit_TestResultType;
massive_munit_TestResultType.IGNORE = ["IGNORE",4];
massive_munit_TestResultType.IGNORE.toString = $estr;
massive_munit_TestResultType.IGNORE.__enum__ = massive_munit_TestResultType;
var massive_munit_async_IAsyncDelegateObserver = function() { };
massive_munit_async_IAsyncDelegateObserver.__name__ = ["massive","munit","async","IAsyncDelegateObserver"];
massive_munit_async_IAsyncDelegateObserver.prototype = {
	__class__: massive_munit_async_IAsyncDelegateObserver
};
var massive_munit_TestRunner = function(resultClient) {
	this.clients = [];
	this.addResultClient(resultClient);
	this.set_asyncFactory(this.createAsyncFactory());
	this.running = false;
	this.isDebug = false;
};
massive_munit_TestRunner.__name__ = ["massive","munit","TestRunner"];
massive_munit_TestRunner.__interfaces__ = [massive_munit_async_IAsyncDelegateObserver];
massive_munit_TestRunner.prototype = {
	get_clientCount: function() {
		return this.clients.length;
	}
	,set_asyncFactory: function(value) {
		if(value == this.asyncFactory) return value;
		if(this.running) throw new js__$Boot_HaxeError(new massive_munit_MUnitException("Can't change AsyncFactory while tests are running",{ fileName : "TestRunner.hx", lineNumber : 127, className : "massive.munit.TestRunner", methodName : "set_asyncFactory"}));
		value.observer = this;
		return this.asyncFactory = value;
	}
	,addResultClient: function(resultClient) {
		var _g = 0;
		var _g1 = this.clients;
		while(_g < _g1.length) {
			var client = _g1[_g];
			++_g;
			if(client == resultClient) return;
		}
		resultClient.set_completionHandler($bind(this,this.clientCompletionHandler));
		this.clients.push(resultClient);
	}
	,debug: function(testSuiteClasses) {
		this.isDebug = true;
		this.run(testSuiteClasses);
	}
	,run: function(testSuiteClasses) {
		if(this.running) return;
		this.running = true;
		this.asyncPending = false;
		this.asyncDelegate = null;
		this.testCount = 0;
		this.failCount = 0;
		this.errorCount = 0;
		this.passCount = 0;
		this.ignoreCount = 0;
		this.suiteIndex = 0;
		this.clientCompleteCount = 0;
		massive_munit_Assert.assertionCount = 0;
		this.emptyParams = [];
		this.testSuites = [];
		this.startTime = massive_munit_util_Timer.stamp();
		var _g = 0;
		while(_g < testSuiteClasses.length) {
			var suiteType = testSuiteClasses[_g];
			++_g;
			this.testSuites.push(Type.createInstance(suiteType,[]));
		}
		this.execute();
	}
	,execute: function() {
		var _g1 = this.suiteIndex;
		var _g = this.testSuites.length;
		while(_g1 < _g) {
			var i = _g1++;
			var suite = this.testSuites[i];
			while( suite.hasNext() ) {
				var testClass = suite.next();
				if(this.activeHelper == null || this.activeHelper.type != testClass) {
					this.activeHelper = new massive_munit_TestClassHelper(testClass,this.isDebug);
					Reflect.callMethod(this.activeHelper.test,this.activeHelper.beforeClass,this.emptyParams);
				}
				this.executeTestCases();
				if(!this.asyncPending) Reflect.callMethod(this.activeHelper.test,this.activeHelper.afterClass,this.emptyParams); else {
					suite.repeat();
					this.suiteIndex = i;
					return;
				}
			}
		}
		if(!this.asyncPending) {
			var time = massive_munit_util_Timer.stamp() - this.startTime;
			var _g2 = 0;
			var _g11 = this.clients;
			while(_g2 < _g11.length) {
				var client = _g11[_g2];
				++_g2;
				if(js_Boot.__instanceof(client,massive_munit_IAdvancedTestResultClient)) {
					var cl = client;
					cl.setCurrentTestClass(null);
				}
				client.reportFinalStatistics(this.testCount,this.passCount,this.failCount,this.errorCount,this.ignoreCount,time);
			}
		}
	}
	,executeTestCases: function() {
		var _g = 0;
		var _g1 = this.clients;
		while(_g < _g1.length) {
			var c = _g1[_g];
			++_g;
			if(js_Boot.__instanceof(c,massive_munit_IAdvancedTestResultClient)) {
				if(this.activeHelper.hasNext()) {
					var cl = c;
					cl.setCurrentTestClass(this.activeHelper.className);
				}
			}
		}
		var $it0 = this.activeHelper;
		while( $it0.hasNext() ) {
			var testCaseData = $it0.next();
			if(testCaseData.result.ignore) {
				this.ignoreCount++;
				var _g2 = 0;
				var _g11 = this.clients;
				while(_g2 < _g11.length) {
					var c1 = _g11[_g2];
					++_g2;
					c1.addIgnore(testCaseData.result);
				}
			} else {
				this.testCount++;
				Reflect.callMethod(this.activeHelper.test,this.activeHelper.before,this.emptyParams);
				this.testStartTime = massive_munit_util_Timer.stamp();
				this.executeTestCase(testCaseData,testCaseData.result.async);
				if(!this.asyncPending) Reflect.callMethod(this.activeHelper.test,this.activeHelper.after,this.emptyParams); else break;
			}
		}
	}
	,executeTestCase: function(testCaseData,async) {
		var result = testCaseData.result;
		try {
			var assertionCount = massive_munit_Assert.assertionCount;
			if(async) {
				Reflect.callMethod(testCaseData.scope,testCaseData.test,[this.asyncFactory]);
				if(this.asyncDelegate == null) throw new js__$Boot_HaxeError(new massive_munit_async_MissingAsyncDelegateException("No AsyncDelegate was created in async test at " + result.get_location(),null));
				this.asyncPending = true;
			} else {
				Reflect.callMethod(testCaseData.scope,testCaseData.test,this.emptyParams);
				result.passed = true;
				result.executionTime = massive_munit_util_Timer.stamp() - this.testStartTime;
				this.passCount++;
				var _g = 0;
				var _g1 = this.clients;
				while(_g < _g1.length) {
					var c = _g1[_g];
					++_g;
					c.addPass(result);
				}
			}
		} catch( e ) {
			haxe_CallStack.lastException = e;
			if (e instanceof js__$Boot_HaxeError) e = e.val;
			if(async && this.asyncDelegate != null) {
				this.asyncDelegate.cancelTest();
				this.asyncDelegate = null;
			}
			if(js_Boot.__instanceof(e,org_hamcrest_AssertionException)) e = new massive_munit_AssertionException(e.message,e.info);
			if(js_Boot.__instanceof(e,massive_munit_AssertionException)) {
				result.executionTime = massive_munit_util_Timer.stamp() - this.testStartTime;
				result.failure = e;
				this.failCount++;
				var _g2 = 0;
				var _g11 = this.clients;
				while(_g2 < _g11.length) {
					var c1 = _g11[_g2];
					++_g2;
					c1.addFail(result);
				}
			} else {
				result.executionTime = massive_munit_util_Timer.stamp() - this.testStartTime;
				if(!js_Boot.__instanceof(e,massive_munit_MUnitException)) e = new massive_munit_UnhandledException(e,result.get_location());
				result.error = e;
				this.errorCount++;
				var _g3 = 0;
				var _g12 = this.clients;
				while(_g3 < _g12.length) {
					var c2 = _g12[_g3];
					++_g3;
					c2.addError(result);
				}
			}
		}
	}
	,clientCompletionHandler: function(resultClient) {
		if(++this.clientCompleteCount == this.clients.length) {
			if(this.completionHandler != null) {
				var successful = this.passCount == this.testCount;
				var handler = this.completionHandler;
				massive_munit_util_Timer.delay(function() {
					handler(successful);
				},10);
			}
			this.running = false;
		}
	}
	,asyncResponseHandler: function(delegate) {
		var testCaseData = this.activeHelper.current();
		testCaseData.test = $bind(delegate,delegate.runTest);
		testCaseData.scope = delegate;
		this.asyncPending = false;
		this.asyncDelegate = null;
		this.executeTestCase(testCaseData,false);
		Reflect.callMethod(this.activeHelper.test,this.activeHelper.after,this.emptyParams);
		this.execute();
	}
	,asyncTimeoutHandler: function(delegate) {
		var testCaseData = this.activeHelper.current();
		var result = testCaseData.result;
		result.executionTime = massive_munit_util_Timer.stamp() - this.testStartTime;
		result.error = new massive_munit_async_AsyncTimeoutException("",delegate.info);
		this.asyncPending = false;
		this.asyncDelegate = null;
		this.errorCount++;
		var _g = 0;
		var _g1 = this.clients;
		while(_g < _g1.length) {
			var c = _g1[_g];
			++_g;
			c.addError(result);
		}
		Reflect.callMethod(this.activeHelper.test,this.activeHelper.after,this.emptyParams);
		this.execute();
	}
	,asyncDelegateCreatedHandler: function(delegate) {
		this.asyncDelegate = delegate;
	}
	,createAsyncFactory: function() {
		return new massive_munit_async_AsyncFactory(this);
	}
	,__class__: massive_munit_TestRunner
};
var massive_munit_TestSuite = function() {
	this.tests = [];
	this.index = 0;
};
massive_munit_TestSuite.__name__ = ["massive","munit","TestSuite"];
massive_munit_TestSuite.prototype = {
	add: function(test) {
		this.tests.push(test);
		this.sortTests();
	}
	,hasNext: function() {
		return this.index < this.tests.length;
	}
	,next: function() {
		if(this.hasNext()) return this.tests[this.index++]; else return null;
	}
	,repeat: function() {
		if(this.index > 0) this.index--;
	}
	,sortTests: function() {
		this.tests.sort($bind(this,this.sortByName));
	}
	,sortByName: function(x,y) {
		var xName = Type.getClassName(x);
		var yName = Type.getClassName(y);
		if(xName == yName) return 0;
		if(xName > yName) return 1; else return -1;
	}
	,__class__: massive_munit_TestSuite
};
var massive_munit_UnhandledException = function(source,testLocation) {
	massive_munit_MUnitException.call(this,Std.string(source.toString()) + this.formatLocation(source,testLocation),null);
	this.type = massive_haxe_util_ReflectUtil.here({ fileName : "UnhandledException.hx", lineNumber : 53, className : "massive.munit.UnhandledException", methodName : "new"}).className;
};
massive_munit_UnhandledException.__name__ = ["massive","munit","UnhandledException"];
massive_munit_UnhandledException.__super__ = massive_munit_MUnitException;
massive_munit_UnhandledException.prototype = $extend(massive_munit_MUnitException.prototype,{
	formatLocation: function(source,testLocation) {
		var stackTrace = " at " + testLocation;
		var stack = this.getStackTrace(source);
		if(stack != "") stackTrace += " " + HxOverrides.substr(stack,1,null);
		return stackTrace;
	}
	,getStackTrace: function(source) {
		var s = "";
		if(s == "") {
			var stack = haxe_CallStack.exceptionStack();
			while(stack.length > 0) {
				var _g = stack.shift();
				if(_g != null) switch(_g[1]) {
				case 2:
					var line = _g[4];
					var file = _g[3];
					s += "\tat " + file + " (" + line + ")\n";
					break;
				case 3:
					var method = _g[3];
					var classname = _g[2];
					s += "\tat " + classname + "#" + method + "\n";
					break;
				default:
				} else {
				}
			}
		}
		return s;
	}
	,__class__: massive_munit_UnhandledException
});
var massive_munit_async_AsyncDelegate = function(testCase,handler,timeout,info) {
	var self = this;
	this.testCase = testCase;
	this.handler = handler;
	this.delegateHandler = Reflect.makeVarArgs($bind(this,this.responseHandler));
	this.info = info;
	this.params = [];
	this.timedOut = false;
	this.canceled = false;
	if(timeout == null || timeout <= 0) timeout = 400;
	this.timeoutDelay = timeout;
	this.timer = massive_munit_util_Timer.delay($bind(this,this.timeoutHandler),this.timeoutDelay);
};
massive_munit_async_AsyncDelegate.__name__ = ["massive","munit","async","AsyncDelegate"];
massive_munit_async_AsyncDelegate.prototype = {
	runTest: function() {
		Reflect.callMethod(this.testCase,this.handler,this.params);
	}
	,cancelTest: function() {
		this.canceled = true;
		this.timer.stop();
		if(this.deferredTimer != null) this.deferredTimer.stop();
	}
	,responseHandler: function(params) {
		if(this.timedOut || this.canceled) return null;
		this.timer.stop();
		if(this.deferredTimer != null) this.deferredTimer.stop();
		if(params == null) params = [];
		this.params = params;
		if(this.observer != null) massive_munit_util_Timer.delay($bind(this,this.delayActualResponseHandler),1);
		return null;
	}
	,delayActualResponseHandler: function() {
		this.observer.asyncResponseHandler(this);
		this.observer = null;
	}
	,timeoutHandler: function() {
		this.actualTimeoutHandler();
	}
	,actualTimeoutHandler: function() {
		this.deferredTimer = null;
		this.handler = null;
		this.delegateHandler = null;
		this.timedOut = true;
		if(this.observer != null) {
			this.observer.asyncTimeoutHandler(this);
			this.observer = null;
		}
	}
	,__class__: massive_munit_async_AsyncDelegate
};
var massive_munit_async_AsyncFactory = function(observer) {
	this.observer = observer;
	this.asyncDelegateCount = 0;
};
massive_munit_async_AsyncFactory.__name__ = ["massive","munit","async","AsyncFactory"];
massive_munit_async_AsyncFactory.prototype = {
	createHandler: function(testCase,handler,timeout,info) {
		var delegate = new massive_munit_async_AsyncDelegate(testCase,handler,timeout,info);
		delegate.observer = this.observer;
		this.asyncDelegateCount++;
		this.observer.asyncDelegateCreatedHandler(delegate);
		return delegate.delegateHandler;
	}
	,__class__: massive_munit_async_AsyncFactory
};
var massive_munit_async_AsyncTimeoutException = function(message,info) {
	massive_munit_MUnitException.call(this,message,info);
	this.type = massive_haxe_util_ReflectUtil.here({ fileName : "AsyncTimeoutException.hx", lineNumber : 47, className : "massive.munit.async.AsyncTimeoutException", methodName : "new"}).className;
};
massive_munit_async_AsyncTimeoutException.__name__ = ["massive","munit","async","AsyncTimeoutException"];
massive_munit_async_AsyncTimeoutException.__super__ = massive_munit_MUnitException;
massive_munit_async_AsyncTimeoutException.prototype = $extend(massive_munit_MUnitException.prototype,{
	__class__: massive_munit_async_AsyncTimeoutException
});
var massive_munit_async_MissingAsyncDelegateException = function(message,info) {
	massive_munit_MUnitException.call(this,message,info);
	this.type = massive_haxe_util_ReflectUtil.here({ fileName : "MissingAsyncDelegateException.hx", lineNumber : 47, className : "massive.munit.async.MissingAsyncDelegateException", methodName : "new"}).className;
};
massive_munit_async_MissingAsyncDelegateException.__name__ = ["massive","munit","async","MissingAsyncDelegateException"];
massive_munit_async_MissingAsyncDelegateException.__super__ = massive_munit_MUnitException;
massive_munit_async_MissingAsyncDelegateException.prototype = $extend(massive_munit_MUnitException.prototype,{
	__class__: massive_munit_async_MissingAsyncDelegateException
});
var massive_munit_util_Timer = $hx_exports.massive.munit.util.Timer = function(time_ms) {
	this.id = massive_munit_util_Timer.arr.length;
	massive_munit_util_Timer.arr[this.id] = this;
	this.timerId = window.setInterval("massive.munit.util.Timer.arr[" + this.id + "].run();",time_ms);
};
massive_munit_util_Timer.__name__ = ["massive","munit","util","Timer"];
massive_munit_util_Timer.delay = function(f,time_ms) {
	var t = new massive_munit_util_Timer(time_ms);
	t.run = function() {
		t.stop();
		f();
	};
	return t;
};
massive_munit_util_Timer.stamp = function() {
	return new Date().getTime() / 1000;
};
massive_munit_util_Timer.prototype = {
	stop: function() {
		if(this.id == null) return;
		window.clearInterval(this.timerId);
		massive_munit_util_Timer.arr[this.id] = null;
		if(this.id > 100 && this.id == massive_munit_util_Timer.arr.length - 1) {
			var p = this.id - 1;
			while(p >= 0 && massive_munit_util_Timer.arr[p] == null) p--;
			massive_munit_util_Timer.arr = massive_munit_util_Timer.arr.slice(0,p + 1);
		}
		this.id = null;
	}
	,run: function() {
	}
	,__class__: massive_munit_util_Timer
};
var model_CCAR = function(name,text,cr) {
	try {
		console.log("Creating ccar instance");
		this.scenarioName = name;
		this.scenarioText = text;
		this.creator = cr;
		this.deleted = false;
	} catch( err ) {
		haxe_CallStack.lastException = err;
		if (err instanceof js__$Boot_HaxeError) err = err.val;
		console.log("Exception creating ccar " + Std.string(err));
	}
	console.log("Created ccar instance successfully");
};
model_CCAR.__name__ = ["model","CCAR"];
model_CCAR.prototype = {
	getScenarioName: function() {
		if(this.getScenarioNameElement() != null) return this.getScenarioNameElement().value; else {
			console.log("Element not defined ");
			return "TBD";
		}
	}
	,getScenarioNameElement: function() {
		return window.document.getElementById(model_CCAR.SCENARIO_NAME);
	}
	,getScenarioText: function() {
		return this.getScenarioTextElement().value;
	}
	,getScenarioTextElement: function() {
		return window.document.getElementById(model_CCAR.SCENARIO_TEXT);
	}
	,getSaveScenarioElement: function() {
		return window.document.getElementById(model_CCAR.SAVE_SCENARIO);
	}
	,setupStreams: function() {
		var saveStream = MBooks_$im.getSingleton().initializeElementStream(this.getSaveScenarioElement(),"click");
		saveStream.then($bind(this,this.sendPT));
	}
	,copyIncomingValues: function(aMessage) {
		this.scenarioName = aMessage.ccarData.scenarioName;
		this.scenarioText = aMessage.ccarData.scenarioText;
		this.creator = aMessage.ccarData.createdBy;
		this.deleted = aMessage.ccarData.deleted;
	}
	,copyValuesFromUI: function() {
		this.scenarioName = this.getScenarioName();
		this.scenarioText = this.getScenarioText();
		this.creator = MBooks_$im.getSingleton().getNickName();
		this.deleted = false;
	}
	,saveScenario: function(ev) {
		console.log("Saving scenario ");
		this.copyValuesFromUI();
		var payload = { nickName : MBooks_$im.getSingleton().getNickName(), uploadedBy : MBooks_$im.getSingleton().getNickName(), commandType : "CCARUpload", ccarOperation : { tag : this.crudType, contents : []}, ccarData : { scenarioName : this.scenarioName, scenarioText : this.scenarioText, creator : MBooks_$im.getSingleton().getNickName(), deleted : false}};
		MBooks_$im.getSingleton().doSendJSON(payload);
	}
	,checkScenarioExists: function(ev) {
		console.log("Checking if scenario exists ");
		if(util_Util.isSignificantWS(ev.keyCode)) {
			this.copyValuesFromUI();
			var payload = { nickName : MBooks_$im.getSingleton().getNickName(), uploadedBy : MBooks_$im.getSingleton().getNickName(), commandType : "CCARUpload", ccarOperation : { tag : "Query", contents : []}, ccarData : { scenarioName : this.scenarioName, scenarioText : this.scenarioText, creator : MBooks_$im.getSingleton().getNickName(), deleted : false}};
			MBooks_$im.getSingleton().doSendJSON(payload);
		}
	}
	,sendPT: function(ev) {
		console.log("Processing event " + Std.string(ev));
		this.sendParsingRequest();
	}
	,sendParsingRequest: function() {
		var payload = { nickName : MBooks_$im.getSingleton().getNickName(), uploadedBy : MBooks_$im.getSingleton().getNickName(), scenarioName : this.getScenarioName(), ccarText : this.getScenarioText(), commandType : "ParsedCCARText"};
		console.log("Sending parsing request " + Std.string(payload));
		MBooks_$im.getSingleton().doSendJSON(payload);
	}
	,processCCARUpload: function(incomingMessage) {
		console.log("Processing ccar upload");
		var ccarStruct = incomingMessage.ccarData;
		var crudType = incomingMessage.ccarOperation.tag;
		this.copyIncomingValues(incomingMessage);
		if(crudType == "Create") {
			console.log("Create successful");
			this.copyIncomingValues(incomingMessage);
			this.sendParsingRequest();
		} else if(crudType == "Update") {
			console.log("Update successful");
			this.copyIncomingValues(incomingMessage);
			this.sendParsingRequest();
		} else if(crudType == "Query") {
			console.log("Read returned " + Std.string(incomingMessage));
			this.copyIncomingValues(incomingMessage);
			if(ccarStruct.ccarResultSet == []) crudType = "Create"; else crudType = "Update";
			this.sendParsingRequest();
		}
	}
	,processParsedCCARText: function(incomingMessage) {
		console.log("Processing parsed text");
		this.setParsedScenario(JSON.stringify(incomingMessage));
	}
	,setParsedScenario: function(incomingM) {
		this.getParsedScenarioElement().value = incomingM;
	}
	,getParsedScenarioElement: function() {
		return window.document.getElementById(model_CCAR.PARSED_SCENARIO);
	}
	,__class__: model_CCAR
};
var model_Command = function(nickName,aCType,payload) {
	this.commandType = aCType;
	this.payload = payload;
};
model_Command.__name__ = ["model","Command"];
model_Command.prototype = {
	__class__: model_Command
};
var model_CommandType = { __ename__ : true, __constructs__ : ["Login","SendMessage","ManageUser","CreateUserTerms","UpdateUserTerms","QueryUserTerms","DeleteUserTerms","CreateUserPreferences","UpdateUserPreferences","QueryUserPreferences","DeleteUserPreferences","CCARUpload","ParsedCCARText","Undefined","UserJoined","UserLeft","UserLoggedIn","UserBanned","ManageCompany","KeepAlive","SelectAllCompanies","SelectActiveProjects","ManageProject","QuerySupportedScripts","QueryActiveWorkbenches","ManageWorkbench","ExecuteWorkbench","AssignCompany","PortfolioSymbolTypesQuery","PortfolioSymbolSidesQuery","QueryPortfolios","ManagePortfolio","ManagePortfolioSymbol","MarketDataUpdate","QueryPortfolioSymbol","ManageEntitlements","QueryEntitlements","QueryCompanyUsers","OptionAnalytics","QueryMarketData","HistoricalStressValueCommand"] };
model_CommandType.Login = ["Login",0];
model_CommandType.Login.toString = $estr;
model_CommandType.Login.__enum__ = model_CommandType;
model_CommandType.SendMessage = ["SendMessage",1];
model_CommandType.SendMessage.toString = $estr;
model_CommandType.SendMessage.__enum__ = model_CommandType;
model_CommandType.ManageUser = ["ManageUser",2];
model_CommandType.ManageUser.toString = $estr;
model_CommandType.ManageUser.__enum__ = model_CommandType;
model_CommandType.CreateUserTerms = ["CreateUserTerms",3];
model_CommandType.CreateUserTerms.toString = $estr;
model_CommandType.CreateUserTerms.__enum__ = model_CommandType;
model_CommandType.UpdateUserTerms = ["UpdateUserTerms",4];
model_CommandType.UpdateUserTerms.toString = $estr;
model_CommandType.UpdateUserTerms.__enum__ = model_CommandType;
model_CommandType.QueryUserTerms = ["QueryUserTerms",5];
model_CommandType.QueryUserTerms.toString = $estr;
model_CommandType.QueryUserTerms.__enum__ = model_CommandType;
model_CommandType.DeleteUserTerms = ["DeleteUserTerms",6];
model_CommandType.DeleteUserTerms.toString = $estr;
model_CommandType.DeleteUserTerms.__enum__ = model_CommandType;
model_CommandType.CreateUserPreferences = ["CreateUserPreferences",7];
model_CommandType.CreateUserPreferences.toString = $estr;
model_CommandType.CreateUserPreferences.__enum__ = model_CommandType;
model_CommandType.UpdateUserPreferences = ["UpdateUserPreferences",8];
model_CommandType.UpdateUserPreferences.toString = $estr;
model_CommandType.UpdateUserPreferences.__enum__ = model_CommandType;
model_CommandType.QueryUserPreferences = ["QueryUserPreferences",9];
model_CommandType.QueryUserPreferences.toString = $estr;
model_CommandType.QueryUserPreferences.__enum__ = model_CommandType;
model_CommandType.DeleteUserPreferences = ["DeleteUserPreferences",10];
model_CommandType.DeleteUserPreferences.toString = $estr;
model_CommandType.DeleteUserPreferences.__enum__ = model_CommandType;
model_CommandType.CCARUpload = ["CCARUpload",11];
model_CommandType.CCARUpload.toString = $estr;
model_CommandType.CCARUpload.__enum__ = model_CommandType;
model_CommandType.ParsedCCARText = ["ParsedCCARText",12];
model_CommandType.ParsedCCARText.toString = $estr;
model_CommandType.ParsedCCARText.__enum__ = model_CommandType;
model_CommandType.Undefined = ["Undefined",13];
model_CommandType.Undefined.toString = $estr;
model_CommandType.Undefined.__enum__ = model_CommandType;
model_CommandType.UserJoined = ["UserJoined",14];
model_CommandType.UserJoined.toString = $estr;
model_CommandType.UserJoined.__enum__ = model_CommandType;
model_CommandType.UserLeft = ["UserLeft",15];
model_CommandType.UserLeft.toString = $estr;
model_CommandType.UserLeft.__enum__ = model_CommandType;
model_CommandType.UserLoggedIn = ["UserLoggedIn",16];
model_CommandType.UserLoggedIn.toString = $estr;
model_CommandType.UserLoggedIn.__enum__ = model_CommandType;
model_CommandType.UserBanned = ["UserBanned",17];
model_CommandType.UserBanned.toString = $estr;
model_CommandType.UserBanned.__enum__ = model_CommandType;
model_CommandType.ManageCompany = ["ManageCompany",18];
model_CommandType.ManageCompany.toString = $estr;
model_CommandType.ManageCompany.__enum__ = model_CommandType;
model_CommandType.KeepAlive = ["KeepAlive",19];
model_CommandType.KeepAlive.toString = $estr;
model_CommandType.KeepAlive.__enum__ = model_CommandType;
model_CommandType.SelectAllCompanies = ["SelectAllCompanies",20];
model_CommandType.SelectAllCompanies.toString = $estr;
model_CommandType.SelectAllCompanies.__enum__ = model_CommandType;
model_CommandType.SelectActiveProjects = ["SelectActiveProjects",21];
model_CommandType.SelectActiveProjects.toString = $estr;
model_CommandType.SelectActiveProjects.__enum__ = model_CommandType;
model_CommandType.ManageProject = ["ManageProject",22];
model_CommandType.ManageProject.toString = $estr;
model_CommandType.ManageProject.__enum__ = model_CommandType;
model_CommandType.QuerySupportedScripts = ["QuerySupportedScripts",23];
model_CommandType.QuerySupportedScripts.toString = $estr;
model_CommandType.QuerySupportedScripts.__enum__ = model_CommandType;
model_CommandType.QueryActiveWorkbenches = ["QueryActiveWorkbenches",24];
model_CommandType.QueryActiveWorkbenches.toString = $estr;
model_CommandType.QueryActiveWorkbenches.__enum__ = model_CommandType;
model_CommandType.ManageWorkbench = ["ManageWorkbench",25];
model_CommandType.ManageWorkbench.toString = $estr;
model_CommandType.ManageWorkbench.__enum__ = model_CommandType;
model_CommandType.ExecuteWorkbench = ["ExecuteWorkbench",26];
model_CommandType.ExecuteWorkbench.toString = $estr;
model_CommandType.ExecuteWorkbench.__enum__ = model_CommandType;
model_CommandType.AssignCompany = ["AssignCompany",27];
model_CommandType.AssignCompany.toString = $estr;
model_CommandType.AssignCompany.__enum__ = model_CommandType;
model_CommandType.PortfolioSymbolTypesQuery = ["PortfolioSymbolTypesQuery",28];
model_CommandType.PortfolioSymbolTypesQuery.toString = $estr;
model_CommandType.PortfolioSymbolTypesQuery.__enum__ = model_CommandType;
model_CommandType.PortfolioSymbolSidesQuery = ["PortfolioSymbolSidesQuery",29];
model_CommandType.PortfolioSymbolSidesQuery.toString = $estr;
model_CommandType.PortfolioSymbolSidesQuery.__enum__ = model_CommandType;
model_CommandType.QueryPortfolios = ["QueryPortfolios",30];
model_CommandType.QueryPortfolios.toString = $estr;
model_CommandType.QueryPortfolios.__enum__ = model_CommandType;
model_CommandType.ManagePortfolio = ["ManagePortfolio",31];
model_CommandType.ManagePortfolio.toString = $estr;
model_CommandType.ManagePortfolio.__enum__ = model_CommandType;
model_CommandType.ManagePortfolioSymbol = ["ManagePortfolioSymbol",32];
model_CommandType.ManagePortfolioSymbol.toString = $estr;
model_CommandType.ManagePortfolioSymbol.__enum__ = model_CommandType;
model_CommandType.MarketDataUpdate = ["MarketDataUpdate",33];
model_CommandType.MarketDataUpdate.toString = $estr;
model_CommandType.MarketDataUpdate.__enum__ = model_CommandType;
model_CommandType.QueryPortfolioSymbol = ["QueryPortfolioSymbol",34];
model_CommandType.QueryPortfolioSymbol.toString = $estr;
model_CommandType.QueryPortfolioSymbol.__enum__ = model_CommandType;
model_CommandType.ManageEntitlements = ["ManageEntitlements",35];
model_CommandType.ManageEntitlements.toString = $estr;
model_CommandType.ManageEntitlements.__enum__ = model_CommandType;
model_CommandType.QueryEntitlements = ["QueryEntitlements",36];
model_CommandType.QueryEntitlements.toString = $estr;
model_CommandType.QueryEntitlements.__enum__ = model_CommandType;
model_CommandType.QueryCompanyUsers = ["QueryCompanyUsers",37];
model_CommandType.QueryCompanyUsers.toString = $estr;
model_CommandType.QueryCompanyUsers.__enum__ = model_CommandType;
model_CommandType.OptionAnalytics = ["OptionAnalytics",38];
model_CommandType.OptionAnalytics.toString = $estr;
model_CommandType.OptionAnalytics.__enum__ = model_CommandType;
model_CommandType.QueryMarketData = ["QueryMarketData",39];
model_CommandType.QueryMarketData.toString = $estr;
model_CommandType.QueryMarketData.__enum__ = model_CommandType;
model_CommandType.HistoricalStressValueCommand = ["HistoricalStressValueCommand",40];
model_CommandType.HistoricalStressValueCommand.toString = $estr;
model_CommandType.HistoricalStressValueCommand.__enum__ = model_CommandType;
var model_Company = function(n,cId,gM,ima) {
	this.name = n;
	this.companyId = cId;
	this.generalMailbox = gM;
	this.image = ima;
};
model_Company.__name__ = ["model","Company"];
model_Company.prototype = {
	__class__: model_Company
};
var model_CompanyEntitlement = function(stream) {
	util_Util.log("Creating new entitlement");
	stream.then($bind(this,this.updateModel));
};
model_CompanyEntitlement.__name__ = ["model","CompanyEntitlement"];
model_CompanyEntitlement.addUserEntitlement = function(userNickName,entitlementId) {
	console.log("Adding user entitlement for " + userNickName + " -> " + entitlementId);
};
model_CompanyEntitlement.prototype = {
	updateModel: function(anEntitlement) {
		console.log("Updating model " + Std.string(anEntitlement));
		MBooks_$im.getSingleton().doSendJSON(anEntitlement);
	}
	,queryAllEntitlements: function() {
		console.log("Query all the entitlements");
		var queryEntitlements = { nickName : MBooks_$im.getSingleton().getNickName(), queryParameters : "*", commandType : "QueryCompanyEntitlements", resultSet : []};
		MBooks_$im.getSingleton().doSendJSON(queryEntitlements);
	}
	,__class__: model_CompanyEntitlement
};
var model_Contact = function(aName,lName,aLogin) {
	this.firstName = aName;
	this.lastName = lName;
	this.login = aLogin;
};
model_Contact.__name__ = ["model","Contact"];
model_Contact.prototype = {
	__class__: model_Contact
};
var model_Entitlement = function(stream) {
	util_Util.log("Creating new entitlement");
	stream.then($bind(this,this.updateModel));
};
model_Entitlement.__name__ = ["model","Entitlement"];
model_Entitlement.listDisplay = function(entT) {
	return entT.tabName + "->" + entT.sectionName;
};
model_Entitlement.optionId = function(entT) {
	return entT.tabName + entT.sectionName;
};
model_Entitlement.prototype = {
	updateModel: function(anEntitlement) {
		console.log("Updating model " + Std.string(anEntitlement));
		MBooks_$im.getSingleton().doSendJSON(anEntitlement);
	}
	,queryAllEntitlements: function() {
		console.log("Query all the entitlements");
		var queryEntitlements = { nickName : MBooks_$im.getSingleton().getNickName(), queryParameters : "*", commandType : "QueryEntitlements", resultSet : []};
		MBooks_$im.getSingleton().doSendJSON(queryEntitlements);
	}
	,__class__: model_Entitlement
};
var model_HistoricalStressValue = function(creator,portfolioId,portfolioSymbol,date,commandType,nickName,portfolioValue) {
	this.creator = creator;
	this.portfolioId = portfolioId;
	this.portfolioSymbol = portfolioSymbol;
	this.date = date;
	this.commandType = commandType;
	this.nickName = nickName;
	this.portfolioValue = parseFloat(portfolioValue);
};
model_HistoricalStressValue.__name__ = ["model","HistoricalStressValue"];
model_HistoricalStressValue.getStressValue = function(incomingMessage) {
	if(incomingMessage == null) console.log("Invalid message. Returning");
	if(incomingMessage.portfolioSymbol != null) {
		var portfolioS = incomingMessage.portfolioSymbol;
		var cType = Type.createEnum(model_CommandType,incomingMessage.commandType);
		var creator = incomingMessage.nickName;
		var date = incomingMessage.date;
		var n = incomingMessage.nickName;
		return new model_HistoricalStressValue(creator,portfolioS.portfolioId,portfolioS.symbol,date,cType,n,incomingMessage.portfolioValue);
	} else return null;
};
model_HistoricalStressValue.prototype = {
	__class__: model_HistoricalStressValue
};
var model_Login = function(commandType,p,s) {
	this.commandType = commandType;
	this.login = p;
	this.nickName = p.nickName;
	this.loginStatus = Std.string(s);
};
model_Login.__name__ = ["model","Login"];
model_Login.createLoginResponse = function(incomingMessage,person) {
	if(incomingMessage.Right == null) throw new js__$Boot_HaxeError("Invalid login " + Std.string(incomingMessage));
	var commandType = "" + Std.string(MBooks_$im.getSingleton().parseCommandType(incomingMessage));
	var loginStatus = Type.createEnum(model_LoginStatus,incomingMessage.Right.loginStatus);
	var result = new model_Login(commandType,person,loginStatus);
	return result;
};
model_Login.prototype = {
	__class__: model_Login
};
var model_LoginStatus = { __ename__ : true, __constructs__ : ["UserExists","UserNotFound","InvalidPassword","Undefined","Guest"] };
model_LoginStatus.UserExists = ["UserExists",0];
model_LoginStatus.UserExists.toString = $estr;
model_LoginStatus.UserExists.__enum__ = model_LoginStatus;
model_LoginStatus.UserNotFound = ["UserNotFound",1];
model_LoginStatus.UserNotFound.toString = $estr;
model_LoginStatus.UserNotFound.__enum__ = model_LoginStatus;
model_LoginStatus.InvalidPassword = ["InvalidPassword",2];
model_LoginStatus.InvalidPassword.toString = $estr;
model_LoginStatus.InvalidPassword.__enum__ = model_LoginStatus;
model_LoginStatus.Undefined = ["Undefined",3];
model_LoginStatus.Undefined.toString = $estr;
model_LoginStatus.Undefined.__enum__ = model_LoginStatus;
model_LoginStatus.Guest = ["Guest",4];
model_LoginStatus.Guest.toString = $estr;
model_LoginStatus.Guest.__enum__ = model_LoginStatus;
var model_Person = function(fName,lName,nName,pwd) {
	this.firstName = fName;
	this.lastName = lName;
	this.nickName = nName;
	this.password = pwd;
	this.lastLoginTime = new Date();
	this.deleted = false;
};
model_Person.__name__ = ["model","Person"];
model_Person.listDisplay = function(person) {
	return person.firstName + " " + person.lastName;
};
model_Person.optionId = function(person) {
	return person.nickName;
};
model_Person.prototype = {
	setNickName: function(n) {
		this.nickName = n;
	}
	,setFirstName: function(n) {
		this.firstName = n;
	}
	,setLastName: function(n) {
		this.lastName = n;
	}
	,setPassword: function(n) {
		this.password = n;
	}
	,__class__: model_Person
};
var model_Portfolio = function(crudType,portfolioId,companyId,userId,summary,createdBy,updatedBy) {
	this.portfolioT = { crudType : crudType, commandType : "ManagePortfolio", portfolioId : portfolioId, companyId : companyId, userId : userId, summary : summary, createdBy : createdBy, updatedBy : updatedBy, nickName : MBooks_$im.getSingleton().getNickName()};
};
model_Portfolio.__name__ = ["model","Portfolio"];
model_Portfolio.prototype = {
	save: function(portfolio) {
		console.log("Saving portfolio");
	}
	,__class__: model_Portfolio
};
var model_PortfolioSymbol = function() {
	console.log("Creating portfolio symbol");
	this.sidesStream = new promhx_Deferred();
	this.typesStream = new promhx_Deferred();
	this.typeStream = new promhx_Deferred();
	this.sideStream = new promhx_Deferred();
	this.insertStream = new promhx_Deferred();
	this.updateStream = new promhx_Deferred();
	this.deleteStream = new promhx_Deferred();
	this.readStream = new promhx_Deferred();
	this.sendPortfolioSymbolSideQuery();
	this.sendPortfolioSymbolTypeQuery();
	this.sidesStream.then($bind(this,this.handleSymbolSideQuery));
	this.typesStream.then($bind(this,this.handleSymbolTypeQuery));
	this.insertStream.then($bind(this,this.sendPayload));
	this.updateStream.then($bind(this,this.sendPayload));
	this.deleteStream.then($bind(this,this.sendPayload));
	this.readStream.then($bind(this,this.sendPayload));
	MBooks_$im.getSingleton().portfolio.activePortfolioStream.then($bind(this,this.processActivePortfolio));
};
model_PortfolioSymbol.__name__ = ["model","PortfolioSymbol"];
model_PortfolioSymbol.prototype = {
	processActivePortfolio: function(a) {
		if(a == null) throw new js__$Boot_HaxeError("Active portfolio not defined " + Std.string(a));
		console.log("Process active portfolio " + Std.string(a));
		this.activePortfolio = a;
		this.sendPortfolioSymbolQuery();
	}
	,sendActivePortfolioCommand: function(a) {
		a.commandType = "";
		var payload = { 'commandType' : "ActivePortfolio", 'portfolio' : a, 'nickName' : MBooks_$im.getSingleton().getNickName()};
		MBooks_$im.getSingleton().doSendJSON(payload);
	}
	,sendPortfolioSymbolQuery: function() {
		if(this.activePortfolio == null) throw new js__$Boot_HaxeError("No active portfolio selected. Not fetching symbols");
		var payload = { commandType : "QueryPortfolioSymbol", portfolioId : this.activePortfolio.portfolioId, nickName : MBooks_$im.getSingleton().getNickName(), resultSet : []};
		MBooks_$im.getSingleton().doSendJSON(payload);
	}
	,sendPayload: function(payload) {
		console.log("Processing sending payload " + Std.string(payload));
		MBooks_$im.getSingleton().doSendJSON(payload);
	}
	,sendPortfolioSymbolSideQuery: function() {
		var payload = { nickName : MBooks_$im.getSingleton().getNickName(), commandType : "PortfolioSymbolSidesQuery", symbolSides : []};
		MBooks_$im.getSingleton().doSendJSON(payload);
	}
	,sendPortfolioSymbolTypeQuery: function() {
		var payload = { nickName : MBooks_$im.getSingleton().getNickName(), commandType : "PortfolioSymbolTypesQuery", symbolTypes : []};
		MBooks_$im.getSingleton().doSendJSON(payload);
	}
	,handleSymbolSideQuery: function(incomingMessage) {
		console.log("Handle portfolio symbol side query" + Std.string(incomingMessage));
		var resultSet = incomingMessage.symbolSides;
		var _g = 0;
		while(_g < resultSet.length) {
			var optionSymbolSide = resultSet[_g];
			++_g;
			var payload = { symbolSide : optionSymbolSide};
			this.sideStream.resolve(payload);
		}
	}
	,handleSymbolTypeQuery: function(incomingMessage) {
		console.log("Handle portfolio symbol type query " + Std.string(incomingMessage));
		var resultSet = incomingMessage.symbolTypes;
		var _g = 0;
		while(_g < resultSet.length) {
			var optionSymbolType = resultSet[_g];
			++_g;
			console.log("Resolving " + Std.string(optionSymbolType));
			var p = { symbolType : optionSymbolType};
			this.typeStream.resolve(p);
		}
	}
	,__class__: model_PortfolioSymbol
};
var model_Project = function(companyI) {
	try {
		console.log("Instantiating Project");
		this.newProject = true;
		var stream = MBooks_$im.getSingleton().initializeElementStream(this.getSaveProject(),"click");
		stream.then($bind(this,this.saveProject));
		this.company = companyI;
		this.company.getSelectListEventStream().then($bind(this,this.processCompanyList));
		this.projectStream = new promhx_Deferred();
		this.projectStream.then($bind(this,this.processProjectList));
		var companySelectStream = MBooks_$im.getSingleton().initializeElementStream(this.getCompanyListElement(),"change");
		companySelectStream.then($bind(this,this.processCompanySelected));
		var projectSelectedStream = MBooks_$im.getSingleton().initializeElementStream(this.getProjectsListElement(),"change");
		projectSelectedStream.then($bind(this,this.processProjectSelected));
	} catch( err ) {
		haxe_CallStack.lastException = err;
		if (err instanceof js__$Boot_HaxeError) err = err.val;
		console.log("Error creating project " + Std.string(err));
	}
};
model_Project.__name__ = ["model","Project"];
model_Project.prototype = {
	getSupportedScriptsStream: function() {
		if(this.activeProjectWorkbench == null) throw new js__$Boot_HaxeError("No active project workbench found"); else return this.activeProjectWorkbench.supportedScriptsStream;
	}
	,getSelectActiveProjectsStream: function() {
		return this.projectStream;
	}
	,getSaveProject: function() {
		var buttonElement = window.document.getElementById(model_Project.SAVE_PROJECT);
		return buttonElement;
	}
	,saveProject: function(ev) {
		try {
			console.log("Saving project");
			var nickName = MBooks_$im.getSingleton().getNickName();
			var payload = this.getPayloadD(nickName,this.getCrudType());
			MBooks_$im.getSingleton().doSendJSON(payload);
		} catch( err ) {
			haxe_CallStack.lastException = err;
			if (err instanceof js__$Boot_HaxeError) err = err.val;
			console.log("Error checking company " + Std.string(err));
		}
	}
	,getProjectsListElement: function() {
		return window.document.getElementById(model_Project.PROJECT_LIST);
	}
	,processProjectList: function(incomingMessage) {
		console.log("Project list " + Std.string(incomingMessage));
		var projects = incomingMessage.projects;
		var projectList = this.getProjectsListElement();
		var pArray = projects;
		var _g = 0;
		while(_g < pArray.length) {
			var project = pArray[_g];
			++_g;
			var projectId = project.identification;
			console.log("Adding project id " + projectId);
			var projectSummary = project.summary;
			var optionElement = window.document.getElementById(projectId);
			if(optionElement == null) {
				optionElement = (function($this) {
					var $r;
					var _this = window.document;
					$r = _this.createElement("option");
					return $r;
				}(this));
				optionElement.id = projectId;
				optionElement.text = projectSummary;
				projectList.appendChild(optionElement);
			}
		}
	}
	,getCompanyListElement: function() {
		return window.document.getElementById(model_Project.COMPANY_LIST);
	}
	,processProjectSelected: function(ev) {
		console.log("Project selected " + Std.string(ev.target));
		var selectionElement = ev.target;
		var _g = 0;
		var _g1 = selectionElement.selectedOptions;
		while(_g < _g1.length) {
			var a = _g1[_g];
			++_g;
			var selectionId = a;
			this.sendReadRequest(selectionId.id);
		}
	}
	,processCompanySelected: function(ev) {
		console.log("Company selected" + " " + Std.string(ev.target) + " " + Std.string(ev));
		var companyList = ev.target;
		var _g = 0;
		var _g1 = companyList.selectedOptions;
		while(_g < _g1.length) {
			var cList = _g1[_g];
			++_g;
			var cOption = cList;
			console.log("Reading company information for " + cOption.id);
			this.company.read(cOption.id);
			this.getProjectList(cOption.id);
			MBooks_$im.getSingleton().selectedCompanyStream.resolve(cOption.id);
		}
	}
	,processCompanyList: function(incomingMessage) {
		console.log("Processing company list " + Std.string(incomingMessage));
		var companies = incomingMessage.company;
		var companiesSelectElement = this.getCompanyListElement();
		var cArray = incomingMessage.company;
		var _g = 0;
		while(_g < cArray.length) {
			var company = cArray[_g];
			++_g;
			var companyID = company.companyID;
			var companyName = company.companyName;
			console.log("Company " + companyID + " -> " + companyName);
			var optionElement = window.document.getElementById(companyID);
			if(optionElement == null) {
				optionElement = (function($this) {
					var $r;
					var _this = window.document;
					$r = _this.createElement("option");
					return $r;
				}(this));
				optionElement.id = companyID;
				optionElement.text = companyName;
				companiesSelectElement.appendChild(optionElement);
			} else console.log("Element exists " + companyID);
		}
		console.log("Completed processing companies");
	}
	,getProjectID: function() {
		if(this.getProjectIDElement().value != "") return this.getProjectIDElement().value; else return "";
	}
	,getProjectIDElement: function() {
		return window.document.getElementById(model_Project.PROJECT_IDENTIFICATION);
	}
	,setProjectID: function(pid) {
		this.getProjectIDElement().value = pid;
	}
	,getProjectStart: function() {
		return this.getProjectStartElement().value;
	}
	,getProjectStartElement: function() {
		return window.document.getElementById(model_Project.PROJECT_START);
	}
	,setProjectStart: function(sDate) {
		this.getProjectStartElement().value = sDate;
	}
	,getProjectEnd: function() {
		return this.getProjectEndElement().value;
	}
	,getProjectEndElement: function() {
		return window.document.getElementById(model_Project.PROJECT_END);
	}
	,setProjectEnd: function(eDate) {
		this.getProjectEndElement().value = eDate;
	}
	,getPreparedBy: function() {
		return this.getPreparedByElement().value;
	}
	,getPreparedByElement: function() {
		return window.document.getElementById(model_Project.PREPARED_BY);
	}
	,setPreparedBy: function(aName) {
		this.getPreparedByElement().value = aName;
	}
	,getProjectSummary: function() {
		return this.getProjectSummaryElement().value;
	}
	,getProjectSummaryElement: function() {
		return window.document.getElementById(model_Project.PROJECT_SUMMARY);
	}
	,setProjectSummary: function(summary) {
		this.getProjectSummaryElement().value = summary;
	}
	,getProjectDetails: function() {
		return this.getProjectDetailsElement().value;
	}
	,getProjectDetailsElement: function() {
		return window.document.getElementById(model_Project.PROJECT_DETAILS);
	}
	,setProjectDetails: function(details) {
		this.getProjectDetailsElement().value = details;
	}
	,getProjectList: function(companyId) {
		console.log("Processing select all projects " + companyId);
		var payload = { nickName : MBooks_$im.getSingleton().getNickName(), commandType : "SelectActiveProjects", companyId : companyId};
		MBooks_$im.getSingleton().doSendJSON(payload);
	}
	,processManageProject: function(incomingMessage) {
		console.log("Process manage Projects  ");
		try {
			var crudType = incomingMessage.Right.crudType;
			if(crudType == model_Project.CREATE) {
				console.log("Create successful");
				this.copyIncomingValues(incomingMessage);
			} else if(crudType == model_Project.READ) {
				if(incomingMessage.Right.projectId == "") this.newProject = true; else {
					this.copyIncomingValues(incomingMessage);
					this.newProject = false;
					var projectWorkbench = new model_ProjectWorkbench(this);
					this.activeProjectWorkbench = projectWorkbench;
				}
			} else if(crudType == model_Project.UPDATE) this.copyIncomingValues(incomingMessage); else if(crudType == model_Project.DELETE) this.clearFields(incomingMessage); else throw new js__$Boot_HaxeError("Invalid crudtype " + crudType);
		} catch( err ) {
			haxe_CallStack.lastException = err;
			if (err instanceof js__$Boot_HaxeError) err = err.val;
			throw new js__$Boot_HaxeError(err);
		}
	}
	,copyIncomingValues: function(wMessage) {
		try {
			var aMessage = wMessage.Right;
			this.projectID = aMessage.projectId;
			this.setProjectID(aMessage.projectId);
			this.setProjectSummary(aMessage.summary);
			this.setProjectDetails(aMessage.details);
			this.setProjectStart(aMessage.startDate);
			this.setProjectEnd(aMessage.endDate);
		} catch( err ) {
			haxe_CallStack.lastException = err;
			if (err instanceof js__$Boot_HaxeError) err = err.val;
			console.log("Error copying values " + Std.string(wMessage));
		}
	}
	,clearFields: function(aMessage) {
		try {
			this.setProjectID("");
			this.setProjectSummary("");
			this.setProjectDetails("");
			this.setProjectStart("");
			this.setProjectEnd("");
		} catch( err ) {
			haxe_CallStack.lastException = err;
			if (err instanceof js__$Boot_HaxeError) err = err.val;
			console.log("Error clearing fields " + Std.string(err));
		}
	}
	,sendReadRequest: function(projectID) {
		try {
			var nickName = MBooks_$im.getSingleton().getNickName();
			var payload = this.getPayload(nickName,"Read",projectID);
			MBooks_$im.getSingleton().doSendJSON(payload);
		} catch( err ) {
			haxe_CallStack.lastException = err;
			if (err instanceof js__$Boot_HaxeError) err = err.val;
			console.log("Error checking company " + Std.string(err));
		}
	}
	,getCrudType: function() {
		if(this.getProjectID() == "") return model_Project.CREATE; else return model_Project.UPDATE;
	}
	,getPayload: function(nickName,crudType,projectId) {
		var payload = { nickName : nickName, commandType : model_Project.MANAGE_PROJECT, crudType : crudType, projectId : projectId, uniqueCompanyID : this.company.getCompanyID(), summary : this.getProjectSummary(), details : this.getProjectDetails(), startDate : [new Date()], endDate : [new Date()], uploadTime : [new Date()], preparedBy : this.getPreparedBy(), uploadedBy : nickName};
		return payload;
	}
	,getPayloadD: function(nickName,crudType) {
		return this.getPayload(nickName,crudType,this.getProjectID());
	}
	,__class__: model_Project
};
var model_WorkbenchCrudType = { __ename__ : true, __constructs__ : ["Create","WrkBench_Update","Delete","Read"] };
model_WorkbenchCrudType.Create = ["Create",0];
model_WorkbenchCrudType.Create.toString = $estr;
model_WorkbenchCrudType.Create.__enum__ = model_WorkbenchCrudType;
model_WorkbenchCrudType.WrkBench_Update = ["WrkBench_Update",1];
model_WorkbenchCrudType.WrkBench_Update.toString = $estr;
model_WorkbenchCrudType.WrkBench_Update.__enum__ = model_WorkbenchCrudType;
model_WorkbenchCrudType.Delete = ["Delete",2];
model_WorkbenchCrudType.Delete.toString = $estr;
model_WorkbenchCrudType.Delete.__enum__ = model_WorkbenchCrudType;
model_WorkbenchCrudType.Read = ["Read",3];
model_WorkbenchCrudType.Read.toString = $estr;
model_WorkbenchCrudType.Read.__enum__ = model_WorkbenchCrudType;
var model_ProjectWorkbench = function(project) {
	this.MANAGE_WORKBENCH = "ManageWorkbench";
	this.QUERY_ACTIVE_WORKBENCHES = "QueryActiveWorkbenches";
	this.SUPPORTED_SCRIPT_TYPES = "QuerySupportedScripts";
	this.SCRIPT_META_TAGS = "scriptMetaTags";
	this.SCRIPT_DATA_PATH = "scriptDataPath";
	this.SCRIPT_SUMMARY = "scriptSummary";
	this.NUMBER_OF_CORES = "numberOfCores";
	this.SCRIPT_UPLOAD_ELEMENT = "uploadScript";
	this.SCRIPT_DATA_ELEMENT = "scriptData";
	this.WORKBENCH_ID_ELEMENT = "workbenchId";
	this.SUPPORTED_SCRIPT_LIST_ELEMENT = "supportedScriptTypes";
	this.PROJECT_DETAILS = "project-details";
	this.DEFAULT_PROCESSORS = 4;
	this.SCRIPT_RESULT = "scriptResult";
	this.CLEAR_FIELDS = "clearFields";
	this.EXECUTE_WORKBENCH = "executeScript";
	this.DELETE_WORKBENCH = "deleteWorkbench";
	this.CREATE_WORKBENCH = "insertWorkbench";
	this.UPDATE_WORKBENCH = "updateWorkbench";
	this.PROJECT_WORKBENCH_LIST = "projectWorkbenches";
	this.CHOOSE_SUPPORTED_SCRIPT = "chooseSupportedScriptType";
	this.CHOOSE_WORKBENCH = "chooseWorkbench";
	console.log("Instantiating project workbench ");
	this.executeUponSave = true;
	var stream = MBooks_$im.getSingleton().initializeElementStream(this.getUpdateWorkbench(),"click");
	stream.then($bind(this,this.updateWorkbench));
	var createStream = MBooks_$im.getSingleton().initializeElementStream(this.getCreateWorkbench(),"click");
	createStream.then($bind(this,this.createWorkbench));
	var deleteStream = MBooks_$im.getSingleton().initializeElementStream(this.getDeleteWorkbench(),"click");
	deleteStream.then($bind(this,this.deleteWorkbench));
	var clearFieldsStream = MBooks_$im.getSingleton().initializeElementStream(this.getClearFields(),"click");
	clearFieldsStream.then($bind(this,this.clearFields));
	var executeWorkbenchButtonStream = MBooks_$im.getSingleton().initializeElementStream(this.getExecuteWorkbench(),"click");
	executeWorkbenchButtonStream.then($bind(this,this.executeWorkbench));
	var supportedScriptListStream = MBooks_$im.getSingleton().initializeElementStream(this.getSupportedScriptsListElement(),"change");
	supportedScriptListStream.then($bind(this,this.processScriptTypeSelected));
	var optionSelectedStream = MBooks_$im.getSingleton().initializeElementStream(this.getProjectWorkbenchListElement(),"change");
	optionSelectedStream.then($bind(this,this.processWorkbenchSelected));
	this.selectedProject = project;
	this.selectedScriptType = "UnsupportedScriptType";
	this.supportedScriptsStream = new promhx_Deferred();
	this.supportedScriptsStream.then($bind(this,this.processSupportedScripts));
	this.queryActiveWorkbenchesStream = new promhx_Deferred();
	this.manageWorkbenchStream = new promhx_Deferred();
	this.queryActiveWorkbenchesStream.then($bind(this,this.processQueryActiveWorkbenches));
	this.querySupportedScripts();
	this.manageWorkbenchStream.then($bind(this,this.processManageWorkbench));
	this.executeWorkbenchStream = new promhx_Deferred();
	this.executeWorkbenchStream.then($bind(this,this.processExecuteWorkbench));
};
model_ProjectWorkbench.__name__ = ["model","ProjectWorkbench"];
model_ProjectWorkbench.getDynamic = function(name) {
	return __js__(name);
};
model_ProjectWorkbench.prototype = {
	getSupportedScriptsListElement: function() {
		return window.document.getElementById(this.SUPPORTED_SCRIPT_LIST_ELEMENT);
	}
	,createWorkbench: function(ev) {
		console.log("Creating workbench");
		this.clearWorkbenchId();
		var file = this.getScriptUploadElement().files[0];
		var reader = new FileReader();
		var stream = MBooks_$im.getSingleton().initializeElementStream(reader,"load");
		stream.then($bind(this,this.uploadScript));
		reader.readAsText(file);
	}
	,deleteWorkbench: function(ev) {
		console.log("Deleting workbench");
		try {
			var crudType = model_WorkbenchCrudType.Delete;
			this.scriptData = "";
			var payload = this.getPayloadFromUI(crudType,this.scriptData);
			console.log("Saving workbench model " + JSON.stringify(payload));
			MBooks_$im.getSingleton().doSendJSON(payload);
		} catch( err ) {
			haxe_CallStack.lastException = err;
			if (err instanceof js__$Boot_HaxeError) err = err.val;
			console.log("Error saving workbench " + Std.string(err));
		}
	}
	,updateWorkbench: function(ev) {
		console.log("Update workbench ");
		var file = this.getScriptUploadElement().files[0];
		var reader = new FileReader();
		var stream = MBooks_$im.getSingleton().initializeElementStream(reader,"load");
		stream.then($bind(this,this.uploadScript));
		reader.readAsText(file);
	}
	,read: function(anId) {
		try {
			var payload = this.getPayloadFromUI(model_WorkbenchCrudType.Read,"");
			payload.workbenchId = anId;
			console.log("Reading workbench");
			MBooks_$im.getSingleton().doSendJSON(payload);
		} catch( err ) {
			haxe_CallStack.lastException = err;
			if (err instanceof js__$Boot_HaxeError) err = err.val;
			console.log("Error " + Std.string(err));
		}
	}
	,saveWorkbenchModel: function(scriptData) {
		try {
			var crudType = this.getCrudType();
			var payload = this.getPayloadFromUI(crudType,scriptData);
			console.log("Saving workbench model " + JSON.stringify(payload));
			MBooks_$im.getSingleton().doSendJSON(payload);
		} catch( err ) {
			haxe_CallStack.lastException = err;
			if (err instanceof js__$Boot_HaxeError) err = err.val;
			console.log("Error saving workbench " + Std.string(err));
		}
	}
	,callExecuteWorkbench: function() {
		try {
			console.log("Execute the workbench");
			var payload = { executeWorkbenchCommandType : "ExecuteWorkbench", executeWorkbenchId : this.getWorkbenchIdFromUI(), scriptResult : "", nickName : MBooks_$im.getSingleton().getNickName(), commandType : "ExecuteWorkbench"};
			MBooks_$im.getSingleton().doSendJSON(payload);
		} catch( err ) {
			haxe_CallStack.lastException = err;
			if (err instanceof js__$Boot_HaxeError) err = err.val;
			console.log("Error saving workbench " + Std.string(err));
		}
	}
	,executeWorkbench: function(ev) {
		this.callExecuteWorkbench();
	}
	,getCrudType: function() {
		if(this.getWorkbenchIdFromUI() == null || this.getWorkbenchIdFromUI() == "") return model_WorkbenchCrudType.Create; else return model_WorkbenchCrudType.WrkBench_Update;
	}
	,uploadScript: function(ev) {
		console.log("Uploading script " + Std.string(ev));
		var reader = ev.target;
		this.saveWorkbenchModel(reader.result);
	}
	,getProjectWorkbenchListElement: function() {
		return window.document.getElementById(this.PROJECT_WORKBENCH_LIST);
	}
	,getWorkbenchIdElement: function() {
		return window.document.getElementById(this.WORKBENCH_ID_ELEMENT);
	}
	,getWorkbenchIdFromUI: function() {
		return this.getWorkbenchIdElement().value;
	}
	,clearWorkbenchId: function() {
		var workbenchId = this.getWorkbenchIdElement().value;
		if(workbenchId != "") {
			console.log("Clearing workbench id ");
			var optionElement1 = window.document.getElementById(workbenchId);
			optionElement1.selected = false;
		} else console.log("Not clearing empty workbench id");
		var optionElement = window.document.getElementById(this.CHOOSE_WORKBENCH);
		optionElement.selected = true;
		this.getWorkbenchIdElement().value = "";
	}
	,setWorkbenchIdFromMessage: function(wid) {
		this.getWorkbenchIdElement().value = wid;
	}
	,getScriptTypeElement: function() {
		return window.document.getElementById(this.SUPPORTED_SCRIPT_LIST_ELEMENT);
	}
	,clearSupportedScriptList: function() {
		var element = window.document.getElementById(this.CHOOSE_SUPPORTED_SCRIPT);
		element.selected = true;
	}
	,clearWorkbenchesList: function() {
		var element = window.document.getElementById(this.CHOOSE_WORKBENCH);
		element.selected = true;
	}
	,getScriptTypeFromUI: function() {
		return this.selectedScriptType;
	}
	,setScriptTypeFromMessage: function(aScriptType) {
		console.log("Setting script type");
		var element = window.document.getElementById(aScriptType);
		element.selected = true;
		this.selectedScriptType = aScriptType;
	}
	,getScriptSummaryElement: function() {
		return window.document.getElementById(this.SCRIPT_SUMMARY);
	}
	,getScriptSummaryFromUI: function() {
		return this.getScriptSummaryElement().value;
	}
	,clearScriptSummary: function() {
		this.getScriptSummaryElement().value = "";
	}
	,setScriptSummaryFromMessage: function(aMessage) {
		this.getScriptSummaryElement().value = aMessage;
	}
	,getScriptUploadElement: function() {
		return window.document.getElementById(this.SCRIPT_UPLOAD_ELEMENT);
	}
	,getScriptDataElement: function() {
		return window.document.getElementById(this.SCRIPT_DATA_ELEMENT);
	}
	,setScriptDataFromMessage: function(aMessage) {
		try {
			this.getScriptDataElement().value = aMessage;
		} catch( err ) {
			haxe_CallStack.lastException = err;
			if (err instanceof js__$Boot_HaxeError) err = err.val;
			this.getScriptDataElement().value = JSON.stringify(err);
		}
	}
	,setNumberOfCoresFromMessage: function(numberOfCores) {
		this.getNumberOfCoresElement().value = "" + numberOfCores;
	}
	,getNumberOfCoresElement: function() {
		return window.document.getElementById(this.NUMBER_OF_CORES);
	}
	,getNumberOfCoresFromUI: function() {
		if(this.getNumberOfCoresElement().value == "") return this.DEFAULT_PROCESSORS;
		return Std.parseInt(this.getNumberOfCoresElement().value);
	}
	,getScriptDataPathFromUI: function() {
		return null;
	}
	,getJobStartDateFromUI: function() {
		return null;
	}
	,getJobEndDateFromUI: function() {
		return null;
	}
	,toString: function(crudType) {
		switch(crudType[1]) {
		case 0:
			return "Create";
		case 1:
			return "WrkBench_Update";
		case 2:
			return "Delete";
		case 3:
			return "Read";
		}
	}
	,getPayloadFromUI: function(crudType,scriptData) {
		var lCrudType = this.toString(crudType);
		if(lCrudType == "Create") {
			if(scriptData == null || scriptData == "") {
				console.log("Nothing to save");
				throw new js__$Boot_HaxeError("Inserting object with no script data ");
			}
		}
		var result = { crudType : this.toString(crudType), workbenchId : this.getWorkbenchIdFromUI(), uniqueProjectId : this.selectedProject.projectID, scriptType : this.getScriptTypeFromUI(), scriptSummary : this.getScriptSummaryFromUI(), scriptData : scriptData, numberOfCores : this.getNumberOfCoresFromUI(), scriptDataPath : this.getScriptDataPathFromUI(), jobStartDate : this.getJobStartDateFromUI(), jobEndDate : this.getJobEndDateFromUI(), nickName : MBooks_$im.getSingleton().getNickName(), commandType : "ManageWorkbench"};
		return result;
	}
	,getUpdateWorkbench: function() {
		return window.document.getElementById(this.UPDATE_WORKBENCH);
	}
	,getCreateWorkbench: function() {
		return window.document.getElementById(this.CREATE_WORKBENCH);
	}
	,getDeleteWorkbench: function() {
		return window.document.getElementById(this.DELETE_WORKBENCH);
	}
	,getExecuteWorkbench: function() {
		return window.document.getElementById(this.EXECUTE_WORKBENCH);
	}
	,getClearFields: function() {
		return window.document.getElementById(this.CLEAR_FIELDS);
	}
	,processExecuteWorkbench: function(executeWorkbench) {
		console.log("Processing execute workbench " + JSON.stringify(executeWorkbench));
		this.setScriptResult(executeWorkbench);
	}
	,setScriptResult: function(workbench) {
		var inputElement = window.document.getElementById(this.SCRIPT_RESULT);
		console.log("Workbench " + Std.string(workbench.Right));
		if(workbench.Right != null) {
			var tempResult = workbench.Right;
			var tempResultS = JSON.parse(tempResult.scriptResult);
			this.drawGraph(tempResultS);
		} else inputElement.value = JSON.stringify(workbench);
	}
	,drawGraph: function(inputData) {
		console.log("Input data " + Std.string(inputData));
		var values = [];
		var index = 0;
		var _g = 0;
		while(_g < inputData.length) {
			var i = inputData[_g];
			++_g;
			console.log("Inside loop " + Std.string(i));
			try {
				var pValue = Reflect.field(i,"p.value");
				if(pValue != null) {
					var p2 = 10000 * pValue;
					console.log("Setting p.value " + p2);
					var t = { 'x' : index, 'y' : p2};
					values[index] = t;
					index = index + 1;
				}
			} catch( err ) {
				haxe_CallStack.lastException = err;
				if (err instanceof js__$Boot_HaxeError) err = err.val;
				console.log("Ignoring " + Std.string(err));
			}
		}
		var formatCount = d3.format(",.0f");
		var formatCount1 = d3.format(",.0f");
		var margin_top = 10;
		var margin_right = 30;
		var margin_bottom = 30;
		var margin_left = 30;
		var width = 960 - margin_left - margin_right;
		var height = 500 - margin_top - margin_bottom;
		var x = d3.scale.linear().domain([0,values.length]).range([0,width]);
		var data = values;
		var y = d3.scale.linear().domain([0,d3.max(data,function(d) {
			return d.y;
		})]).range([height,0]);
		var xAxis = d3.svg.axis().scale(x);
		var svg = d3.select("body").append("svg").attr("width",width + margin_left + margin_right).attr("height",height + margin_top + margin_bottom).append("g").attr("transform","translate(" + margin_left + "," + margin_top + ")");
		var bar = svg.selectAll(".bar").data(data).enter().append("g").attr("class","bar").attr("transform",function(d1) {
			return "translate(" + Std.string(x(d1.x)) + "," + Std.string(y(d1.y)) + ")";
		});
		bar.append("rect").attr("x",1).attr("width",10).attr("height",function(d2) {
			return height - y(d2.y);
		});
		bar.append("text").attr("dy",".75em").attr("y",6).attr("x",5).attr("text-anchor","middle").text(function(d3) {
			return formatCount1(d3.y);
		});
		svg.append("g").attr("class","x axis").attr("transform","translate(0," + height + ")").call(xAxis);
	}
	,processSupportedScripts: function(supportedScripts) {
		console.log("Process supported scripts  " + JSON.stringify(supportedScripts));
		var supportedScriptListElement = this.getSupportedScriptsListElement();
		if(supportedScriptListElement == null) throw new js__$Boot_HaxeError("Script type list element is not defined");
		var _g = 0;
		var _g1 = supportedScripts.scriptTypes;
		while(_g < _g1.length) {
			var sType = _g1[_g];
			++_g;
			var optionElement = window.document.getElementById(sType);
			if(optionElement == null) {
				optionElement = (function($this) {
					var $r;
					var _this = window.document;
					$r = _this.createElement("option");
					return $r;
				}(this));
				optionElement.id = sType;
				optionElement.text = sType;
				supportedScriptListElement.appendChild(optionElement);
			} else console.log("Option element exists " + sType);
		}
		this.queryWorkbenches();
	}
	,querySupportedScripts: function() {
		console.log("Query supported scripts");
		var payload = { nickName : MBooks_$im.getSingleton().getNickName(), commandType : this.SUPPORTED_SCRIPT_TYPES, scriptTypes : []};
		MBooks_$im.getSingleton().doSendJSON(payload);
	}
	,queryWorkbenches: function() {
		try {
			console.log("Query all active workbenches for " + this.selectedProject.projectID);
			var payload = { nickName : MBooks_$im.getSingleton().getNickName(), projectId : this.selectedProject.projectID, commandType : this.QUERY_ACTIVE_WORKBENCHES, workbenches : []};
			MBooks_$im.getSingleton().doSendJSON(payload);
		} catch( err ) {
			haxe_CallStack.lastException = err;
			if (err instanceof js__$Boot_HaxeError) err = err.val;
			console.log("Error query workbenches " + Std.string(err));
		}
	}
	,insertToActiveWorkbenches: function(workbenchesUI,wrk) {
		var wId = wrk.workbenchId;
		var optionElement = window.document.getElementById(wId);
		if(optionElement == null) {
			optionElement = (function($this) {
				var $r;
				var _this = window.document;
				$r = _this.createElement("option");
				return $r;
			}(this));
			optionElement.id = wId;
			optionElement.text = wId;
			workbenchesUI.appendChild(optionElement);
		} else console.log("Element already exists " + wId);
		optionElement.selected = true;
		return optionElement;
	}
	,processQueryActiveWorkbenches: function(queryActiveWorkbenches) {
		console.log("Processing query active workbenches " + Std.string(queryActiveWorkbenches));
		var workbenches = queryActiveWorkbenches.workbenches;
		var workbenchesUI = this.getProjectWorkbenchListElement();
		var firstElement = true;
		var _g = 0;
		while(_g < workbenches.length) {
			var wrk = workbenches[_g];
			++_g;
			var optElement = this.insertToActiveWorkbenches(workbenchesUI,wrk);
			if(firstElement) {
				optElement.selected = true;
				this.read(wrk.workbenchId);
				firstElement = false;
			}
		}
	}
	,deleteFromActiveWorkbenches: function(workbenchesUI,wrk) {
		var optionElement = window.document.getElementById(wrk.workbenchId);
		if(optionElement != null) workbenchesUI.removeChild(optionElement); else console.log("Element not found " + Std.string(wrk));
	}
	,processWorkbenchSelected: function(ev) {
		var selectionElement = ev.target;
		var _g = 0;
		var _g1 = selectionElement.selectedOptions;
		while(_g < _g1.length) {
			var anOption = _g1[_g];
			++_g;
			var option = anOption;
			var selectionId = option.id;
			this.read(selectionId);
		}
	}
	,processManageWorkbench: function(incomingMessage) {
		console.log("Processing manage workbench " + Std.string(incomingMessage));
		var crudType = incomingMessage.crudType;
		this.setWorkbenchIdFromMessage(incomingMessage.workbenchId);
		this.copyIncomingValues(incomingMessage);
		if(crudType == "Create") {
			this.insertToActiveWorkbenches(this.getProjectWorkbenchListElement(),incomingMessage);
			if(this.executeUponSave) this.callExecuteWorkbench();
		} else if(crudType == "Delete") this.deleteFromActiveWorkbenches(this.getProjectWorkbenchListElement(),incomingMessage);
	}
	,copyIncomingValues: function(incomingMessage) {
		this.setWorkbenchIdFromMessage(incomingMessage.workbenchId);
		this.setScriptSummaryFromMessage(incomingMessage.scriptSummary);
		this.setScriptDataFromMessage(incomingMessage.scriptData);
		this.setScriptTypeFromMessage(incomingMessage.scriptType);
		this.setNumberOfCoresFromMessage(incomingMessage.numberOfCores);
		this.processScriptData(incomingMessage.scriptType,incomingMessage.scriptData);
	}
	,clearFields: function(ev) {
		this.clearWorkbenchId();
		this.clearScriptSummary();
		this.clearSupportedScriptList();
		this.clearWorkbenchesList();
	}
	,processScriptData: function(scriptType,scriptData) {
		console.log("Processing script type " + scriptType);
	}
	,handleThreeJS: function(scriptData) {
		console.log("processing three js");
	}
	,handleThreeJSJSON: function(scriptData) {
		console.log("Processing three js json loading");
	}
	,processScriptTypeSelected: function(ev) {
		console.log("Script type selected " + Std.string(ev));
		try {
			var selectionElement = ev.target;
			var _g = 0;
			var _g1 = selectionElement.selectedOptions;
			while(_g < _g1.length) {
				var option = _g1[_g];
				++_g;
				var cOption = option;
				this.selectedScriptType = cOption.id;
			}
		} catch( err ) {
			haxe_CallStack.lastException = err;
			if (err instanceof js__$Boot_HaxeError) err = err.val;
			console.log("Error " + Std.string(err));
		}
	}
	,__class__: model_ProjectWorkbench
};
var model_UserOperation = function(o) {
	this.operation = o;
};
model_UserOperation.__name__ = ["model","UserOperation"];
model_UserOperation.prototype = {
	__class__: model_UserOperation
};
var org_hamcrest_Exception = function(message,cause,info) {
	if(message == null) message = "";
	this.name = Type.getClassName(js_Boot.getClass(this));
	this.message = message;
	this.cause = cause;
	this.info = info;
};
org_hamcrest_Exception.__name__ = ["org","hamcrest","Exception"];
org_hamcrest_Exception.prototype = {
	get_name: function() {
		return this.name;
	}
	,get_message: function() {
		return this.message;
	}
	,get_cause: function() {
		return this.cause;
	}
	,toString: function() {
		var str = this.get_name() + ": " + this.get_message();
		if(this.info != null) str += " at " + this.info.className + "#" + this.info.methodName + " (" + this.info.lineNumber + ")";
		if(this.get_cause() != null) str += "\n\t Caused by: " + Std.string(this.get_cause());
		return str;
	}
	,__class__: org_hamcrest_Exception
};
var org_hamcrest_AssertionException = function(message,cause,info) {
	if(message == null) message = "";
	org_hamcrest_Exception.call(this,message,cause,info);
};
org_hamcrest_AssertionException.__name__ = ["org","hamcrest","AssertionException"];
org_hamcrest_AssertionException.__super__ = org_hamcrest_Exception;
org_hamcrest_AssertionException.prototype = $extend(org_hamcrest_Exception.prototype,{
	__class__: org_hamcrest_AssertionException
});
var org_hamcrest_IllegalArgumentException = function(message,cause,info) {
	if(message == null) message = "Argument could not be processed.";
	org_hamcrest_Exception.call(this,message,cause,info);
};
org_hamcrest_IllegalArgumentException.__name__ = ["org","hamcrest","IllegalArgumentException"];
org_hamcrest_IllegalArgumentException.__super__ = org_hamcrest_Exception;
org_hamcrest_IllegalArgumentException.prototype = $extend(org_hamcrest_Exception.prototype,{
	__class__: org_hamcrest_IllegalArgumentException
});
var org_hamcrest_MissingImplementationException = function(message,cause,info) {
	if(message == null) message = "Abstract method not overridden.";
	org_hamcrest_Exception.call(this,message,cause,info);
};
org_hamcrest_MissingImplementationException.__name__ = ["org","hamcrest","MissingImplementationException"];
org_hamcrest_MissingImplementationException.__super__ = org_hamcrest_Exception;
org_hamcrest_MissingImplementationException.prototype = $extend(org_hamcrest_Exception.prototype,{
	__class__: org_hamcrest_MissingImplementationException
});
var org_hamcrest_UnsupportedOperationException = function(message,cause,info) {
	if(message == null) message = "";
	org_hamcrest_Exception.call(this,message,cause,info);
};
org_hamcrest_UnsupportedOperationException.__name__ = ["org","hamcrest","UnsupportedOperationException"];
org_hamcrest_UnsupportedOperationException.__super__ = org_hamcrest_Exception;
org_hamcrest_UnsupportedOperationException.prototype = $extend(org_hamcrest_Exception.prototype,{
	__class__: org_hamcrest_UnsupportedOperationException
});
var promhx_base_AsyncBase = function(d) {
	this._resolved = false;
	this._pending = false;
	this._errorPending = false;
	this._fulfilled = false;
	this._update = [];
	this._error = [];
	this._errored = false;
	if(d != null) promhx_base_AsyncBase.link(d,this,function(x) {
		return x;
	});
};
promhx_base_AsyncBase.__name__ = ["promhx","base","AsyncBase"];
promhx_base_AsyncBase.link = function(current,next,f) {
	current._update.push({ async : next, linkf : function(x) {
		next.handleResolve(f(x));
	}});
	promhx_base_AsyncBase.immediateLinkUpdate(current,next,f);
};
promhx_base_AsyncBase.immediateLinkUpdate = function(current,next,f) {
	if(current._errored && !current._errorPending && !(current._error.length > 0)) next.handleError(current._errorVal);
	if(current._resolved && !current._pending) try {
		next.handleResolve(f(current._val));
	} catch( e ) {
		haxe_CallStack.lastException = e;
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		next.handleError(e);
	}
};
promhx_base_AsyncBase.linkAll = function(all,next) {
	var cthen = function(arr,current,v) {
		if(arr.length == 0 || promhx_base_AsyncBase.allFulfilled(arr)) {
			var vals;
			var _g = [];
			var $it0 = $iterator(all)();
			while( $it0.hasNext() ) {
				var a = $it0.next();
				_g.push(a == current?v:a._val);
			}
			vals = _g;
			next.handleResolve(vals);
		}
		null;
		return;
	};
	var $it1 = $iterator(all)();
	while( $it1.hasNext() ) {
		var a1 = $it1.next();
		a1._update.push({ async : next, linkf : (function(f,a11,a2) {
			return function(v1) {
				f(a11,a2,v1);
				return;
			};
		})(cthen,(function($this) {
			var $r;
			var _g1 = [];
			var $it2 = $iterator(all)();
			while( $it2.hasNext() ) {
				var a21 = $it2.next();
				if(a21 != a1) _g1.push(a21);
			}
			$r = _g1;
			return $r;
		}(this)),a1)});
	}
	if(promhx_base_AsyncBase.allFulfilled(all)) next.handleResolve((function($this) {
		var $r;
		var _g2 = [];
		var $it3 = $iterator(all)();
		while( $it3.hasNext() ) {
			var a3 = $it3.next();
			_g2.push(a3._val);
		}
		$r = _g2;
		return $r;
	}(this)));
};
promhx_base_AsyncBase.pipeLink = function(current,ret,f) {
	var linked = false;
	var linkf = function(x) {
		if(!linked) {
			linked = true;
			var pipe_ret = f(x);
			pipe_ret._update.push({ async : ret, linkf : $bind(ret,ret.handleResolve)});
			promhx_base_AsyncBase.immediateLinkUpdate(pipe_ret,ret,function(x1) {
				return x1;
			});
		}
	};
	current._update.push({ async : ret, linkf : linkf});
	if(current._resolved && !current._pending) try {
		linkf(current._val);
	} catch( e ) {
		haxe_CallStack.lastException = e;
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		ret.handleError(e);
	}
};
promhx_base_AsyncBase.allResolved = function($as) {
	var $it0 = $iterator($as)();
	while( $it0.hasNext() ) {
		var a = $it0.next();
		if(!a._resolved) return false;
	}
	return true;
};
promhx_base_AsyncBase.allFulfilled = function($as) {
	var $it0 = $iterator($as)();
	while( $it0.hasNext() ) {
		var a = $it0.next();
		if(!a._fulfilled) return false;
	}
	return true;
};
promhx_base_AsyncBase.prototype = {
	catchError: function(f) {
		this._error.push(f);
		return this;
	}
	,errorThen: function(f) {
		this._errorMap = f;
		return this;
	}
	,isResolved: function() {
		return this._resolved;
	}
	,isErrored: function() {
		return this._errored;
	}
	,isErrorHandled: function() {
		return this._error.length > 0;
	}
	,isErrorPending: function() {
		return this._errorPending;
	}
	,isFulfilled: function() {
		return this._fulfilled;
	}
	,isPending: function() {
		return this._pending;
	}
	,handleResolve: function(val) {
		this._resolve(val);
	}
	,_resolve: function(val) {
		var _g = this;
		if(this._pending) promhx_base_EventLoop.enqueue((function(f,a1) {
			return function() {
				f(a1);
			};
		})($bind(this,this._resolve),val)); else {
			this._resolved = true;
			this._pending = true;
			promhx_base_EventLoop.queue.add(function() {
				_g._val = val;
				var _g1 = 0;
				var _g2 = _g._update;
				while(_g1 < _g2.length) {
					var up = _g2[_g1];
					++_g1;
					try {
						up.linkf(val);
					} catch( e ) {
						haxe_CallStack.lastException = e;
						if (e instanceof js__$Boot_HaxeError) e = e.val;
						up.async.handleError(e);
					}
				}
				_g._fulfilled = true;
				_g._pending = false;
			});
			promhx_base_EventLoop.continueOnNextLoop();
		}
	}
	,handleError: function(error) {
		this._handleError(error);
	}
	,_handleError: function(error) {
		var _g = this;
		var update_errors = function(e) {
			if(_g._error.length > 0) {
				var _g1 = 0;
				var _g2 = _g._error;
				while(_g1 < _g2.length) {
					var ef = _g2[_g1];
					++_g1;
					ef(e);
				}
			} else if(_g._update.length > 0) {
				var _g11 = 0;
				var _g21 = _g._update;
				while(_g11 < _g21.length) {
					var up = _g21[_g11];
					++_g11;
					up.async.handleError(e);
				}
			} else throw new js__$Boot_HaxeError(e);
			_g._errorPending = false;
		};
		if(!this._errorPending) {
			this._errorPending = true;
			this._errored = true;
			this._errorVal = error;
			promhx_base_EventLoop.queue.add(function() {
				if(_g._errorMap != null) try {
					_g._resolve(_g._errorMap(error));
				} catch( e1 ) {
					haxe_CallStack.lastException = e1;
					if (e1 instanceof js__$Boot_HaxeError) e1 = e1.val;
					update_errors(e1);
				} else update_errors(error);
			});
			promhx_base_EventLoop.continueOnNextLoop();
		}
	}
	,then: function(f) {
		var ret = new promhx_base_AsyncBase();
		promhx_base_AsyncBase.link(this,ret,f);
		return ret;
	}
	,unlink: function(to) {
		var _g = this;
		promhx_base_EventLoop.queue.add(function() {
			_g._update = _g._update.filter(function(x) {
				return x.async != to;
			});
		});
		promhx_base_EventLoop.continueOnNextLoop();
	}
	,isLinked: function(to) {
		var updated = false;
		var _g = 0;
		var _g1 = this._update;
		while(_g < _g1.length) {
			var u = _g1[_g];
			++_g;
			if(u.async == to) return true;
		}
		return updated;
	}
	,__class__: promhx_base_AsyncBase
};
var promhx_Deferred = $hx_exports.promhx.Deferred = function() {
	promhx_base_AsyncBase.call(this);
};
promhx_Deferred.__name__ = ["promhx","Deferred"];
promhx_Deferred.__super__ = promhx_base_AsyncBase;
promhx_Deferred.prototype = $extend(promhx_base_AsyncBase.prototype,{
	resolve: function(val) {
		this.handleResolve(val);
	}
	,throwError: function(e) {
		this.handleError(e);
	}
	,promise: function() {
		return new promhx_Promise(this);
	}
	,stream: function() {
		return new promhx_Stream(this);
	}
	,publicStream: function() {
		return new promhx_PublicStream(this);
	}
	,__class__: promhx_Deferred
});
var promhx_Promise = $hx_exports.promhx.Promise = function(d) {
	promhx_base_AsyncBase.call(this,d);
	this._rejected = false;
};
promhx_Promise.__name__ = ["promhx","Promise"];
promhx_Promise.whenAll = function(itb) {
	var ret = new promhx_Promise();
	promhx_base_AsyncBase.linkAll(itb,ret);
	return ret;
};
promhx_Promise.promise = function(_val) {
	var ret = new promhx_Promise();
	ret.handleResolve(_val);
	return ret;
};
promhx_Promise.__super__ = promhx_base_AsyncBase;
promhx_Promise.prototype = $extend(promhx_base_AsyncBase.prototype,{
	isRejected: function() {
		return this._rejected;
	}
	,reject: function(e) {
		this._rejected = true;
		this.handleError(e);
	}
	,handleResolve: function(val) {
		if(this._resolved) {
			var msg = "Promise has already been resolved";
			throw new js__$Boot_HaxeError(promhx_error_PromiseError.AlreadyResolved(msg));
		}
		this._resolve(val);
	}
	,then: function(f) {
		var ret = new promhx_Promise();
		promhx_base_AsyncBase.link(this,ret,f);
		return ret;
	}
	,unlink: function(to) {
		var _g = this;
		promhx_base_EventLoop.queue.add(function() {
			if(!_g._fulfilled) {
				var msg = "Downstream Promise is not fullfilled";
				_g.handleError(promhx_error_PromiseError.DownstreamNotFullfilled(msg));
			} else _g._update = _g._update.filter(function(x) {
				return x.async != to;
			});
		});
		promhx_base_EventLoop.continueOnNextLoop();
	}
	,handleError: function(error) {
		this._rejected = true;
		this._handleError(error);
	}
	,pipe: function(f) {
		var ret = new promhx_Promise();
		promhx_base_AsyncBase.pipeLink(this,ret,f);
		return ret;
	}
	,errorPipe: function(f) {
		var ret = new promhx_Promise();
		this.catchError(function(e) {
			var piped = f(e);
			piped.then($bind(ret,ret._resolve));
		});
		this.then($bind(ret,ret._resolve));
		return ret;
	}
	,__class__: promhx_Promise
});
var promhx_Stream = $hx_exports.promhx.Stream = function(d) {
	promhx_base_AsyncBase.call(this,d);
	this._end_deferred = new promhx_Deferred();
	this._end_promise = this._end_deferred.promise();
};
promhx_Stream.__name__ = ["promhx","Stream"];
promhx_Stream.foreach = function(itb) {
	var s = new promhx_Stream();
	var $it0 = $iterator(itb)();
	while( $it0.hasNext() ) {
		var i = $it0.next();
		s.handleResolve(i);
	}
	s.end();
	return s;
};
promhx_Stream.wheneverAll = function(itb) {
	var ret = new promhx_Stream();
	promhx_base_AsyncBase.linkAll(itb,ret);
	return ret;
};
promhx_Stream.concatAll = function(itb) {
	var ret = new promhx_Stream();
	var $it0 = $iterator(itb)();
	while( $it0.hasNext() ) {
		var i = $it0.next();
		ret.concat(i);
	}
	return ret;
};
promhx_Stream.mergeAll = function(itb) {
	var ret = new promhx_Stream();
	var $it0 = $iterator(itb)();
	while( $it0.hasNext() ) {
		var i = $it0.next();
		ret.merge(i);
	}
	return ret;
};
promhx_Stream.stream = function(_val) {
	var ret = new promhx_Stream();
	ret.handleResolve(_val);
	return ret;
};
promhx_Stream.__super__ = promhx_base_AsyncBase;
promhx_Stream.prototype = $extend(promhx_base_AsyncBase.prototype,{
	then: function(f) {
		var ret = new promhx_Stream();
		promhx_base_AsyncBase.link(this,ret,f);
		this._end_promise.then(function(x) {
			ret.end();
		});
		return ret;
	}
	,detachStream: function(str) {
		var filtered = [];
		var removed = false;
		var _g = 0;
		var _g1 = this._update;
		while(_g < _g1.length) {
			var u = _g1[_g];
			++_g;
			if(u.async == str) removed = true; else filtered.push(u);
		}
		this._update = filtered;
		return removed;
	}
	,first: function() {
		var s = new promhx_Promise();
		this.then(function(x) {
			if(!s._resolved) s.handleResolve(x);
		});
		return s;
	}
	,handleResolve: function(val) {
		if(!this._end && !this._pause) this._resolve(val);
	}
	,pause: function(set) {
		if(set == null) set = !this._pause;
		this._pause = set;
	}
	,pipe: function(f) {
		var ret = new promhx_Stream();
		promhx_base_AsyncBase.pipeLink(this,ret,f);
		this._end_promise.then(function(x) {
			ret.end();
		});
		return ret;
	}
	,errorPipe: function(f) {
		var ret = new promhx_Stream();
		this.catchError(function(e) {
			var piped = f(e);
			piped.then($bind(ret,ret._resolve));
			piped._end_promise.then(($_=ret._end_promise,$bind($_,$_._resolve)));
		});
		this.then($bind(ret,ret._resolve));
		this._end_promise.then(function(x) {
			ret.end();
		});
		return ret;
	}
	,handleEnd: function() {
		if(this._pending) {
			promhx_base_EventLoop.queue.add($bind(this,this.handleEnd));
			promhx_base_EventLoop.continueOnNextLoop();
		} else if(this._end_promise._resolved) return; else {
			this._end = true;
			var o;
			if(this._resolved) o = haxe_ds_Option.Some(this._val); else o = haxe_ds_Option.None;
			this._end_promise.handleResolve(o);
			this._update = [];
			this._error = [];
		}
	}
	,end: function() {
		promhx_base_EventLoop.queue.add($bind(this,this.handleEnd));
		promhx_base_EventLoop.continueOnNextLoop();
		return this;
	}
	,endThen: function(f) {
		return this._end_promise.then(f);
	}
	,filter: function(f) {
		var ret = new promhx_Stream();
		this._update.push({ async : ret, linkf : function(x) {
			if(f(x)) ret.handleResolve(x);
		}});
		promhx_base_AsyncBase.immediateLinkUpdate(this,ret,function(x1) {
			return x1;
		});
		return ret;
	}
	,concat: function(s) {
		var ret = new promhx_Stream();
		this._update.push({ async : ret, linkf : $bind(ret,ret.handleResolve)});
		promhx_base_AsyncBase.immediateLinkUpdate(this,ret,function(x) {
			return x;
		});
		this._end_promise.then(function(_) {
			s.pipe(function(x1) {
				ret.handleResolve(x1);
				return ret;
			});
			s._end_promise.then(function(_1) {
				ret.end();
			});
		});
		return ret;
	}
	,merge: function(s) {
		var ret = new promhx_Stream();
		this._update.push({ async : ret, linkf : $bind(ret,ret.handleResolve)});
		s._update.push({ async : ret, linkf : $bind(ret,ret.handleResolve)});
		promhx_base_AsyncBase.immediateLinkUpdate(this,ret,function(x) {
			return x;
		});
		promhx_base_AsyncBase.immediateLinkUpdate(s,ret,function(x1) {
			return x1;
		});
		return ret;
	}
	,__class__: promhx_Stream
});
var promhx_PublicStream = $hx_exports.promhx.PublicStream = function(def) {
	promhx_Stream.call(this,def);
};
promhx_PublicStream.__name__ = ["promhx","PublicStream"];
promhx_PublicStream.publicstream = function(val) {
	var ps = new promhx_PublicStream();
	ps.handleResolve(val);
	return ps;
};
promhx_PublicStream.__super__ = promhx_Stream;
promhx_PublicStream.prototype = $extend(promhx_Stream.prototype,{
	resolve: function(val) {
		this.handleResolve(val);
	}
	,throwError: function(e) {
		this.handleError(e);
	}
	,update: function(val) {
		this.handleResolve(val);
	}
	,__class__: promhx_PublicStream
});
var promhx_base_EventLoop = function() { };
promhx_base_EventLoop.__name__ = ["promhx","base","EventLoop"];
promhx_base_EventLoop.enqueue = function(eqf) {
	promhx_base_EventLoop.queue.add(eqf);
	promhx_base_EventLoop.continueOnNextLoop();
};
promhx_base_EventLoop.set_nextLoop = function(f) {
	if(promhx_base_EventLoop.nextLoop != null) throw new js__$Boot_HaxeError("nextLoop has already been set"); else promhx_base_EventLoop.nextLoop = f;
	return promhx_base_EventLoop.nextLoop;
};
promhx_base_EventLoop.queueEmpty = function() {
	return promhx_base_EventLoop.queue.isEmpty();
};
promhx_base_EventLoop.finish = function(max_iterations) {
	if(max_iterations == null) max_iterations = 1000;
	var fn = null;
	while(max_iterations-- > 0 && (fn = promhx_base_EventLoop.queue.pop()) != null) fn();
	return promhx_base_EventLoop.queue.isEmpty();
};
promhx_base_EventLoop.clear = function() {
	promhx_base_EventLoop.queue = new List();
};
promhx_base_EventLoop.f = function() {
	var fn = promhx_base_EventLoop.queue.pop();
	if(fn != null) fn();
	if(!promhx_base_EventLoop.queue.isEmpty()) promhx_base_EventLoop.continueOnNextLoop();
};
promhx_base_EventLoop.continueOnNextLoop = function() {
	if(promhx_base_EventLoop.nextLoop != null) promhx_base_EventLoop.nextLoop(promhx_base_EventLoop.f); else setImmediate(promhx_base_EventLoop.f);
};
var promhx_error_PromiseError = { __ename__ : true, __constructs__ : ["AlreadyResolved","DownstreamNotFullfilled"] };
promhx_error_PromiseError.AlreadyResolved = function(message) { var $x = ["AlreadyResolved",0,message]; $x.__enum__ = promhx_error_PromiseError; $x.toString = $estr; return $x; };
promhx_error_PromiseError.DownstreamNotFullfilled = function(message) { var $x = ["DownstreamNotFullfilled",1,message]; $x.__enum__ = promhx_error_PromiseError; $x.toString = $estr; return $x; };
var promhx_haxe_EventTools = function() { };
promhx_haxe_EventTools.__name__ = ["promhx","haxe","EventTools"];
promhx_haxe_EventTools.eventStream = function(el,event,useCapture) {
	var def = new promhx_Deferred();
	el.addEventListener(event,$bind(def,def.resolve),useCapture);
	return def.stream();
};
var util_Config = function() { };
util_Config.__name__ = ["util","Config"];
var util_Util = function() { };
util_Util.__name__ = ["util","Util"];
util_Util.NEW_LINE = function() {
	return 10;
};
util_Util.TAB = function() {
	return 9;
};
util_Util.CR = function() {
	return 13;
};
util_Util.isUpOrDown = function(code) {
	return code == util_Util.UP_ARROW || code == util_Util.DOWN_ARROW;
};
util_Util.isUP = function(code) {
	return code == util_Util.UP_ARROW;
};
util_Util.issDown = function(code) {
	return code == util_Util.DOWN_ARROW;
};
util_Util.isTab = function(code) {
	return code == util_Util.TAB();
};
util_Util.isBackspace = function(code) {
	return code == util_Util.BACKSPACE;
};
util_Util.isSignificantWS = function(code) {
	return code == util_Util.TAB() || code == util_Util.NEW_LINE() || code == util_Util.CR();
};
util_Util.showDivField = function(fieldName) {
	var div = window.document.getElementById(fieldName);
	div.setAttribute("style","display:normal");
};
util_Util.hideDivField = function(fieldName) {
	var div = window.document.getElementById(fieldName);
	div.setAttribute("style","display:none");
};
util_Util.logToServer = function(logMessage) {
};
util_Util.log = function(logMessage) {
	console.log(logMessage);
};
var view_Company = function() {
	console.log("Instantiating company");
	this.newCompany = true;
	var stream = MBooks_$im.getSingleton().initializeElementStream(this.getCompanySignup(),"click");
	var cidStream = MBooks_$im.getSingleton().initializeElementStream(this.getCompanyIDElement(),"blur");
	cidStream.then($bind(this,this.chkCompanyExists));
	stream.then($bind(this,this.saveButtonPressed));
	this.selectListEventStream = new promhx_Deferred();
	MBooks_$im.getSingleton().getUserLoggedInStream().then($bind(this,this.selectAllCompanies));
	MBooks_$im.getSingleton().selectedCompanyStream.then($bind(this,this.assignCompanyToUser));
	MBooks_$im.getSingleton().assignCompanyStream.then($bind(this,this.assignCompanyResponse));
};
view_Company.__name__ = ["view","Company"];
view_Company.prototype = {
	getAssignCompany: function() {
		var buttonElement = window.document.getElementById(view_Company.ASSIGN_COMPANY);
		return buttonElement;
	}
	,getCompanySignup: function() {
		var buttonElement = window.document.getElementById(view_Company.SAVE_COMPANY);
		return buttonElement;
	}
	,getCompanyImageElement: function() {
		var fileElement = window.document.getElementById(view_Company.COMPANY_IMAGE);
		return fileElement;
	}
	,getCompanySplashElement: function() {
		return window.document.getElementById(view_Company.COMPANY_SPLASH_ELEMENT);
	}
	,getCompanyNameElement: function() {
		return window.document.getElementById(view_Company.COMPANY_NAME);
	}
	,getCompanyName: function() {
		return this.getCompanyNameElement().value;
	}
	,getCompanyIDElement: function() {
		return window.document.getElementById(view_Company.COMPANY_ID);
	}
	,getCompanyID: function() {
		return this.getCompanyIDElement().value;
	}
	,getCompanyMailboxElement: function() {
		return window.document.getElementById(view_Company.COMPANY_MAILBOX);
	}
	,getCompanyMailbox: function() {
		return this.getCompanyMailboxElement().value;
	}
	,hideCompanyForm: function() {
		util_Util.hideDivField(view_Company.COMPANY_FORM_ID);
	}
	,showCompanyForm: function() {
		util_Util.showDivField(view_Company.COMPANY_FORM_ID);
	}
	,assignCompanyToUser: function(ev) {
		console.log("Assigning company to a user:" + Std.string(ev));
		try {
			var payload = { commandType : "AssignCompany", companyID : ev, userName : MBooks_$im.getSingleton().getNickName(), isChatMinder : false, isSupport : false, nickName : MBooks_$im.getSingleton().getNickName()};
			MBooks_$im.getSingleton().doSendJSON(payload);
		} catch( err ) {
			haxe_CallStack.lastException = err;
			if (err instanceof js__$Boot_HaxeError) err = err.val;
			console.log("Error assigning company " + Std.string(ev));
		}
	}
	,saveButtonPressed: function(ev) {
		console.log("Save button pressed");
		var file = this.getCompanyImageElement().files[0];
		if(file != null) {
			var reader = new FileReader();
			var stream_1 = MBooks_$im.getSingleton().initializeElementStream(reader,"load");
			stream_1.then($bind(this,this.loadImage));
			reader.readAsDataURL(file);
		} else this.saveCompanyInfo(this.getCompanySplashImageString());
	}
	,selectAllCompanies: function(loggedInMessage) {
		console.log("Processing select all companies " + loggedInMessage);
		var payload = { nickName : MBooks_$im.getSingleton().getNickName(), commandType : "SelectAllCompanies"};
		MBooks_$im.getSingleton().doSendJSON(payload);
	}
	,getPayload: function(nickName,crudType,companyName,companyID,companyMailbox,companyImage1,updatedBy) {
		var payload = { nickName : nickName, commandType : "ManageCompany", crudType : crudType, company : { companyName : companyName, companyID : companyID, generalMailbox : companyMailbox, companyImage : companyImage1, updatedBy : nickName}};
		return payload;
	}
	,loadImage: function(ev) {
		console.log("Load image");
		try {
			var reader = ev.target;
			this.saveCompanyInfo(reader.result);
		} catch( e ) {
			haxe_CallStack.lastException = e;
			if (e instanceof js__$Boot_HaxeError) e = e.val;
			console.log("Exception " + Std.string(e));
		}
	}
	,saveCompanyInfo: function(encodedString) {
		console.log("Saving company info");
		var companyName = this.getCompanyName();
		var companyID = this.getCompanyID();
		var companyMailbox = this.getCompanyMailbox();
		var imageSplash = this.getCompanySplashElement();
		var imageEncoded = encodedString;
		var nickName = MBooks_$im.getSingleton().getNickName();
		var crud = "";
		if(this.newCompany) crud = "Create"; else crud = "C_Update";
		var payload = this.getPayload(nickName,crud,companyName,companyID,companyMailbox,imageEncoded,nickName);
		MBooks_$im.getSingleton().doSendJSON(payload);
	}
	,read: function(companyID) {
		try {
			var nickName = MBooks_$im.getSingleton().getNickName();
			var payload = this.getPayload(nickName,"Read","",companyID,"","","");
			MBooks_$im.getSingleton().doSendJSON(payload);
		} catch( err ) {
			haxe_CallStack.lastException = err;
			if (err instanceof js__$Boot_HaxeError) err = err.val;
			console.log("Error checking company " + Std.string(err));
		}
	}
	,chkCompanyExists: function(ev) {
		console.log("Chk company exists " + ev.keyCode);
		if(util_Util.isSignificantWS(ev.keyCode)) try {
			this.read(this.getCompanyID());
		} catch( err ) {
			haxe_CallStack.lastException = err;
			if (err instanceof js__$Boot_HaxeError) err = err.val;
			console.log("Error checking company " + Std.string(err));
		}
	}
	,processManageCompany: function(incomingMessage) {
		console.log("Process manage company ");
		var crudType = incomingMessage.crudType;
		console.log(incomingMessage);
		if(crudType == "Create") {
			console.log("Create successful");
			this.copyIncomingValues(incomingMessage);
		} else if(crudType == "Read") {
			if(incomingMessage.company.companyID == "") this.newCompany = true; else this.newCompany = false;
			this.copyIncomingValues(incomingMessage);
			MBooks_$im.getSingleton().activeCompanyStream.resolve(this.createCompany(incomingMessage));
		} else if(crudType == "C_Update") this.copyIncomingValues(incomingMessage); else if(crudType == "Delete") this.clearFields(incomingMessage); else throw new js__$Boot_HaxeError("Invalid crudtype " + crudType);
	}
	,copyIncomingValues: function(incomingMessage) {
		try {
			this.getCompanyNameElement().value = incomingMessage.company.companyName;
			this.getCompanyIDElement().value = incomingMessage.company.companyID;
			this.getCompanyMailboxElement().value = incomingMessage.company.generalMailbox;
			var imageSplash = this.getCompanySplashElement();
			imageSplash.src = incomingMessage.company.companyImage;
		} catch( error ) {
			haxe_CallStack.lastException = error;
			if (error instanceof js__$Boot_HaxeError) error = error.val;
			throw new js__$Boot_HaxeError(error);
		}
	}
	,createCompany: function(incomingMessage) {
		var result = new model_Company(incomingMessage.company.companyName,incomingMessage.company.companyID,incomingMessage.company.generalMailbox,incomingMessage.company.image);
		return result;
	}
	,getCompanySplashImageString: function() {
		try {
			var imageSplash = this.getCompanySplashElement();
			return imageSplash.src;
		} catch( error ) {
			haxe_CallStack.lastException = error;
			if (error instanceof js__$Boot_HaxeError) error = error.val;
			throw new js__$Boot_HaxeError(error);
		}
	}
	,clearFields: function(incomingMessage) {
		this.getCompanyNameElement().value = "";
		this.getCompanyIDElement().value = "";
		this.getCompanyMailboxElement().value = "";
		this.getCompanySplashElement().src = "";
	}
	,getSelectListEventStream: function() {
		return this.selectListEventStream;
	}
	,assignCompanyResponse: function(res) {
		console.log("Processing assign company response " + Std.string(res));
	}
	,__class__: view_Company
};
var view_CompanyEntitlement = function(view1,companyStream) {
	this.userEntitlementsList = window.document.getElementById(view_CompanyEntitlement.USER_ENTITLEMENTS);
	view1.queryEntitlementResponse.then($bind(this,this.handleQueryEntitlementResponse));
	this.entitlementsManager = new view_ListManager(this.userEntitlementsList,view_CompanyEntitlement.MANAGE_COMPANY_USER_ENTS,model_Entitlement.optionId,model_Entitlement.listDisplay);
	this.users = window.document.getElementById(view_CompanyEntitlement.COMPANY_USERS);
	this.userListManager = new view_ListManager(this.users,view_CompanyEntitlement.COMPANY_USERS,model_Person.optionId,model_Person.listDisplay);
	view1.modelResponseStream.then($bind(this,this.handleModelResponse));
	companyStream.then($bind(this,this.getCompanyUsers));
	this.userListResponse = new promhx_Deferred();
	this.userListResponse.then($bind(this,this.handleQueryCompanyUsers));
	this.addUserEntitlement = window.document.getElementById(view_CompanyEntitlement.ADD_USER_ENTITLEMENTS);
	this.removeUserEntitlement = window.document.getElementById(view_CompanyEntitlement.REMOVE_USER_ENTITLEMENTS);
};
view_CompanyEntitlement.__name__ = ["view","CompanyEntitlement"];
view_CompanyEntitlement.prototype = {
	handleUserEntitlementSelect: function(userEv,entEv) {
		var userList = userEv.target;
		var entList = entEv.target;
		var _g = 0;
		var _g1 = userList.selectedOptions;
		while(_g < _g1.length) {
			var user = _g1[_g];
			++_g;
			var u = user;
			console.log("User " + u.id + " " + u.text);
			var _g2 = 0;
			var _g3 = entList.selectedOptions;
			while(_g2 < _g3.length) {
				var entE = _g3[_g2];
				++_g2;
				var ent = entE;
				console.log("Ent " + ent.id + " " + ent.text);
			}
		}
	}
	,handleUserListChange: function(ev) {
		console.log("Event received " + Std.string(ev));
	}
	,handleEntitlementsChange: function(ev) {
		console.log("Event received " + Std.string(ev));
	}
	,initializeStreams: function() {
		console.log("Adding user entitlement stream");
		var addUserEntitlementStream = MBooks_$im.getSingleton().initializeElementStream(this.addUserEntitlement,"click");
		addUserEntitlementStream.then($bind(this,this.addUserEntitlementF));
		var removeUserEntitlementStream = MBooks_$im.getSingleton().initializeElementStream(this.removeUserEntitlement,"click");
		removeUserEntitlementStream.then($bind(this,this.removeUserEntitlementF));
		var stream = MBooks_$im.getSingleton().initializeElementStream(this.userListManager.listElement,"change");
		stream.then($bind(this,this.handleUserListChange));
		var eStream = MBooks_$im.getSingleton().initializeElementStream(this.entitlementsManager.listElement,"change");
		eStream.then($bind(this,this.handleEntitlementsChange));
		((function($this) {
			var $r;
			var varargf = function(f) {
				var ret = new promhx_Stream();
				var arr = [stream,eStream];
				var p = promhx_Stream.wheneverAll(arr);
				p._update.push({ async : ret, linkf : function(x) {
					ret.handleResolve(f(arr[0]._val,arr[1]._val));
				}});
				return ret;
			};
			$r = { then : varargf};
			return $r;
		}(this))).then($bind(this,this.handleUserEntitlementSelect));
	}
	,addUserEntitlementF: function(event) {
		console.log("Add user entitlements " + Std.string(event));
		var _g = 0;
		var _g1 = this.users;
		while(_g < _g1.length) {
			var userE = _g1[_g];
			++_g;
			var user = userE;
			var _g2 = 0;
			var _g3 = this.userEntitlementsList;
			while(_g2 < _g3.length) {
				var entE = _g3[_g2];
				++_g2;
				var ent = entE;
				console.log("Adding entitlements " + ent.id + " to " + user.id);
				model_CompanyEntitlement.addUserEntitlement(user.id,ent.id);
			}
		}
	}
	,removeUserEntitlementF: function(event) {
		console.log("Remove user entitlement " + Std.string(event));
	}
	,getCompanyUsers: function(aCompanyId) {
		console.log("Query all company users for " + Std.string(aCompanyId));
		var queryCompanyUsers = { nickName : MBooks_$im.getSingleton().getNickName(), commandType : "QueryCompanyUsers", companyID : aCompanyId, users : []};
		MBooks_$im.getSingleton().doSendJSON(queryCompanyUsers);
	}
	,handleQueryCompanyUsers: function(incoming) {
		console.log("Handle query company users " + Std.string(incoming));
		if(incoming == null) {
			MBooks_$im.getSingleton().incomingMessageNull("QueryEntitlement");
			return;
		}
		if(incoming.Left != null) MBooks_$im.getSingleton().applicationErrorStream.resolve(incoming); else if(incoming.Right != null) this.updateCompanyUsers(incoming.Right);
	}
	,updateCompanyUsers: function(queryUserResult) {
		console.log("Update company users list");
		var _g = 0;
		var _g1 = queryUserResult.users;
		while(_g < _g1.length) {
			var user = _g1[_g];
			++_g;
			console.log("Adding element to the list." + Std.string(user));
			var stream = this.userListManager.add(user);
		}
	}
	,handleQueryEntitlementResponse: function(incoming) {
		console.log("Query entitlements ");
		if(incoming == null) {
			MBooks_$im.getSingleton().incomingMessageNull("QueryEntitlement");
			return;
		}
		if(incoming.Left != null) MBooks_$im.getSingleton().applicationErrorStream.resolve(incoming); else if(incoming.Right != null) this.updateEntitlementList(incoming.Right);
	}
	,updateEntitlementList: function(queryEntitlement) {
		console.log("Update entitlement list element");
		var _g = 0;
		var _g1 = queryEntitlement.resultSet;
		while(_g < _g1.length) {
			var entitlement = _g1[_g];
			++_g;
			console.log("Adding element to the list." + Std.string(entitlement));
			var stream = this.entitlementsManager.add(entitlement);
		}
	}
	,handleModelResponse: function(incoming) {
		console.log("handling model response");
		if(incoming == null) {
			MBooks_$im.getSingleton().incomingMessageNull("ModelResponse");
			return;
		}
		if(incoming.Left != null) MBooks_$im.getSingleton().applicationErrorStream.resolve(incoming); else if(incoming.Right != null) this.updateSelf(incoming.Right);
	}
	,updateSelf: function(entitlement) {
		console.log("Updating view " + Std.string(entitlement));
		if(entitlement.crudType == "Delete") this.entitlementsManager["delete"](entitlement); else this.entitlementsManager.upsert(entitlement);
	}
	,__class__: view_CompanyEntitlement
};
var view_Entitlement = function() {
	console.log("Creating Entitlement view");
	this.tabNameElement = window.document.getElementById(view_Entitlement.TAB_NAME);
	if(this.tabNameElement == null) throw new js__$Boot_HaxeError("Element not found " + view_Entitlement.TAB_NAME);
	this.tabName = this.tabNameElement.value;
	this.sectionNameElement = window.document.getElementById(view_Entitlement.SECTION_NAME);
	if(this.sectionNameElement == null) throw new js__$Boot_HaxeError("Element not found " + view_Entitlement.SECTION_NAME);
	this.entitlementMap = new haxe_ds_StringMap();
	this.sectionName = this.sectionNameElement.value;
	this.textFields = new List();
	this.textFields.add(this.sectionNameElement);
	this.textFields.add(this.tabNameElement);
	this.modelStream = new promhx_Deferred();
	this.view = new promhx_Deferred();
	this.modelResponseStream = new promhx_Deferred();
	this.modelResponseStream.then($bind(this,this.handleModelResponse));
	this.modelObject = new model_Entitlement(this.modelStream);
	this.queryEntitlementResponse = new promhx_Deferred();
	this.queryEntitlementResponse.then($bind(this,this.handleQueryEntitlementResponse));
	this.addEntitlementButton = window.document.getElementById(view_Entitlement.ADD_ENTITLEMENT);
	this.updateEntitlementButton = window.document.getElementById(view_Entitlement.UPDATE_ENTITLEMENT);
	this.deleteEntitlementButton = window.document.getElementById(view_Entitlement.REMOVE_ENTITLEMENT);
	this.setupStreams();
};
view_Entitlement.__name__ = ["view","Entitlement"];
view_Entitlement.prototype = {
	queryAllEntitlements: function() {
		this.modelObject.queryAllEntitlements();
	}
	,setupStreams: function() {
		this.addEntitlementButton.addEventListener("click",$bind(this,this.addEntitlementEvent));
		this.updateEntitlementButton.addEventListener("click",$bind(this,this.updateEntitlementEvent));
		this.deleteEntitlementButton.addEventListener("click",$bind(this,this.deleteEntitlementEvent));
	}
	,getModelEntitlement: function(aCrudType) {
		var change = { crudType : aCrudType, commandType : view_Entitlement.MANAGE_ENTITLEMENTS_COMMAND, tabName : this.tabNameElement.value, sectionName : this.sectionNameElement.value, nickName : MBooks_$im.getSingleton().getNickName()};
		return change;
	}
	,addEntitlementEvent: function(ev) {
		console.log("Add entitlement clicked");
		var change = this.getModelEntitlement("Create");
		this.modelStream.resolve(change);
	}
	,updateEntitlementEvent: function(ev) {
		console.log("Update entitlement clicked");
		var change = this.getModelEntitlement("C_Update");
		this.modelStream.resolve(change);
	}
	,deleteEntitlementEvent: function(ev) {
		console.log("Deleting entitlement ");
		var change = this.getModelEntitlement("Delete");
		this.modelStream.resolve(change);
	}
	,setTabName: function(aTabName) {
		this.tabName = aTabName;
	}
	,setSectionName: function(aName) {
		this.sectionName = aName;
	}
	,incomingMessageNull: function(source) {
		MBooks_$im.getSingleton().incomingMessageNull(source);
	}
	,handleQueryEntitlementResponse: function(incoming) {
		if(incoming == null) {
			this.incomingMessageNull("QueryEntitlement");
			return;
		}
		if(incoming.Left != null) MBooks_$im.getSingleton().applicationErrorStream.resolve(incoming); else if(incoming.Right != null) this.updateEntitlementList(incoming.Right);
	}
	,handleModelResponse: function(incoming) {
		console.log("handling model response");
		if(incoming == null) {
			this.incomingMessageNull("ModelResponse");
			return;
		}
		if(incoming.Left != null) MBooks_$im.getSingleton().applicationErrorStream.resolve(incoming); else if(incoming.Right != null) this.updateSelf(incoming.Right);
	}
	,updateEntitlementList: function(queryEntitlement) {
		var entitlementList = queryEntitlement.resultSet;
		this.deleteFromEntitlementList();
		var _g = 0;
		while(_g < entitlementList.length) {
			var entitlement = entitlementList[_g];
			++_g;
			this.updateIntoView(entitlement);
		}
	}
	,updateSelf: function(entitlement) {
		console.log("Updating view " + Std.string(entitlement));
		if(entitlement.crudType == "Delete") this.deleteFromView(entitlement); else this.updateIntoView(entitlement);
	}
	,deleteFromView: function(entitlement) {
		this.clearTextFields();
		this.removeFromList(entitlement);
	}
	,updateIntoView: function(entitlement) {
		this.clearTextFields();
		this.updateList(entitlement);
		this.updateTextFields(entitlement);
	}
	,clearTextFields: function() {
		var _g_head = this.textFields.h;
		var _g_val = null;
		while(_g_head != null) {
			var i;
			i = (function($this) {
				var $r;
				_g_val = _g_head[0];
				_g_head = _g_head[1];
				$r = _g_val;
				return $r;
			}(this));
			i.value = "";
		}
	}
	,updateTextFields: function(entitlement) {
		this.sectionNameElement.value = entitlement.sectionName;
		this.tabNameElement.value = entitlement.tabName;
	}
	,getOptionElementKey: function(entitlement) {
		console.log("Creating an option element key");
		var optionElementKey = view_Entitlement.MANAGE_ENTITLEMENTS_COMMAND + entitlement.tabName + entitlement.sectionName;
		return optionElementKey;
	}
	,printListText: function(entitlement) {
		return entitlement.tabName + "->" + entitlement.sectionName;
	}
	,initializeEntitlementListStream: function() {
		this.entitlementsList = window.document.getElementById(view_Entitlement.ENTITLEMENT_LIST);
		if(this.entitlementsList == null) throw new js__$Boot_HaxeError("Element not found  " + view_Entitlement.ENTITLEMENT_LIST);
		if(this.entitlementListStream == null) {
			this.entitlementListStream = MBooks_$im.getSingleton().initializeElementStream(this.entitlementsList,"change");
			this.entitlementListStream.then($bind(this,this.handleEntitlementSelected));
		}
	}
	,updateList: function(entitlement) {
		console.log("Adding element to list");
		var optionElementKey = this.getOptionElementKey(entitlement);
		var optionElement = window.document.getElementById(optionElementKey);
		this.initializeEntitlementListStream();
		if(optionElement == null) {
			{
				this.entitlementMap.set(optionElementKey,entitlement);
				entitlement;
			}
			optionElement = (function($this) {
				var $r;
				var _this = window.document;
				$r = _this.createElement("option");
				return $r;
			}(this));
			optionElement.id = optionElementKey;
			optionElement.text = this.printListText(entitlement);
			this.entitlementsList.appendChild(optionElement);
		} else optionElement.text = this.printListText(entitlement);
		optionElement.selected = true;
	}
	,removeFromList: function(entitlement) {
		console.log("Removing element from list");
		var optionElementKey = this.getOptionElementKey(entitlement);
		this.removeElementFromList(optionElementKey);
	}
	,removeElementFromList: function(id) {
		var optionElement = window.document.getElementById(id);
		if(optionElement == null) throw new js__$Boot_HaxeError("Nothing to delete " + id);
		optionElement.parentNode.removeChild(optionElement);
		console.log("The above code should most likely work");
		var $it0 = this.entitlementMap.iterator();
		while( $it0.hasNext() ) {
			var entitlement = $it0.next();
			var optionElementKey = this.getOptionElementKey(entitlement);
			var optionElement1 = window.document.getElementById(optionElementKey);
			if(optionElement1 != null) {
				optionElement1.selected = true;
				this.updateTextFields(entitlement);
				break;
			}
		}
	}
	,deleteFromEntitlementList: function() {
		try {
			var $it0 = this.entitlementMap.iterator();
			while( $it0.hasNext() ) {
				var entitlement = $it0.next();
				this.removeElementFromList(this.getOptionElementKey(entitlement));
			}
			this.entitlementMap = new haxe_ds_StringMap();
		} catch( e ) {
			haxe_CallStack.lastException = e;
			if (e instanceof js__$Boot_HaxeError) e = e.val;
			console.log("Exception deleting elements from the list. Restore to previous view." + Std.string(e));
		}
	}
	,handleEntitlementSelected: function(ev) {
		var element = ev.target;
		var _g = 0;
		while(_g < element.length) {
			var anOption = element[_g];
			++_g;
			var option = anOption;
			var optionElementKey = option.id;
			var entitlement = this.entitlementMap.get(optionElementKey);
			if(entitlement == null) throw new js__$Boot_HaxeError("Entitlement not found");
			entitlement.crudType = "Read";
			if(entitlement.nickName == null) entitlement.nickName = MBooks_$im.getSingleton().getNickName();
			if(entitlement.commandType == null) entitlement.commandType = view_Entitlement.MANAGE_ENTITLEMENTS_COMMAND;
			this.modelStream.resolve(entitlement);
		}
	}
	,__class__: view_Entitlement
};
var view_ListManager = function(list,idPrefix,opt,listDisplay) {
	this.listElement = list;
	this.prefix = idPrefix;
	this.optionId = opt;
	this.listDisplay = listDisplay;
	this.streamMap = new haxe_ds_StringMap();
	this.modelMap = new haxe_ds_StringMap();
};
view_ListManager.__name__ = ["view","ListManager"];
view_ListManager.prototype = {
	key: function(element) {
		return this.prefix + this.optionId(element);
	}
	,upsert: function(element) {
		return this.add(element);
	}
	,add: function(element) {
		console.log("Adding element " + Std.string(element));
		var optionElement = window.document.getElementById(this.key(element));
		if(optionElement == null) {
			console.log("Element not found creating a new option");
			optionElement = (function($this) {
				var $r;
				var _this = window.document;
				$r = _this.createElement("option");
				return $r;
			}(this));
			optionElement.id = this.key(element);
			optionElement.text = this.listDisplay(element);
			var stream = MBooks_$im.getSingleton().initializeElementStream(optionElement,"click");
			var key = this.key(element);
			this.streamMap.set(key,stream);
			var key1 = this.key(element);
			this.modelMap.set(key1,element);
			this.listElement.appendChild(optionElement);
			optionElement.selected = true;
			return stream;
		}
		return null;
	}
	,update: function(element) {
		var key = this.key(element);
		var optionElement = window.document.getElementById(key);
		if(optionElement == null) throw new js__$Boot_HaxeError("Element not found " + Std.string(element)); else {
			this.assertEquals(optionElement.id,key);
			optionElement.text = this.listDisplay(element);
			optionElement.selected = true;
		}
	}
	,assertEquals: function(a,b) {
		if(a != b) throw new js__$Boot_HaxeError("Assertion failed " + Std.string(a) + " not equal " + Std.string(b));
	}
	,'delete': function(element) {
		console.log("Deleting element " + Std.string(element));
		var key = this.key(element);
		var model = this.modelMap.get(key);
		this.modelMap.remove(key);
		this.removeFromList(key);
		var stream = this.streamMap.get(key);
		stream.end();
		this.streamMap.remove(key);
	}
	,clear: function() {
		console.log("Clearing list elements");
		var $it0 = this.modelMap.iterator();
		while( $it0.hasNext() ) {
			var entry = $it0.next();
			this.removeFromList(this.key(entry));
		}
		var $it1 = this.streamMap.iterator();
		while( $it1.hasNext() ) {
			var entry1 = $it1.next();
			entry1.end();
		}
		this.modelMap = new haxe_ds_StringMap();
		this.streamMap = new haxe_ds_StringMap();
	}
	,removeFromList: function(id) {
		var optionElement = window.document.getElementById(id);
		if(optionElement == null) {
			this.closeStream(id);
			throw new js__$Boot_HaxeError("Nothing to delete " + id);
		}
		optionElement.parentNode.removeChild(optionElement);
	}
	,closeStream: function(id) {
		console.log("Closing stream " + id);
		var stream = this.streamMap.get(id);
		if(stream != null) stream.end();
	}
	,__class__: view_ListManager
};
var view_OptionAnalyticsTable = function(optionType,optionColumnHeaders,symbol) {
	console.log("Creating option analytics table " + optionType + " for  " + symbol);
	this.optionType = optionType;
	this.tableHeaders = optionColumnHeaders;
	this.currentSymbol = symbol;
	this.optionAnalyticsMap = new haxe_ds_StringMap();
	this.optionAnalyticsMapUI = new haxe_ds_StringMap();
};
view_OptionAnalyticsTable.__name__ = ["view","OptionAnalyticsTable"];
view_OptionAnalyticsTable.prototype = {
	reset: function() {
		this.clear();
		this.optionType = "";
		this.currentSymbol = "";
		this.optionAnalyticsMap = new haxe_ds_StringMap();
		this.optionAnalyticsMapUI = new haxe_ds_StringMap();
	}
	,getTable: function() {
		var tableId = "";
		if(this.optionType == "call") tableId = view_OptionAnalyticsTable.OPTION_CALLS_TABLE; else if(this.optionType == "put") tableId = view_OptionAnalyticsTable.OPTION_PUTS_TABLE; else return null;
		return window.document.getElementById(tableId);
	}
	,key: function(anal) {
		return anal.optionChain.underlying + anal.optionType + anal.optionChain.symbol + Std.string(anal.optionChain.expiration);
	}
	,updateOptionAnalytics: function(payload) {
		console.log("Processing update option analytics element " + Std.string(payload));
		if(this.currentSymbol == "") {
			console.log("Ignoring this after clear " + Std.string(payload));
			return;
		}
		if(payload.optionType != this.optionType) {
			console.log("Ignoring this option type " + Std.string(payload));
			return;
		}
		if(payload.optionChain.underlying != this.currentSymbol) {
			console.log("Ignoring this symbol " + Std.string(payload));
			return;
		}
		var key = this.key(payload);
		var row = this.optionAnalyticsMap.get(key);
		if(row == null) {
			row = this.getTable().insertRow(1);
			this.insertCells(row,payload);
		} else {
			console.log("Clear the table and resort the elements.");
			this.sort(this.values(),$bind(this,this.sortByBidRatio));
			this.clear();
			this.draw();
		}
	}
	,values: function() {
		var elems = [];
		var $it0 = this.optionAnalyticsMap.iterator();
		while( $it0.hasNext() ) {
			var anOpt = $it0.next();
			elems.push(anOpt);
		}
		return elems;
	}
	,sort: function(optionAnalytics,sortFunction) {
		console.log("Sort the rows");
		optionAnalytics.sort(sortFunction);
		return optionAnalytics;
	}
	,abs: function(a) {
		if(a < 0) return a * -1;
		return a;
	}
	,sortByBidRatio: function(a,b) {
		var error = a.bidRatio - b.bidRatio;
		if(this.abs(error) < 0.00000001) return 0;
		if(error <= 0) return -1; else if(error > 0) return 1;
		console.log("Should never happen");
		return 0;
	}
	,draw: function() {
		console.log("Draw the table");
		var sortedValues = this.sort(this.values(),$bind(this,this.sortByBidRatio));
		var startIndex = 1;
		var _g = 0;
		while(_g < sortedValues.length) {
			var val = sortedValues[_g];
			++_g;
			var row = this.getTable().insertRow(startIndex);
			this.updateRow(row,val);
			startIndex = startIndex + 1;
		}
	}
	,clear: function() {
		console.log("Clearing the table " + Std.string(this));
		var startIndex = 1;
		var tableRows = this.getTable().rows;
		while(tableRows.length > 1) this.getTable().deleteRow(1);
	}
	,updateRow: function(aRow,payload) {
		console.log("Inserting cells for " + Std.string(payload));
		var key = this.key(payload);
		var optionAnalytics = this.optionAnalyticsMap.get(key);
		if(optionAnalytics == null) {
			this.optionAnalyticsMap.set(key,payload);
			var tableRowElement = this.optionAnalyticsMapUI.get(key);
			this.insertCells(tableRowElement,payload);
		} else {
			this.optionAnalyticsMap.set(key,payload);
			var tableRowElement1 = this.optionAnalyticsMapUI.get(key);
			this.clearCells(tableRowElement1);
			this.insertCells(tableRowElement1,payload);
		}
	}
	,insertCells: function(aRow,payload) {
		console.log("Inserting cells " + Std.string(payload));
		var newCell = aRow.insertCell(0);
		newCell.innerHTML = payload.optionChain.symbol;
		newCell = aRow.insertCell(1);
		newCell.innerHTML = payload.optionType;
		newCell = aRow.insertCell(2);
		newCell.innerHTML = "" + Std.string(payload.optionChain.expiration);
		newCell = aRow.insertCell(3);
		newCell.innerHTML = payload.optionChain.lastBid;
		newCell = aRow.insertCell(4);
		newCell.innerHTML = "" + payload.optionChain.lastAsk;
		newCell = aRow.insertCell(5);
		newCell.innerHTML = "" + payload.bidRatio;
		newCell = aRow.insertCell(6);
		newCell.innerHTML = "" + payload.price;
	}
	,clearCells: function(aRow) {
		var cells = aRow.cells;
		var _g = 0;
		while(_g < cells.length) {
			var c = cells[_g];
			++_g;
			var cell = c;
			aRow.deleteCell(cell.cellIndex);
		}
	}
	,__class__: view_OptionAnalyticsTable
};
var view_OptionAnalyticsView = function() {
	var pStream = MBooks_$im.getSingleton().initializeElementStream(this.getRetrieveUnderlying(),"click");
	pStream.then($bind(this,this.populateOptionAnalyticsTables));
	var qStream = MBooks_$im.getSingleton().initializeElementStream(this.getClearUnderlying(),"click");
	qStream.then($bind(this,this.clearOptionAnalyticsTable));
};
view_OptionAnalyticsView.__name__ = ["view","OptionAnalyticsView"];
view_OptionAnalyticsView.prototype = {
	getRetrieveUnderlying: function() {
		return window.document.getElementById(view_OptionAnalyticsView.RETRIEVE_UNDERLYING);
	}
	,getClearUnderlying: function() {
		return window.document.getElementById(view_OptionAnalyticsView.CLEAR_UNDERLYING);
	}
	,getUnderlying: function() {
		return window.document.getElementById(view_OptionAnalyticsView.UNDERLYING);
	}
	,getOptionCallHeaders: function() {
		var result = [];
		result.push("Option Symbol");
		result.push("Calls");
		result.push("Last Bid");
		result.push("Last Ask");
		result.push("Bid ratio");
		result.push("Theoretical Eu Asian Option Price");
		return result;
	}
	,getOptionPutHeaders: function() {
		var result = [];
		result.push("Option Symbol");
		result.push("Puts");
		result.push("Last Bid");
		result.push("Last Ask");
		result.push("Bid ratio");
		result.push("Theoretical Eu Asian Option Price");
		return result;
	}
	,clearOptionAnalyticsTable: function(ev) {
		this.getUnderlying().value = "";
		this.callTable.reset();
		this.putTable.reset();
	}
	,populateOptionAnalyticsTables: function(ev) {
		console.log("Creating puts and calls for the table " + this.getUnderlying().value);
		this.callTable = new view_OptionAnalyticsTable("call",this.getOptionCallHeaders(),this.getUnderlying().value);
		this.putTable = new view_OptionAnalyticsTable("put",this.getOptionPutHeaders(),this.getUnderlying().value);
		MBooks_$im.getSingleton().optionAnalyticsStream.then(($_=this.callTable,$bind($_,$_.updateOptionAnalytics)));
		MBooks_$im.getSingleton().optionAnalyticsStream.then(($_=this.putTable,$bind($_,$_.updateOptionAnalytics)));
	}
	,__class__: view_OptionAnalyticsView
};
var view_Portfolio = function() {
	console.log("Creating new portfolio view");
	this.activePortfolioStream = new promhx_Deferred();
	this.setupEvents();
	this.activePortfolioStream.then($bind(this,this.updateActivePortfolio));
};
view_Portfolio.__name__ = ["view","Portfolio"];
view_Portfolio.prototype = {
	setupEvents: function() {
		console.log("Setting up ui events");
		var saveP = MBooks_$im.getSingleton().initializeElementStream(this.getSavePortfolioButton(),"click");
		saveP.then($bind(this,this.savePortfolio));
		var updateP = MBooks_$im.getSingleton().initializeElementStream(this.getUpdatePortfolioButton(),"click");
		updateP.then($bind(this,this.updatePortfolio));
		var deleteP = MBooks_$im.getSingleton().initializeElementStream(this.getDeletePortfolioButton(),"click");
		deleteP.then($bind(this,this.deletePortfolio));
		var portfolioListEvent = MBooks_$im.getSingleton().initializeElementStream(this.getPortfolioList(),"change");
		portfolioListEvent.then($bind(this,this.portfolioListChanged));
		MBooks_$im.getSingleton().portfolioListStream.then($bind(this,this.processPortfolioList));
		MBooks_$im.getSingleton().activeCompanyStream.then($bind(this,this.processActiveCompany));
		MBooks_$im.getSingleton().portfolioStream.then($bind(this,this.processManagePortfolio));
		this.getPortfoliosForUser();
	}
	,updateActivePortfolio: function(p) {
		this.activePortfolio = p;
	}
	,processActiveCompany: function(selected) {
		console.log("Company selected for portfolio processing " + Std.string(selected));
		this.activeCompany = selected;
		this.getPortfoliosForUser();
	}
	,deletePortfolio: function(ev) {
		console.log("Delete portfolio " + Std.string(ev));
		this.deletePortfolioI();
	}
	,savePortfolio: function(ev) {
		console.log("Saving portfolio " + Std.string(ev));
		if(this.activePortfolio == null) {
			console.log("Inserting as no active portfolio selected");
			this.insertPortfolioI();
		} else this.updatePortfolioI();
	}
	,updatePortfolio: function(ev) {
		console.log("Update portfolio " + Std.string(ev));
		if(this.activePortfolio == null) console.log("Selected portfolio null. Not updating"); else this.updatePortfolioI();
	}
	,readPortfolio: function(portfolioId) {
		var portfolioT = { crudType : "Read", commandType : "ManagePortfolio", portfolioId : portfolioId, companyId : this.activeCompany.companyId, userId : MBooks_$im.getSingleton().getNickName(), summary : this.getPortfolioSummary(), createdBy : MBooks_$im.getSingleton().getNickName(), updatedBy : MBooks_$im.getSingleton().getNickName(), nickName : MBooks_$im.getSingleton().getNickName()};
		MBooks_$im.getSingleton().doSendJSON(portfolioT);
	}
	,insertPortfolioI: function() {
		var portfolioT = { crudType : "Create", commandType : "ManagePortfolio", portfolioId : "-1", companyId : this.activeCompany.companyId, userId : MBooks_$im.getSingleton().getNickName(), summary : this.getPortfolioSummary(), createdBy : MBooks_$im.getSingleton().getNickName(), updatedBy : MBooks_$im.getSingleton().getNickName(), nickName : MBooks_$im.getSingleton().getNickName()};
		MBooks_$im.getSingleton().doSendJSON(portfolioT);
	}
	,updatePortfolioI: function() {
		var portfolioT = { crudType : "P_Update", commandType : "ManagePortfolio", portfolioId : this.activePortfolio.portfolioId, companyId : this.activeCompany.companyId, userId : MBooks_$im.getSingleton().getNickName(), summary : this.getPortfolioSummary(), createdBy : MBooks_$im.getSingleton().getNickName(), updatedBy : MBooks_$im.getSingleton().getNickName(), nickName : MBooks_$im.getSingleton().getNickName()};
		MBooks_$im.getSingleton().doSendJSON(portfolioT);
	}
	,deletePortfolioI: function() {
		var portfolioT = { crudType : "Delete", commandType : "ManagePortfolio", portfolioId : this.activePortfolio.portfolioId, companyId : this.activeCompany.companyId, userId : MBooks_$im.getSingleton().getNickName(), summary : this.getPortfolioSummary(), createdBy : MBooks_$im.getSingleton().getNickName(), updatedBy : MBooks_$im.getSingleton().getNickName(), nickName : MBooks_$im.getSingleton().getNickName()};
		MBooks_$im.getSingleton().doSendJSON(portfolioT);
	}
	,setPortfolioSummary: function(aSummary) {
		this.getPortfolioSummaryElement().value = aSummary;
	}
	,getPortfolioSummary: function() {
		return this.getPortfolioSummaryElement().value;
	}
	,getPortfolioSummaryElement: function() {
		var sumButton = window.document.getElementById(view_Portfolio.PORTFOLIO_SUMMARY);
		return sumButton;
	}
	,getSavePortfolioButton: function() {
		var saveButton = window.document.getElementById(view_Portfolio.SAVE_PORTFOLIO);
		return saveButton;
	}
	,getUpdatePortfolioButton: function() {
		var updateButton = window.document.getElementById(view_Portfolio.UPDATE_PORTFOLIO);
		return updateButton;
	}
	,getPortfolioList: function() {
		return window.document.getElementById(view_Portfolio.PORTFOLIO_LIST_FIELD);
	}
	,getDeletePortfolioButton: function() {
		var deleteButton = window.document.getElementById(view_Portfolio.DELETE_PORTFOLIO);
		return deleteButton;
	}
	,processPortfolioList: function(incomingPayload) {
		console.log("Processing portfolio list " + Std.string(incomingPayload));
		var results = incomingPayload.resultSet;
		var _g = 0;
		while(_g < results.length) {
			var p = results[_g];
			++_g;
			if(p.Right != null) this.updatePortfolioList(p.Right); else MBooks_$im.getSingleton().applicationErrorStream.resolve(incomingPayload);
		}
	}
	,processManagePortfolio: function(incomingMessage) {
		console.log("Incoming message manage portfolio " + Std.string(incomingMessage));
		if(incomingMessage.Right != null) {
			this.updatePortfolioList(incomingMessage.Right);
			this.copyIncomingValues(incomingMessage.Right);
			this.activePortfolioStream.resolve(incomingMessage.Right);
			if(incomingMessage.Right.crudType == "Delete") this.deletePortfolioEntry(incomingMessage.Right); else this.updatePortfolioEntry(incomingMessage.Right);
		} else if(incomingMessage.Left != null) MBooks_$im.getSingleton().applicationErrorStream.resolve(incomingMessage.Left);
	}
	,copyIncomingValues: function(input) {
		this.setPortfolioSummary(input.summary);
	}
	,getPortfoliosForUser: function() {
		if(this.activeCompany == null) {
			console.log("No company selected");
			return;
		}
		var portfolioQuery = { commandType : "QueryPortfolios", nickName : MBooks_$im.getSingleton().getNickName(), companyId : this.activeCompany.companyId, userId : MBooks_$im.getSingleton().getNickName(), resultSet : []};
		console.log("Sending " + Std.string(portfolioQuery));
		MBooks_$im.getSingleton().doSendJSON(portfolioQuery);
	}
	,portfolioListChanged: function(event) {
		console.log("Portfolio list changed " + Std.string(event));
		var portfolioList = event.target;
		var _g = 0;
		var _g1 = portfolioList.selectedOptions;
		while(_g < _g1.length) {
			var portfolio = _g1[_g];
			++_g;
			var pOption = portfolio;
			if(pOption.text == "--Choose--") this.activePortfolio = null; else this.readPortfolio(pOption.id);
			console.log("Handling " + pOption.id + "->" + pOption.text);
		}
	}
	,updatePortfolioEntry: function(update) {
		var optionElement = window.document.getElementById(update.portfolioId);
		if(optionElement != null) optionElement.selected = true; else throw new js__$Boot_HaxeError("Option element for portfolio Id not found " + Std.string(update));
	}
	,deletePortfolioEntry: function(deleteMe) {
		console.log("Deleting portfolio " + Std.string(deleteMe));
		var optionElement = window.document.getElementById(deleteMe.portfolioId);
		if(optionElement != null) {
			this.getPortfolioList().removeChild(optionElement);
			this.clearValues();
		} else console.log("Nothing to delete");
	}
	,clearValues: function() {
		this.setPortfolioSummary("");
	}
	,updatePortfolioList: function(portfolioObject) {
		var portfolioList = this.getPortfolioList();
		var portfolioId = portfolioObject.portfolioId;
		var optionElement = window.document.getElementById(portfolioId);
		if(optionElement == null) {
			optionElement = (function($this) {
				var $r;
				var _this = window.document;
				$r = _this.createElement("option");
				return $r;
			}(this));
			optionElement.id = portfolioId;
			optionElement.text = portfolioObject.summary;
			portfolioList.appendChild(optionElement);
		} else optionElement.text = portfolioObject.summary;
	}
	,__class__: view_Portfolio
};
var view_PortfolioSymbol = function(m) {
	console.log("Instantiating new portfolio symbol view");
	this.model = m;
	this.rowMap = new haxe_ds_StringMap();
	this.portfolioMap = new haxe_ds_StringMap();
	this.setupStreams();
};
view_PortfolioSymbol.__name__ = ["view","PortfolioSymbol"];
view_PortfolioSymbol.prototype = {
	getUploadPortfolioFile: function() {
		return window.document.getElementById(view_PortfolioSymbol.UPLOAD_PORTFOLIO_FILE);
	}
	,getUploadPortfolioButton: function() {
		return window.document.getElementById(view_PortfolioSymbol.UPLOAD_PORTFOLIO_BUTTON);
	}
	,getPortfolioSymbolTable: function() {
		return window.document.getElementById(view_PortfolioSymbol.PORTFOLIO_SYMBOL_TABLE);
	}
	,getDeletePortfolioSymbolButton: function() {
		return window.document.getElementById(view_PortfolioSymbol.DELETE_SYMBOL_BUTTON);
	}
	,getUpdatePortfolioSymbolButton: function() {
		return window.document.getElementById(view_PortfolioSymbol.UPDATE_SYMBOL_BUTTON);
	}
	,getInsertPortfolioSymbolButton: function() {
		return window.document.getElementById(view_PortfolioSymbol.SAVE_SYMBOL_BUTTON);
	}
	,getQuantityValueElement: function() {
		return window.document.getElementById(view_PortfolioSymbol.SYMBOL_QUANTITY_ID);
	}
	,getQuantityValue: function() {
		return this.getQuantityValueElement().value;
	}
	,setQuantityValue: function(aValue) {
		this.getQuantityValueElement().value = "";
	}
	,getSymbolIdElement: function() {
		return window.document.getElementById(view_PortfolioSymbol.SYMBOL_ID_FIELD);
	}
	,getSymbolIdValue: function() {
		return this.getSymbolIdElement().value.toUpperCase();
	}
	,setSymbolIdValue: function(anId) {
		this.getSymbolIdElement().value = anId;
	}
	,getSymbolTypeElement: function() {
		return window.document.getElementById(view_PortfolioSymbol.SYMBOL_TYPE_LIST);
	}
	,getSymbolSideElement: function() {
		return window.document.getElementById(view_PortfolioSymbol.SYMBOL_SIDE_LIST);
	}
	,getSelectedOptionElement: function(inputList,multiSelect) {
		var selectedOptions = inputList.selectedOptions;
		if(multiSelect) {
			console.log("Multiple selection true. What can we do here?");
			throw new js__$Boot_HaxeError("Multiple selection list not supported for this method");
		} else {
			var optionElement = selectedOptions.item(0);
			return optionElement.text;
		}
	}
	,getSymbolTypeValue: function() {
		var multiSelect = false;
		return this.getSelectedOptionElement(this.getSymbolTypeElement(),multiSelect);
	}
	,getSymbolSideValue: function() {
		var multiSelect = false;
		return this.getSelectedOptionElement(this.getSymbolSideElement(),multiSelect);
	}
	,setupStreams: function() {
		this.model.sideStream.then($bind(this,this.updateSidesStream));
		this.model.typeStream.then($bind(this,this.updateTypesStream));
		var deleteP = MBooks_$im.getSingleton().initializeElementStream(this.getDeletePortfolioSymbolButton(),"click");
		deleteP.then($bind(this,this.deletePortfolioSymbol));
		var updateP = MBooks_$im.getSingleton().initializeElementStream(this.getUpdatePortfolioSymbolButton(),"click");
		updateP.then($bind(this,this.updatePortfolioSymbol));
		var insertP = MBooks_$im.getSingleton().initializeElementStream(this.getInsertPortfolioSymbolButton(),"click");
		insertP.then($bind(this,this.insertPortfolioSymbol));
		this.insertStreamResponse = new promhx_Deferred();
		this.updateStreamResponse = new promhx_Deferred();
		this.deleteStreamResponse = new promhx_Deferred();
		this.readStreamResponse = new promhx_Deferred();
		this.insertStreamResponse.then($bind(this,this.insertResponse));
		this.updateStreamResponse.then($bind(this,this.updateResponse));
		this.deleteStreamResponse.then($bind(this,this.deleteResponse));
		this.insertStreamResponse.then($bind(this,this.createChart));
		this.updateStreamResponse.then($bind(this,this.updateChart));
		this.deleteStreamResponse.then($bind(this,this.deleteChart));
		this.readStreamResponse.then($bind(this,this.readResponse));
		this.symbolQueryResponse = new promhx_Deferred();
		this.symbolQueryResponse.then($bind(this,this.handleQueryResponse));
		MBooks_$im.getSingleton().marketDataStream.then($bind(this,this.updateMarketData));
		MBooks_$im.getSingleton().portfolio.activePortfolioStream.then($bind(this,this.processActivePortfolio));
		MBooks_$im.getSingleton().historicalPriceStream.then($bind(this,this.updateHistoricalPrice));
		var uploadPortfolioButtonStream = MBooks_$im.getSingleton().initializeElementStream(this.getUploadPortfolioButton(),"click");
		uploadPortfolioButtonStream.then($bind(this,this.uploadPortfolio));
	}
	,uploadPortfolio: function(ev) {
		console.log("Save button pressed");
		var files = this.getUploadPortfolioFile().files;
		var _g = 0;
		while(_g < files.length) {
			var file = files[_g];
			++_g;
			var reader = new FileReader();
			var stream_1 = MBooks_$im.getSingleton().initializeElementStream(reader,"load");
			stream_1.then($bind(this,this.processFileUpload));
			reader.readAsText(file);
		}
	}
	,headerRowChecked: function() {
		var headerChecked = window.document.getElementById(view_PortfolioSymbol.HEADER_ROW_PRESENT);
		return headerChecked.checked;
	}
	,parsePortfolioDetails: function(fileContents) {
		console.log("Parsing portfolio details");
		var portfolioDetails = format_csv_Reader.parseCsv(fileContents);
		var headerRead = this.headerRowChecked();
		var _g = 0;
		while(_g < portfolioDetails.length) {
			var aRecord = portfolioDetails[_g];
			++_g;
			var a = aRecord;
			if(a.length == 4) {
				if(headerRead == true) this.insertPortfolioSymbolI(StringTools.trim(a[0]),StringTools.trim(a[1]),StringTools.trim(a[2]),StringTools.trim(a[3])); else console.log("Skipping " + Std.string(aRecord));
			} else console.log("Invalid record length " + Std.string(aRecord));
			headerRead = true;
		}
	}
	,processFileUpload: function(ev) {
		console.log("Processing file upload ");
		try {
			var reader = ev.target;
			console.log("Reading");
			this.parsePortfolioDetails(reader.result);
			console.log("Read");
		} catch( e ) {
			haxe_CallStack.lastException = e;
			if (e instanceof js__$Boot_HaxeError) e = e.val;
			console.log("Exception " + Std.string(e));
		}
	}
	,computeInsertIndex: function() {
		return 1;
	}
	,getKey: function(payload) {
		if(payload == null) throw new js__$Boot_HaxeError("Get failed. No payload");
		return payload.symbol + payload.side + payload.symbolType + payload.portfolioId;
	}
	,processActivePortfolio: function(a) {
		console.log("Deleting all the existing rows as active portfolio changed " + Std.string(a));
		var $it0 = this.rowMap.keys();
		while( $it0.hasNext() ) {
			var key = $it0.next();
			console.log("Deleting key " + key);
			var row = this.rowMap.get(key);
			var pSymbolTable = this.getPortfolioSymbolTable();
			pSymbolTable.deleteRow(row.rowIndex);
		}
		MBooks_$im.getSingleton().symbolChart.deleteAll();
		this.rowMap = new haxe_ds_StringMap();
	}
	,deleteTableRowMap: function(payload) {
		console.log("Deleting table row map " + Std.string(payload));
		var key = this.getKey(payload);
		console.log("Deleting key " + key);
		if(!this.rowMap.exists(key)) {
			console.log("Nothing to delete " + Std.string(payload));
			return;
		}
		var row = this.rowMap.get(key);
		this.rowMap.remove(key);
		var pSymbolTable = this.getPortfolioSymbolTable();
		pSymbolTable.deleteRow(row.rowIndex);
	}
	,updateTableRowMap: function(payload) {
		var key = this.getKey(payload);
		var row = this.rowMap.get(key);
		if(MBooks_$im.getSingleton().portfolio.activePortfolio == null) {
			console.log("Throwing message" + Std.string(payload));
			return;
		}
		if(payload.portfolioId != MBooks_$im.getSingleton().portfolio.activePortfolio.portfolioId) {
			console.log("Throwing message " + Std.string(payload));
			return;
		}
		if(row == null) {
			var pSymbolTable = this.getPortfolioSymbolTable();
			row = pSymbolTable.insertRow(this.computeInsertIndex());
			this.rowMap.set(key,row);
			this.insertCells(row,payload);
			this.createChart(payload);
		} else {
			var cells = row.children;
			var _g = 0;
			while(_g < cells.length) {
				var cell = cells[_g];
				++_g;
				var cellI = cell;
				var cellIndex = cellI.cellIndex;
				this.updateChart(payload);
				switch(cellIndex) {
				case 0:
					cellI.innerHTML = payload.symbol;
					break;
				case 1:
					cellI.innerHTML = payload.side;
					break;
				case 2:
					cellI.innerHTML = payload.symbolType;
					break;
				case 3:
					cellI.innerHTML = payload.quantity;
					break;
				case 4:
					cellI.innerHTML = payload.value;
					break;
				case 5:
					cellI.innerHTML = payload.stressValue;
					break;
				case 6:
					var _this = new Date();
					cellI.innerHTML = HxOverrides.dateStr(_this);
					break;
				}
			}
		}
	}
	,insertCells: function(aRow,payload) {
		if(payload.portfolioId != MBooks_$im.getSingleton().portfolio.activePortfolio.portfolioId) {
			console.log("Throwing away payload " + Std.string(payload));
			return;
		}
		console.log("Inserting cells from payload " + Std.string(payload));
		var newCell = aRow.insertCell(0);
		newCell.innerHTML = payload.symbol;
		newCell = aRow.insertCell(1);
		newCell.innerHTML = payload.side;
		newCell = aRow.insertCell(2);
		newCell.innerHTML = payload.symbolType;
		newCell = aRow.insertCell(3);
		newCell.innerHTML = payload.quantity;
		newCell = aRow.insertCell(4);
		newCell.innerHTML = payload.value;
		newCell = aRow.insertCell(5);
		newCell.innerHTML = payload.stressValue;
		newCell = aRow.insertCell(6);
		var _this = new Date();
		newCell.innerHTML = HxOverrides.dateStr(_this);
	}
	,createChart: function(payload) {
		console.log("Creating chart");
		this.sendHistoricalQuery(payload);
	}
	,sendHistoricalQuery: function(payload) {
		var query = "select historical for " + payload.symbol + ";";
		var payload1 = { commandType : view_PortfolioSymbol.QUERY_MARKET_DATA, nickName : MBooks_$im.getSingleton().getNickName(), symbol : query, portfolioId : payload.portfolioId, resultSet : []};
		MBooks_$im.getSingleton().doSendJSON(payload1);
	}
	,insertResponse: function(payload) {
		console.log("Inserting view " + Std.string(payload));
		this.updateTableRowMap(payload);
	}
	,updateResponse: function(payload) {
		this.updateTableRowMap(payload);
	}
	,updateChart: function(payload) {
		console.log("Updating chart " + Std.string(payload));
	}
	,deleteResponse: function(payload) {
		console.log("Deleting view " + Std.string(payload));
		this.deleteTableRowMap(payload);
	}
	,deleteChart: function(payload) {
		console.log("Delete chart " + Std.string(payload));
		MBooks_$im.getSingleton().symbolChart["delete"](payload);
		MBooks_$im.getSingleton().historicalPriceStream.resolve(payload);
	}
	,readResponse: function(payload) {
		console.log("Reading view " + Std.string(payload));
		throw new js__$Boot_HaxeError("Read response Not implemented");
	}
	,getPortfolioId: function() {
		if(this.model == null) throw new js__$Boot_HaxeError("Model not defined");
		return this.model.activePortfolio.portfolioId;
	}
	,insertPortfolioSymbolI: function(aSymbol,aSymbolType,aSide,quantity) {
		console.log("Inserting portfolio symbol through upload ");
		var portfolioSymbolT = { crudType : "Create", commandType : "ManagePortfolioSymbol", portfolioId : this.getPortfolioId(), symbol : aSymbol, quantity : quantity, side : aSide, symbolType : aSymbolType, value : "0.0", stressValue : "0.0", creator : MBooks_$im.getSingleton().getNickName(), updator : MBooks_$im.getSingleton().getNickName(), nickName : MBooks_$im.getSingleton().getNickName()};
		this.model.insertStream.resolve(portfolioSymbolT);
	}
	,insertPortfolioSymbol: function(ev) {
		console.log("Insert portfolio symbol " + Std.string(ev));
		console.log("Symbol side " + this.getSymbolSideValue());
		console.log("Symbol type " + this.getSymbolTypeValue());
		var portfolioSymbolT = { crudType : "Create", commandType : "ManagePortfolioSymbol", portfolioId : this.getPortfolioId(), symbol : this.getSymbolIdValue(), quantity : this.getQuantityValue(), side : this.getSymbolSideValue(), symbolType : this.getSymbolTypeValue(), value : "0.0", stressValue : "0.0", creator : MBooks_$im.getSingleton().getNickName(), updator : MBooks_$im.getSingleton().getNickName(), nickName : MBooks_$im.getSingleton().getNickName()};
		this.model.insertStream.resolve(portfolioSymbolT);
	}
	,updatePortfolioSymbol: function(ev) {
		console.log("Update portfolio symbol " + Std.string(ev));
		var portfolioSymbolT = { crudType : "P_Update", commandType : "ManagePortfolioSymbol", portfolioId : this.getPortfolioId(), symbol : this.getSymbolIdValue(), quantity : this.getQuantityValue(), side : this.getSymbolSideValue(), symbolType : this.getSymbolTypeValue(), value : "0.0", stressValue : "0.0", creator : MBooks_$im.getSingleton().getNickName(), updator : MBooks_$im.getSingleton().getNickName(), nickName : MBooks_$im.getSingleton().getNickName()};
		this.model.updateStream.resolve(portfolioSymbolT);
	}
	,deletePortfolioSymbol: function(ev) {
		console.log("Delete portfolio symbol " + Std.string(ev));
		var portfolioSymbolT = { crudType : "Delete", commandType : "ManagePortfolioSymbol", portfolioId : this.getPortfolioId(), symbol : this.getSymbolIdValue(), quantity : this.getQuantityValue(), side : this.getSymbolSideValue(), symbolType : this.getSymbolTypeValue(), value : "0.0", 'stressValue' : "0.0", creator : MBooks_$im.getSingleton().getNickName(), updator : MBooks_$im.getSingleton().getNickName(), nickName : MBooks_$im.getSingleton().getNickName()};
		this.model.deleteStream.resolve(portfolioSymbolT);
	}
	,readPortfolio: function(someEvent) {
		var portfolioSymbolT = { crudType : "Delete", commandType : "ManagePortfolioSymbol", portfolioId : "getPortfolioId()", symbol : this.getSymbolIdValue(), quantity : this.getQuantityValue(), side : this.getSymbolSideValue(), symbolType : this.getSymbolTypeValue(), value : "", stressValue : "0.0", creator : MBooks_$im.getSingleton().getNickName(), updator : MBooks_$im.getSingleton().getNickName(), nickName : MBooks_$im.getSingleton().getNickName()};
		this.model.readStream.resolve(portfolioSymbolT);
	}
	,updateSidesStream: function(symbolSide) {
		console.log("Resolving symbol side " + Std.string(symbolSide));
		if(symbolSide == null) {
			console.log("Invalid symbol side ");
			return;
		}
		var symbolSideList = this.getSymbolSideList();
		var optionId = view_PortfolioSymbol.SYMBOL_SIDE_LIST + "_" + symbolSide.symbolSide;
		var optionElement = window.document.getElementById(optionId);
		if(optionElement == null) {
			optionElement = (function($this) {
				var $r;
				var _this = window.document;
				$r = _this.createElement("option");
				return $r;
			}(this));
			optionElement.id = optionId;
			optionElement.text = symbolSide.symbolSide;
			var selectSymbolSideStream = MBooks_$im.getSingleton().initializeElementStream(optionElement,"click");
			selectSymbolSideStream.then($bind(this,this.handleSymbolSideSelected));
			symbolSideList.appendChild(optionElement);
		}
	}
	,updateTypesStream: function(symbolType) {
		console.log("Resolving symbol type " + Std.string(symbolType));
		if(symbolType == null) {
			console.log("Invalid symbol type ");
			return;
		}
		var symbolTypeList = this.getSymbolTypeList();
		var optionId = view_PortfolioSymbol.SYMBOL_TYPE_LIST + symbolType.symbolType;
		var optionElement = window.document.getElementById(optionId);
		if(optionElement == null) {
			optionElement = (function($this) {
				var $r;
				var _this = window.document;
				$r = _this.createElement("option");
				return $r;
			}(this));
			optionElement.id = optionId;
			optionElement.text = symbolType.symbolType;
			var stream = MBooks_$im.getSingleton().initializeElementStream(optionElement,"click");
			stream.then($bind(this,this.handleSymbolTypeSelected));
			symbolTypeList.appendChild(optionElement);
		}
	}
	,handleSymbolSideSelected: function(ev) {
		console.log("handle symbol side selected " + Std.string(ev));
	}
	,handleSymbolTypeSelected: function(ev) {
		console.log("handle symbol type selected " + Std.string(ev));
	}
	,getSymbolSideList: function() {
		return window.document.getElementById(view_PortfolioSymbol.SYMBOL_SIDE_LIST);
	}
	,getSymbolTypeList: function() {
		return window.document.getElementById(view_PortfolioSymbol.SYMBOL_TYPE_LIST);
	}
	,clearFields: function() {
		this.setQuantityValue("");
		this.setSymbolIdValue("");
	}
	,manage: function(incomingMessage1) {
		console.log("Manage portfolio symbol " + Std.string(incomingMessage1));
		if(incomingMessage1.Right != null) {
			var incomingMessage = incomingMessage1.Right;
			if(incomingMessage.crudType == "Create") this.insertStreamResponse.resolve(incomingMessage); else if(incomingMessage.crudType == "P_Update") this.updateStreamResponse.resolve(incomingMessage); else if(incomingMessage.crudType == "Read") this.readStreamResponse.resolve(incomingMessage); else if(incomingMessage.crudType == "Delete") this.deleteStreamResponse.resolve(incomingMessage); else throw new js__$Boot_HaxeError("Undefined crud type " + Std.string(incomingMessage));
		} else MBooks_$im.getSingleton().applicationErrorStream.resolve(incomingMessage1);
	}
	,handleQueryResponse: function(incomingMessage) {
		console.log("Processing symbol query response " + Std.string(incomingMessage));
		if(incomingMessage.Left != null) MBooks_$im.getSingleton().applicationErrorStream.resolve(incomingMessage); else {
			if(incomingMessage.Right.resultSet == null) {
				console.log("Result set is not defined??");
				MBooks_$im.getSingleton().applicationErrorStream.resolve(incomingMessage);
				return;
			}
			var pS = incomingMessage.Right;
			var _g = 0;
			var _g1 = pS.resultSet;
			while(_g < _g1.length) {
				var i = _g1[_g];
				++_g;
				if(i.Right != null) this.updateTableRowMap(i.Right); else if(i.Left != null) MBooks_$im.getSingleton().applicationErrorStream.resolve(i);
			}
		}
	}
	,updateMarketData: function(incomingMessage) {
		console.log("Inside update market data response " + Std.string(incomingMessage));
		this.updateTableRowMap(incomingMessage);
	}
	,updateHistoricalPrice: function(incomingMessage) {
		console.log("Creating/updating chart " + Std.string(incomingMessage));
	}
	,__class__: view_PortfolioSymbol
};
var view_SymbolChart = function(historicalPriceStream,stressValueStream) {
	this.max_buf_size = 70;
	this.STRESS_VALUE_INDEX = 1;
	historicalPriceStream.then($bind(this,this.createUpdateChart));
	stressValueStream.then($bind(this,this.updateStressValues));
	this.chartMap = new haxe_ds_StringMap();
	this.lineDataMap = new haxe_ds_StringMap();
	this.stressValueBufferSize = 50;
	this.historicalStressValueBuffer = new haxe_ds_StringMap();
	this.historicalPriceBuffer = new haxe_ds_StringMap();
};
view_SymbolChart.__name__ = ["view","SymbolChart"];
view_SymbolChart.prototype = {
	getPortfolioCharts: function() {
		return window.document.getElementById(view_SymbolChart.PORTFOLIO_CHARTS);
	}
	,getKeyS: function(portfolioId,symbol) {
		return portfolioId + "_" + symbol;
	}
	,getKey: function(historicalPrice) {
		return this.getKeyS(historicalPrice.portfolioId,historicalPrice.symbol);
	}
	,createUpdateChart: function(historicalPrice) {
		console.log("Creating chart for historical price" + Std.string(historicalPrice));
		if(historicalPrice.Right != null) {
			if(historicalPrice.Right.query != null) {
				var i = historicalPrice.Right.query;
				var _g = 0;
				while(_g < i.length) {
					var q = i[_g];
					++_g;
					try {
						this.createCanvasElement(q);
					} catch( e ) {
						haxe_CallStack.lastException = e;
						if (e instanceof js__$Boot_HaxeError) e = e.val;
						console.log("Error adding canvas element " + Std.string(e));
					}
				}
			}
		}
	}
	,getMonthText: function(i) {
		switch(i) {
		case 0:
			return "Jan";
		case 1:
			return "Feb";
		case 2:
			return "Mar";
		case 3:
			return "Apr";
		case 4:
			return "May";
		case 5:
			return "Jun";
		case 6:
			return "Jul";
		case 7:
			return "Aug";
		case 8:
			return "Sep";
		case 9:
			return "Oct";
		case 10:
			return "Nov";
		case 11:
			return "Dec";
		default:
			throw new js__$Boot_HaxeError("Invalid month: " + i);
		}
	}
	,format: function(x) {
		return x.getFullYear() + "-" + this.getMonthText(x.getMonth()) + "-" + x.getDate();
	}
	,parseDate: function(x) {
		try {
			var dateTimeComponents = x.split("T");
			var dateComponents = dateTimeComponents[0].split("-");
			var year = dateComponents[0];
			var month = dateComponents[1];
			var day = dateComponents[2];
			return new Date(Std.parseInt(year),Std.parseInt(month) - 1,Std.parseInt(day),0,0,0);
		} catch( err ) {
			haxe_CallStack.lastException = err;
			if (err instanceof js__$Boot_HaxeError) err = err.val;
			console.log("Error parsing " + x);
			return null;
		}
	}
	,dateSort: function(d1,d2) {
		var d1f = d1.getTime();
		var d2f = d2.getTime();
		if(d1f == d2f) return 0;
		if(d1f < d2f) return -1;
		return 1;
	}
	,sortHistoricalStress: function(x,y) {
		return this.dateSort(this.parseDate(x.date),this.parseDate(y.date));
	}
	,sortByDate: function(x,y) {
		try {
			var d1 = this.parseDate(x.date);
			var d2 = this.parseDate(y.date);
			return this.dateSort(d1,d2);
		} catch( err ) {
			haxe_CallStack.lastException = err;
			if (err instanceof js__$Boot_HaxeError) err = err.val;
			console.log("Error parsing " + Std.string(x) + "-" + Std.string(y));
			return -1;
		}
	}
	,updateStressValues: function(stressValue) {
		if(stressValue == null) {
			console.log("Ignoring stress value");
			return;
		}
		if(MBooks_$im.getSingleton().portfolio.activePortfolio.portfolioId != stressValue.portfolioId) {
			console.log("Ignoring non active portfolio " + stressValue.portfolioId);
			return;
		}
		var key = stressValue.portfolioId + "_" + stressValue.portfolioId;
		var bufSize = this.updateBuffer(key,stressValue);
		if(this.isBufferFull(bufSize,this.historicalPriceBuffer.get(key))) {
			this.redrawChart(key);
			this.clearBuffer(key);
		}
	}
	,isBufferFull: function(bufSize,historicalPriceMap) {
		var historicalPriceMapCount = this.count(historicalPriceMap);
		console.log("Buffer size " + bufSize + " " + historicalPriceMapCount);
		return bufSize == this.max_buf_size;
	}
	,count: function(anObjectMap) {
		var count = 0;
		if(anObjectMap == null) return count;
		var iterator = anObjectMap.keys();
		while( iterator.hasNext() ) {
			var i = iterator.next();
			console.log("Map key " + Std.string(i));
			count = count + 1;
		}
		return count;
	}
	,updateHistoricalPrice: function(key,historicalPrice) {
		var historicalPriceMap = this.historicalPriceBuffer.get(key);
		if(historicalPriceMap == null) {
			historicalPriceMap = new haxe_ds_ObjectMap();
			this.historicalPriceBuffer.set(key,historicalPriceMap);
		}
		historicalPriceMap.set(this.parseDate(historicalPrice.date),historicalPrice);
	}
	,updateBuffer: function(key,stressValue) {
		var stressValueMap = this.historicalStressValueBuffer.get(key);
		if(stressValueMap == null) {
			stressValueMap = new haxe_ds_ObjectMap();
			this.historicalStressValueBuffer.set(key,stressValueMap);
		}
		stressValueMap.set(this.parseDate(stressValue.date),stressValue);
		return this.count(stressValueMap);
	}
	,clearBuffer: function(key) {
		var stressValueMap = this.historicalStressValueBuffer.get(key);
		if(stressValueMap != null) {
			stressValueMap = new haxe_ds_ObjectMap();
			this.historicalStressValueBuffer.set(key,stressValueMap);
		} else throw new js__$Boot_HaxeError("Stress value map not found for " + key + " at cleanup");
	}
	,swap: function(old,newChart,ctx) {
		console.log("Swapping charts");
		return -1;
	}
	,getChartWidth: function() {
		return Math.round(window.innerWidth / 3);
	}
	,getChartHeight: function() {
		return Math.round(window.innerHeight / 3);
	}
	,redrawChart: function(key) {
		if(this.count(this.historicalStressValueBuffer.get(key)) < 50) return;
		var newKey = key + "STRESS";
		var canvasElement = window.document.getElementById(newKey);
		if(canvasElement != null) {
			var parentElement = canvasElement.parentElement;
			var childNodes = parentElement.childNodes;
			var index = 0;
			while(index < childNodes.length) {
				parentElement.removeChild(childNodes.item(index));
				index++;
			}
		} else {
			var _this = window.document;
			canvasElement = _this.createElement("canvas");
		}
		canvasElement.id = newKey;
		canvasElement.height = this.getChartHeight();
		canvasElement.width = this.getChartWidth();
		var ctx = canvasElement.getContext("2d");
		var newChart = new Chart(ctx);
		this.createDataSet(newChart,this.historicalStressValueBuffer.get(key));
		var element = this.getPortfolioCharts();
		if(element != null) {
			var divElement;
			var _this1 = window.document;
			divElement = _this1.createElement("div");
			divElement.id = "div_" + newKey;
			var labelElement;
			var _this2 = window.document;
			labelElement = _this2.createElement("label");
			labelElement.innerHTML = newKey;
			divElement.appendChild(labelElement);
			divElement.appendChild(canvasElement);
			element.appendChild(divElement);
		} else console.log("Unable to add element " + Std.string(element));
	}
	,createDataSet: function(newChart,historicalStress) {
		var dateArray = [];
		var historicalPrice = [];
		var stressValue = [];
		var dateSet = new haxe_ds_ObjectMap();
		var iterator2 = historicalStress.keys();
		while( iterator2.hasNext() ) {
			var i2 = iterator2.next();
			dateSet.set(i2,i2);
		}
		var $it0 = dateSet.keys();
		while( $it0.hasNext() ) {
			var i = $it0.next();
			dateArray.push(i);
		}
		dateArray.sort($bind(this,this.dateSort));
		var chartTitle = "";
		var $it1 = historicalStress.iterator();
		while( $it1.hasNext() ) {
			var i1 = $it1.next();
			stressValue.push(i1);
		}
		var chartData = this.createDateSets(chartTitle,dateArray,stressValue);
		var lineChart = newChart.Line(chartData);
	}
	,createDateSets: function(chartTitle,dateArray,stressValues) {
		var labels = [];
		var interval = 8;
		var count = 0;
		var _g = 0;
		while(_g < dateArray.length) {
			var i = dateArray[_g];
			++_g;
			if(count % interval == 0) labels.push("" + this.format(i)); else labels.push("");
			count++;
		}
		stressValues.sort($bind(this,this.sortHistoricalStress));
		var stressedPortfolioValue = stressValues.map(function(x) {
			console.log("Stress values " + x.portfolioValue + " " + x.date);
			return x.portfolioValue;
		});
		var dataSets = [{ label : "Symbol", fillColor : "rgba(220,220,220,0.2)", strokeColor : "rgba(220,220,220,1)", pointColor : "rgba(220,220,220,1)", pointStrokeColor : "#fff", pointHighlightFill : "#fff", pointHighlightStroke : "rgba(220,220,220,1)", data : stressedPortfolioValue}];
		var chartData = { title : chartTitle + " Stress " + Std.string(new Date()), labels : labels, datasets : dataSets};
		return chartData;
	}
	,getData: function(key,historicalPrice) {
		var labelsA = [];
		var dataA = [];
		var resultSet = historicalPrice.resultSet;
		resultSet.sort($bind(this,this.sortByDate));
		var count = 0;
		var interval = 8;
		var _g = 0;
		while(_g < resultSet.length) {
			var i = resultSet[_g];
			++_g;
			console.log(i);
			if(count == this.max_buf_size) break;
			dataA.push(i.close);
			if(count % interval == 0) labelsA.push("" + this.format(this.parseDate(i.date))); else labelsA.push("");
			this.updateHistoricalPrice(key,i);
			count = count + 1;
		}
		if(count == 0) return null;
		var dataSet = { title : historicalPrice.symbol, labels : labelsA, datasets : [{ label : "Symbol", fillColor : "rgba(220,220,220,0.2)", strokeColor : "rgba(220,220,220,1)", pointColor : "rgba(220,220,220,1)", pointStrokeColor : "#fff", pointHighlightFill : "#fff", pointHighlightStroke : "rgba(220,220,220,1)", data : dataA}]};
		return dataSet;
	}
	,createCanvasElement: function(historicalPrice) {
		var key = this.getKey(historicalPrice);
		var canvasElement = window.document.getElementById(key);
		if(canvasElement == null) {
			console.log("Canvas element not found");
			var _this = window.document;
			canvasElement = _this.createElement("canvas");
			canvasElement.height = this.getChartHeight();
			canvasElement.width = this.getChartWidth();
			canvasElement.id = key;
			Chart.defaults.global.responsive = false;
			var ctx = canvasElement.getContext("2d");
			var dataSet = this.getData(key,historicalPrice);
			if(dataSet == null) return;
			try {
				var chart1 = new Chart(ctx);
				console.log("Chart object " + Std.string(chart1));
				var lineChart = chart1.Line(dataSet);
				this.updateChartMap(key,chart1);
				this.updateDataSetMap(key,dataSet);
			} catch( e ) {
				haxe_CallStack.lastException = e;
				if (e instanceof js__$Boot_HaxeError) e = e.val;
				console.log("Error creating line chart " + Std.string(e));
			}
			var element = this.getPortfolioCharts();
			if(element != null) {
				var divElement;
				var _this1 = window.document;
				divElement = _this1.createElement("div");
				divElement.id = "div_" + key;
				var labelElement;
				var _this2 = window.document;
				labelElement = _this2.createElement("label");
				labelElement.innerHTML = historicalPrice.symbol;
				divElement.appendChild(labelElement);
				divElement.appendChild(canvasElement);
				element.appendChild(divElement);
			} else console.log("Unable to add element " + Std.string(element));
		} else {
			var ctx1 = canvasElement.getContext("2d");
			this.updateChartData(this.getData(key,historicalPrice));
		}
	}
	,updateChartData: function(data) {
		console.log("Update chart data " + Std.string(data));
	}
	,'delete': function(historicalPrice) {
		console.log("Deleting chart for price " + Std.string(historicalPrice));
		var key = this.getKey(historicalPrice);
		var divKey = "div_" + key;
		var divElement = window.document.getElementById(divKey);
		if(divElement != null) divElement.parentNode.removeChild(divElement); else console.log("ERROR: Nothing to delete");
	}
	,deleteAll: function() {
		console.log("Deleting all portfolio charts");
		var charts = this.getPortfolioCharts();
		if(charts != null) {
			var _g = 0;
			var _g1 = charts.childNodes;
			while(_g < _g1.length) {
				var child = _g1[_g];
				++_g;
				charts.removeChild(child);
			}
		}
	}
	,updateChartMap: function(key,chart) {
		this.chartMap.set(key,chart);
	}
	,updateDataSetMap: function(key,dataset) {
		this.lineDataMap.set(key,dataset);
	}
	,__class__: view_SymbolChart
};
function $iterator(o) { if( o instanceof Array ) return function() { return HxOverrides.iter(o); }; return typeof(o.iterator) == 'function' ? $bind(o,o.iterator) : o.iterator; }
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
String.prototype.__class__ = String;
String.__name__ = ["String"];
Array.__name__ = ["Array"];
Date.prototype.__class__ = Date;
Date.__name__ = ["Date"];
var Int = { __name__ : ["Int"]};
var Dynamic = { __name__ : ["Dynamic"]};
var Float = Number;
Float.__name__ = ["Float"];
var Bool = Boolean;
Bool.__ename__ = ["Bool"];
var Class = { __name__ : ["Class"]};
var Enum = { };
if(Array.prototype.map == null) Array.prototype.map = function(f) {
	var a = [];
	var _g1 = 0;
	var _g = this.length;
	while(_g1 < _g) {
		var i = _g1++;
		a[i] = f(this[i]);
	}
	return a;
};
if(Array.prototype.filter == null) Array.prototype.filter = function(f1) {
	var a1 = [];
	var _g11 = 0;
	var _g2 = this.length;
	while(_g11 < _g2) {
		var i1 = _g11++;
		var e = this[i1];
		if(f1(e)) a1.push(e);
	}
	return a1;
};
var __map_reserved = {}
var q = window.jQuery;
var js = js || {}
js.JQuery = q;
var ArrayBuffer = $global.ArrayBuffer || js_html_compat_ArrayBuffer;
if(ArrayBuffer.prototype.slice == null) ArrayBuffer.prototype.slice = js_html_compat_ArrayBuffer.sliceImpl;
var DataView = $global.DataView || js_html_compat_DataView;
var Uint8Array = $global.Uint8Array || js_html_compat_Uint8Array._new;
var global = window;
(function (global, undefined) {
    "use strict";

    if (global.setImmediate) {
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var setImmediate;

    function addFromSetImmediateArguments(args) {
        tasksByHandle[nextHandle] = partiallyApplied.apply(undefined, args);
        return nextHandle++;
    }

    // This function accepts the same arguments as setImmediate, but
    // returns a function that requires no arguments.
    function partiallyApplied(handler) {
        var args = [].slice.call(arguments, 1);
        return function() {
            if (typeof handler === "function") {
                handler.apply(undefined, args);
            } else {
                (new Function("" + handler))();
            }
        };
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            setTimeout(partiallyApplied(runIfPresent, handle), 0);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    task();
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function installNextTickImplementation() {
        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            process.nextTick(partiallyApplied(runIfPresent, handle));
            return handle;
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function() {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
            if (event.source === global &&
                typeof event.data === "string" &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            global.postMessage(messagePrefix + handle, "*");
            return handle;
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            channel.port2.postMessage(handle);
            return handle;
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
            return handle;
        };
    }

    function installSetTimeoutImplementation() {
        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            setTimeout(partiallyApplied(runIfPresent, handle), 0);
            return handle;
        };
    }

    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        installNextTickImplementation();

    } else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();

    } else if (global.MessageChannel) {
        // For web workers, where supported
        installMessageChannelImplementation();

    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        // For IE 6–8
        installReadyStateChangeImplementation();

    } else {
        // For older browsers
        installSetTimeoutImplementation();
    }

    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate;
}(new Function("return this")()));
;
MBooks_$im.SERVER_ERROR_MESSAGES_DIV_FIELD = "serverMessages";
MBooks_$im.SERVER_ERROR = "ServerError";
MBooks_$im.MESSAGING_DIV = "workbench-messaging";
MBooks_$im.GENERAL_DIV = "workbench-general";
MBooks_$im.COMPANY_DIV = "workbench-company";
MBooks_$im.PROJECT_DIV = "workbench-project";
MBooks_$im.CCAR_DIV = "workbench-ccar";
MBooks_$im.SECURITY_DIV = "workbench-security";
MBooks_$im.PORTFOLIO_DIV = "workbench-portfolio";
MBooks_$im.SETUP_GMAIL = "setupGmailOauth";
MBooks_$im.WORKBENCH = "workbench";
MBooks_$im.NICK_NAME = "nickName";
MBooks_$im.PASSWORD = "password";
MBooks_$im.FIRST_NAME = "firstName";
MBooks_$im.LAST_NAME = "lastName";
MBooks_$im.DIV_PASSWORD = "passwordDiv";
MBooks_$im.DIV_FIRST_NAME = "firstNameDiv";
MBooks_$im.DIV_LAST_NAME = "lastNameDiv";
MBooks_$im.DIV_REGISTER = "registerDiv";
MBooks_$im.USERS_ONLINE = "usersOnline";
MBooks_$im.REGISTER = "registerInput";
MBooks_$im.MESSAGE_HISTORY = "messageHistory";
MBooks_$im.MESSAGE_INPUT = "messageInput";
MBooks_$im.SEND_MESSAGE = "sendMessage";
MBooks_$im.STATUS_MESSAGE = "statusMessage";
MBooks_$im.KICK_USER = "kickUser";
MBooks_$im.KICK_USER_DIV = "kickUserDiv";
MBooks_$im.INIT_WELCOME_MESSAGE_DIV = "initWelcomeMessageDiv";
MBooks_$im.INIT_WELCOME_MESSAGE = "initWelcomeMessage";
MBooks_$im.GOAUTH_URL = "gmail_oauthrequest";
MBooks_$im.APPLICATION_ERROR = "applicationError";
format_csv_Reader.FETCH_SIZE = 4096;
haxe_ds_ObjectMap.count = 0;
haxe_io_FPHelper.i64tmp = (function($this) {
	var $r;
	var x = new haxe__$Int64__$_$_$Int64(0,0);
	$r = x;
	return $r;
}(this));
js_Boot.__toStr = {}.toString;
js_d3__$D3_InitPriority.important = "important";
js_html_compat_Uint8Array.BYTES_PER_ELEMENT = 1;
massive_munit_Assert.assertionCount = 0;
massive_munit_TestClassHelper.META_TAG_BEFORE_CLASS = "BeforeClass";
massive_munit_TestClassHelper.META_TAG_AFTER_CLASS = "AfterClass";
massive_munit_TestClassHelper.META_TAG_BEFORE = "Before";
massive_munit_TestClassHelper.META_TAG_AFTER = "After";
massive_munit_TestClassHelper.META_TAG_TEST = "Test";
massive_munit_TestClassHelper.META_TAG_ASYNC_TEST = "AsyncTest";
massive_munit_TestClassHelper.META_TAG_IGNORE = "Ignore";
massive_munit_TestClassHelper.META_PARAM_ASYNC_TEST = "Async";
massive_munit_TestClassHelper.META_TAG_TEST_DEBUG = "TestDebug";
massive_munit_TestClassHelper.META_TAGS = ["BeforeClass","AfterClass","Before","After","Test","AsyncTest","TestDebug"];
massive_munit_async_AsyncDelegate.DEFAULT_TIMEOUT = 400;
massive_munit_util_Timer.arr = [];
model_CCAR.SCENARIO_NAME = "scenarioName";
model_CCAR.SCENARIO_TEXT = "scenarioText";
model_CCAR.SAVE_SCENARIO = "saveScenario";
model_CCAR.PARSED_SCENARIO = "parsedScenario";
model_Project.SAVE_PROJECT = "saveProject";
model_Project.DELETE_PROJECT = "deleteProject";
model_Project.MANAGE_PROJECT = "ManageProject";
model_Project.PROJECT_IDENTIFICATION = "projectIdentification";
model_Project.COMPANY_LIST = "companyList";
model_Project.PROJECT_START = "projectStart";
model_Project.PROJECT_END = "projectEnd";
model_Project.PREPARED_BY = "preparedBy";
model_Project.PROJECT_SUMMARY = "projectSummary";
model_Project.PROJECT_DETAILS = "projectDetails";
model_Project.PROJECT_LIST = "projectList";
model_Project.CREATE = "Create";
model_Project.UPDATE = "P_Update";
model_Project.DELETE = "Delete";
model_Project.READ = "Read";
promhx_base_EventLoop.queue = new List();
util_Config.companyKey = "sbr";
util_Util.DEFAULT_ROWS = 10;
util_Util.DEFAULT_COLS = 50;
util_Util.BACKSPACE = 8;
util_Util.UP_ARROW = 38;
util_Util.DOWN_ARROW = 40;
util_Util.LABEL = "LABEL_";
util_Util.DIV = "DIV_";
view_Company.SAVE_COMPANY = "saveCompany";
view_Company.DELETE_COMPANY = "deleteCompany";
view_Company.COMPANY_IMAGE = "companyImage";
view_Company.COMPANY_SPLASH_ELEMENT = "companySplash";
view_Company.COMPANY_NAME = "companyName";
view_Company.COMPANY_ID = "companyID";
view_Company.COMPANY_MAILBOX = "generalMailbox";
view_Company.COMPANY_FORM_ID = "companyForm";
view_Company.ASSIGN_COMPANY = "assignCompany";
view_CompanyEntitlement.MANAGE_ALL_USER_ENTS = "allUserEntitlements";
view_CompanyEntitlement.MANAGE_COMPANY_USER_ENTS = "companyUserEntitlements";
view_CompanyEntitlement.SEARCH_USER_ELEMENT = "searchUsers";
view_CompanyEntitlement.COMPANY_USERS = "companyUsers";
view_CompanyEntitlement.PENDING_APPROVAL_REQUESTS = "pendingApprovalRequests";
view_CompanyEntitlement.AVAILABLE_ENTITLEMENTS = "availableEntitlements";
view_CompanyEntitlement.USER_ENTITLEMENTS = "userEntitlements";
view_CompanyEntitlement.ADD_USER_ENTITLEMENTS = "addUserEntitlements";
view_CompanyEntitlement.REMOVE_USER_ENTITLEMENTS = "removeUserEntitlements";
view_Entitlement.TAB_NAME = "entitlementTabName";
view_Entitlement.SECTION_NAME = "entitlementSectionName";
view_Entitlement.ENTITLEMENT_LIST = "entitlementsList";
view_Entitlement.ADD_ENTITLEMENT = "addEntitlement";
view_Entitlement.UPDATE_ENTITLEMENT = "updateEntitlement";
view_Entitlement.REMOVE_ENTITLEMENT = "removeEntitlement";
view_Entitlement.MANAGE_ENTITLEMENTS_COMMAND = "ManageEntitlements";
view_OptionAnalyticsTable.OPTION_CALLS_TABLE = "option_calls_table";
view_OptionAnalyticsTable.OPTION_PUTS_TABLE = "option_put_table";
view_OptionAnalyticsView.UNDERLYING = "underlying";
view_OptionAnalyticsView.RETRIEVE_UNDERLYING = "retrieveUnderlying";
view_OptionAnalyticsView.CLEAR_UNDERLYING = "clearUnderlying";
view_Portfolio.SAVE_PORTFOLIO = "savePortfolio";
view_Portfolio.UPDATE_PORTFOLIO = "updatePortfolio";
view_Portfolio.DELETE_PORTFOLIO = "deletePortfolio";
view_Portfolio.SYMBOL_INPUT_FIELD = "portfolioSymbol";
view_Portfolio.SIDE_INPUT_FIELD = "portfolioSide";
view_Portfolio.QUANTITY_INPUT_FIELD = "portfolioQuantity";
view_Portfolio.PORTFOLIO_LIST_FIELD = "portfolioList";
view_Portfolio.PORTFOLIO_SUMMARY = "portfolioSummary";
view_PortfolioSymbol.SYMBOL_SIDE_LIST = "symbolSideID";
view_PortfolioSymbol.SYMBOL_TYPE_LIST = "symbolTypeID";
view_PortfolioSymbol.SYMBOL_ID_FIELD = "symbolID";
view_PortfolioSymbol.SYMBOL_QUANTITY_ID = "symbolQuantityID";
view_PortfolioSymbol.HEADER_ROW_PRESENT = "headerRow";
view_PortfolioSymbol.SAVE_SYMBOL_BUTTON = "saveSymbol";
view_PortfolioSymbol.DELETE_SYMBOL_BUTTON = "deleteSymbol";
view_PortfolioSymbol.UPDATE_SYMBOL_BUTTON = "updateSymbol";
view_PortfolioSymbol.PORTFOLIO_SYMBOL_TABLE = "portfolioSymbolTable";
view_PortfolioSymbol.PORTFOLIO_SYMBOL_TABLE_JQ = "portfolioSymbolTableJQ";
view_PortfolioSymbol.UPLOAD_PORTFOLIO_FILE = "uploadPortfolioFile";
view_PortfolioSymbol.UPLOAD_PORTFOLIO_BUTTON = "uploadPortfolioButton";
view_PortfolioSymbol.QUERY_MARKET_DATA = "QueryMarketData";
view_SymbolChart.PORTFOLIO_CHARTS = "portfolioCharts";
MBooks_$im.main();
})(typeof console != "undefined" ? console : {log:function(){}}, typeof window != "undefined" ? window : exports, typeof window != "undefined" ? window : typeof global != "undefined" ? global : typeof self != "undefined" ? self : this);
