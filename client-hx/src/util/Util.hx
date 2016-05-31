package util;
import haxe.Json;
import js.html.Event;
import js.Browser;
import js.html.Element;
import js.html.InputElement;
import js.html.Text;
import js.html.TextAreaElement;

import js.html.DivElement;
import js.html.Document;
import js.html.ButtonElement;
import js.html.SelectElement;
import js.html.OptionElement;

class Util {
	public static var DEFAULT_ROWS : Int = 10;
	public static var DEFAULT_COLS : Int = 50;
	public static var BACKSPACE : Int = 8;

	//XXX:This will bite!
	public static var UP_ARROW : Int = 38;
	public static var DOWN_ARROW : Int = 40;
	public static function NEW_LINE () : Int {
		return 10;
	}
	public static function TAB() : Int {
		return 9 ;
	}
	public static function CR() : Int {
		return 13;
	}
	public static function isUpOrDown(code : Int){
		return code == UP_ARROW || code == DOWN_ARROW;
	}
	public static function isUP(code : Int) {
		return code == UP_ARROW;
	}
	public static function issDown(code : Int) {
		return code == DOWN_ARROW;
	}
	public static function isTab(code : Int){
		return code == TAB();
	}
	public static function isBackspace(code : Int) {
		return code == BACKSPACE;
	}
	public static function isSignificantWS(code : Int) {
		//newline, tab or carriage return
		return (code == TAB() || code == NEW_LINE() || code == CR());
	}






	public static function showDivField(fieldName : String) {
		var div : DivElement = cast (Browser.document.getElementById(fieldName));
		div.setAttribute("style", "display:normal");
	}

	public static function hideDivField(fieldName : String) {
		var div : DivElement = cast Browser.document.getElementById(fieldName);
		div.setAttribute("style", "display:none");
	}

	public static function logToServer(logMessage : String){
		//Send the log message to the server.
	}

	public static function log(logMessage : String){
		trace(logMessage);
		
	}
	//Prefix: to maintain uniqueness
	private static var LABEL: String = "LABEL_";
	private static var DIV : String = "DIV_";
}