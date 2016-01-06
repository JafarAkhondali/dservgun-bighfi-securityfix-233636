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
import promhx.Stream;
import promhx.Deferred;
import promhx.base.EventLoop;


typedef OptionChain = {
	var lastPrice : String;
	var underlying : String;
	var marketDataProvider : Int;
	var optionType : String;
	var expiration : Date;
	var symbol : String;
	var change : String;
	var openInterest : String;
	var strike : Float;
	var lastBid : String;
	var lastAsk : String;
}

typedef OptionAnalytics = {
	var commandType : String;
	var spotPrice : Float;
	var optionType : String;
	var optionChain : OptionChain;
	var averaging : String;
	var bidRatio: Float;
	var volatility : Float;
	var dividendYield : Float;
	var price : Float;
	var timetoMaturity : Float;
	var riskFreeInterestRate : Float;
	var randomWalks : Int;
}




class OptionAnalyticsTable {
	public static var OPTION_CALLS_TABLE (default, null) : String = "option_calls_table";
	public static var OPTION_PUTS_TABLE (default, null) : String = "option_put_table";
	private var tableHeaders : Array<String> ;
	private var optionType : String;
	private var currentSymbol : String;
	public function new(optionType : String
		, optionColumnHeaders : Array<String>
		, symbol : String){
		trace("Creating option analytics table " + optionType + " for  " + symbol);
		this.optionType = optionType;
		this.tableHeaders = optionColumnHeaders;
		this.currentSymbol = symbol;
		optionAnalyticsMap = new StringMap<OptionAnalytics>();
		optionAnalyticsMapUI =  new StringMap<TableRowElement>();
	}

	public function reset() {
		clear();
		this.optionType = "";
		this.currentSymbol = "";
		optionAnalyticsMap = new StringMap<OptionAnalytics>();
		optionAnalyticsMapUI =  new StringMap<TableRowElement>();		
	}

	private function getTable() : TableElement {
		var tableId : String = "";
		if(optionType == "call") {
			tableId = OPTION_CALLS_TABLE;
		}else if (optionType == "put"){
			tableId = OPTION_PUTS_TABLE;
		}else {
			return null;
		}
		return (cast Browser.document.getElementById(tableId));
	}
	private function key(anal : OptionAnalytics) : String {
		return (anal.optionChain.underlying 
				+ anal.optionType 
				+ anal.optionChain.symbol
				+ anal.optionChain.expiration);
	}

	public function updateOptionAnalytics(payload : OptionAnalytics){
		trace("Processing update option analytics element " + payload);
		if(this.currentSymbol == ""){
			trace("Ignoring this after clear "  + payload);
			return;
		}
		if(payload.optionType != this.optionType){
			trace("Ignoring this option type " + payload);
			return;
		}
		if(payload.optionChain.underlying != this.currentSymbol){
			trace("Ignoring this symbol " + payload);
			return;
		}
		var key : String = key(payload);
		var row : TableRowElement = cast optionAnalyticsMap.get(key);
		if(row == null){
			row = cast (getTable().insertRow(1));
			insertCells(row, payload);
		}else {
			trace("Clear the table and resort the elements.");
			sort(values(), sortByBidRatio);
			clear();
			draw();
		}
	}

	private function values() : Array<OptionAnalytics> {
		var elems : Array<OptionAnalytics> = new Array<OptionAnalytics>();
		for(anOpt in optionAnalyticsMap.iterator()){
			elems.push(anOpt);
		}
		return elems;

	}
	private function sort(optionAnalytics : Array<OptionAnalytics>, 
			sortFunction : OptionAnalytics -> OptionAnalytics -> Int) : Array<OptionAnalytics> {
		trace("Sort the rows");
		optionAnalytics.sort(sortFunction);
		return optionAnalytics; //inplace sort.
	}

	private function abs(a : Float) : Float {
		if (a < 0) {
			return a * -1;
		}
		return a;
	}
	private function sortByBidRatio(a : OptionAnalytics, b : OptionAnalytics) : Int {
		var error : Float = a.bidRatio - b.bidRatio;
		if(abs(error) < 0.00000001) {
			return 0;
		}
		if (error <= 0) {
			return -1;
		}
		else if(error > 0){
			return 1;
		}
		trace("Should never happen");
		return 0;
	}
	private function draw() {
		trace("Draw the table");
		var sortedValues : Array<OptionAnalytics> = (sort(values(), sortByBidRatio));
		var startIndex : Int = 1;
		for(val in sortedValues){
			var row : TableRowElement = cast getTable().insertRow(startIndex);
			updateRow(row, val);
			startIndex = startIndex + 1;
		}
	}
	public function clear() {
		trace("Clearing the table " + this);
		var startIndex = 1;
		var tableRows : HTMLCollection = getTable().rows;
		//To account for the header.
		while(tableRows.length > 1){
			getTable().deleteRow(1);
		}

	}

	private function updateRow(aRow : TableRowElement, payload : OptionAnalytics){
		trace("Inserting cells for " + payload);
		var key : String = key(payload);
		var optionAnalytics : OptionAnalytics = optionAnalyticsMap.get(key);
		if(optionAnalytics == null){
			optionAnalyticsMap.set(key, payload);
			var tableRowElement : TableRowElement = optionAnalyticsMapUI.get(key);
			insertCells(tableRowElement, payload);
		}else{
			optionAnalyticsMap.set(key, payload);
			var tableRowElement : TableRowElement = optionAnalyticsMapUI.get(key);
			clearCells(tableRowElement);
			insertCells(tableRowElement, payload);
		}
	}

	private function insertCells(aRow : TableRowElement, payload : OptionAnalytics){
		trace("Inserting cells " + payload);
		var newCell : TableCellElement = cast (aRow.insertCell(0));
		newCell.innerHTML = payload.optionChain.symbol;
		newCell  = cast aRow.insertCell(1);
		newCell.innerHTML = payload.optionType;
		newCell = cast aRow.insertCell(2);
		newCell.innerHTML = "" + payload.optionChain.expiration;
		newCell = cast aRow.insertCell(3);
		newCell.innerHTML = payload.optionChain.lastBid;
		newCell = cast aRow.insertCell(4);
		newCell.innerHTML = "" + payload.optionChain.lastAsk;
		newCell = cast aRow.insertCell(5);
		newCell.innerHTML = "" + payload.bidRatio;
		newCell = cast aRow.insertCell(6);
		newCell.innerHTML = "" + payload.price;


	}
	private function clearCells(aRow: TableRowElement){
		var cells = aRow.cells;
		for (c in cells){
			var cell : TableCellElement = cast c;
			aRow.deleteCell(cell.cellIndex);
		}
	}

	private var optionAnalyticsMap : StringMap<OptionAnalytics>;
	private var optionAnalyticsMapUI : StringMap<TableRowElement>;
}