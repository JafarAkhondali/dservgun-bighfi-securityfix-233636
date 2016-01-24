package view;
import promhx.Stream;
import promhx.Deferred;
import promhx.base.EventLoop;
import model.Portfolio;
import js.html.Event;
import js.Browser;
import js.html.Element;
import js.html.InputElement;
import js.html.TextAreaElement;
import js.html.DOMCoreException;
import js.html.Document;
import js.html.ButtonElement;
import js.html.DivElement;
import js.html.UListElement;
import js.html.LIElement;
import js.html.SelectElement;
import js.html.KeyboardEvent;
import js.html.OptionElement;
import js.html.TableElement;
import js.html.TableCellElement;
import js.html.TableRowElement;
import js.html.HTMLCollection;
import js.html.FileReader;
import haxe.ds.ObjectMap;
import haxe.ds.StringMap;
import view.OptionAnalytics;


class OptionAnalyticsView {
	public static var UNDERLYING(default, null): String = "underlying";
	public static var RETRIEVE_UNDERLYING (default, null): String = "retrieveUnderlying";
	public static var CLEAR_UNDERLYING (default, null) : String = "clearUnderlying";
	private var callTable : OptionAnalyticsTable;
	private var putTable : OptionAnalyticsTable;
	public function new(){
		var pStream : Stream<Dynamic> = MBooks_im.getSingleton().initializeElementStream(cast getRetrieveUnderlying(), "click");			
		pStream.then(populateOptionAnalyticsTables);
		var qStream : Stream<Dynamic> = MBooks_im.getSingleton().initializeElementStream(cast getClearUnderlying(), "click");
		qStream.then(clearOptionAnalyticsTable);

	}
	private function getRetrieveUnderlying() : Element {
		return (cast Browser.document.getElementById(RETRIEVE_UNDERLYING));
	}
	private function getClearUnderlying() : Element {
		return (cast Browser.document.getElementById(CLEAR_UNDERLYING));
	}
	private function getUnderlying() : InputElement {
		return (cast Browser.document.getElementById(UNDERLYING));
	}
	private function getOptionCallHeaders() : Array<String>{
		var result : Array<String> = new Array<String>();
		result.push("Option Symbol");
		result.push("Calls");
		result.push("Last Bid");
		result.push("Last Ask");
		result.push("Bid ratio");
		result.push("Theoretical Eu Asian Option Price");
		return result;
	}
	private function getOptionPutHeaders(): Array<String> {
		var result : Array<String> = new Array<String>();
		result.push("Option Symbol");
		result.push("Puts");
		result.push("Last Bid");
		result.push("Last Ask");
		result.push("Bid ratio");
		result.push("Theoretical Eu Asian Option Price");
		return result;
	}
	private function clearOptionAnalyticsTable(ev : Event){
		getUnderlying().value = "";
		callTable.reset();
		putTable.reset();

	}
	private function populateOptionAnalyticsTables(ev : Event){
		//trace("Creating puts and calls for the table " + getUnderlying().value);
		callTable = new OptionAnalyticsTable("call", getOptionCallHeaders()
			, getUnderlying().value);
		putTable = new OptionAnalyticsTable("put", getOptionPutHeaders()
		, getUnderlying().value);
		MBooks_im.getSingleton().optionAnalyticsStream.then(callTable.updateOptionAnalytics);
		MBooks_im.getSingleton().optionAnalyticsStream.then(putTable.updateOptionAnalytics);

	}
}