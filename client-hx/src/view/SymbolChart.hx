package view;
import haxe.Json;
import js.html.Event;
import js.Browser;
import js.html.Element;
import js.html.InputElement;
import js.html.TextAreaElement;
import js.html.DOMCoreException;
import js.html.Document;
import js.html.LabelElement;
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
import model.Portfolio;
import model.PortfolioSymbol;
import model.Company;
import model.MarketDataUpdate;
import model.HistoricalStressValue;
import js.Lib.*;
import util.*;
import format.csv.*;
import format.*;
import js.JQuery;
using js.promhx.JQueryTools;
import chart.defaults.Global;
import js.html.CanvasRenderingContext2D;
import js.html.CanvasElement;
import chart.Chart;
import chart.LineChart;
import chart.data.LineDataSet;
import chart.data.LineData;
import js.Browser;
using promhx.haxe.EventTools;


class SymbolChart {
	private static var PORTFOLIO_CHARTS: String = "portfolioCharts";
	public function new(historicalPriceStream : Deferred<Dynamic>, stressValueStream : Deferred<HistoricalStressValue>){
		historicalPriceStream.then(createUpdateChart);
		stressValueStream.then(updateStressValues);
		chartMap = new StringMap<Chart>();
		lineDataMap = new StringMap<LineData>();
		//Buffer stress values before swapping out the chart for a canvas.
		stressValueBufferSize = 50;
		historicalStressValueBuffer = new StringMap<ObjectMap<Date, HistoricalStressValue>>();
		historicalPriceBuffer = new StringMap<ObjectMap<Date, Dynamic> > ();
	}


	//A constant to indicate the element index in the datasets.
	private var STRESS_VALUE_INDEX = 1;

	private var chartMap : StringMap<Chart>;
	private var lineDataMap : StringMap<LineData>;
	private var historicalPriceBuffer : StringMap<ObjectMap<Date, Dynamic>>;
	private var historicalStressValueBuffer : StringMap<ObjectMap<Date, HistoricalStressValue>>;
	private var stressValueBufferSize : Int;
	private function getPortfolioCharts() {
		return (Browser.document.getElementById(PORTFOLIO_CHARTS));
	}
	private function getKeyS(portfolioId : String, symbol : String){
		return portfolioId + "_" + symbol;
	}
	private function getKey(historicalPrice : Dynamic){
		return getKeyS (historicalPrice.portfolioId, historicalPrice.symbol);
	}

	private function createUpdateChart(historicalPrice : Dynamic){
		trace("Creating chart for historical price" + historicalPrice);
		if (historicalPrice.Right != null){
			if(historicalPrice.Right.query != null){
				var i : Array<Dynamic> = cast historicalPrice.Right.query;
				for(q in i){
					try {
						createCanvasElement(q);
					}catch(e : Dynamic){
						trace("Error adding canvas element " + e);
					}
					
				}

			}
		}
	}

	private function getMonthText(i : Int) {
		switch(i) {
			case 0 : return "Jan";
			case 1 : return "Feb";
			case 2 : return "Mar";
			case 3 : return "Apr";
			case 4 : return "May";
			case 5 : return "Jun";
			case 6 : return "Jul";
			case 7 : return "Aug";
			case 8 : return "Sep";
			case 9 : return "Oct";
			case 10: return "Nov";
			case 11: return "Dec";
			default : throw "Invalid month: " + i;
		}
	}
	private function format (x : Date){
		return (x.getFullYear() + "-" + getMonthText(x.getMonth()) + "-" + x.getDate());
	}
	//TODO: Replace this with a better function.
	//Using actually parsing date functions.
	private function parseDate(x : String) {
		try {
			var dateTimeComponents = x.split("T");
			var dateComponents = dateTimeComponents[0].split("-");
			var year = dateComponents[0];
			var month = dateComponents[1];
			var day = dateComponents[2];
			return new Date(Std.parseInt(year)
						, Std.parseInt(month) - 1 // off by zero.
						, Std.parseInt(day)
						, 0
						, 0
						, 0);

		}catch(err: Dynamic){
			trace("Error parsing " + x);
			return null;
		}
	}

	private function dateSort (d1 : Date, d2 : Date){
			var d1f : Float = d1.getTime();
			var d2f : Float = d2.getTime();
			if (d1f == d2f) {
				return 0;
			} 
			if (d1f < d2f){
				return -1;
			}
			return 1;	

	}
	private function sortHistoricalStress(x : HistoricalStressValue, y : HistoricalStressValue) {
		return dateSort(parseDate(x.date), parseDate(y.date));
	}
	//TODO: Fix this.
	private function sortByDate(x : Dynamic, y : Dynamic) {
		try {
			var d1 : Date = parseDate(x.date);
			var d2 : Date = parseDate(y.date);
			return dateSort(d1, d2);
		}catch (err : Dynamic){
			trace("Error parsing " + x + "-" + y);
			return -1;
		}
	}

	//Creates a dataset if null and appends the stressValue
	private function updateStressValues(stressValue : HistoricalStressValue) {
		if(stressValue == null){
			trace("Ignoring stress value");
			return;
		}
		if(MBooks_im.getSingleton().portfolio.activePortfolio.portfolioId != stressValue.portfolioId) {
			trace("Ignoring non active portfolio " + stressValue.portfolioId);
			return;
		}
		var key = stressValue.portfolioId + "_" + stressValue.portfolioId;	
		var bufSize = updateBuffer(key, stressValue);
		if(isBufferFull(bufSize, historicalPriceBuffer.get(key))) {
			redrawChart(key);
			clearBuffer(key);
		}
	}
	private var max_buf_size : Int = 70;
	private function isBufferFull(bufSize : Int, historicalPriceMap : ObjectMap<Date, Dynamic>) {
		var historicalPriceMapCount = count(historicalPriceMap);
		trace("Buffer size " + bufSize + " " + historicalPriceMapCount);
		//return bufSize == historicalPriceMapCount;
		return bufSize == max_buf_size;
	}
	private function count(anObjectMap : ObjectMap<Date, Dynamic>) {
		var count : Int = 0;
		if(anObjectMap == null){
			return count;
		}
		var iterator = anObjectMap.keys();
		for (i in iterator) {
			trace("Map key " + i);	
			count = count + 1;
		}
		return count;
	}

	private function updateHistoricalPrice(key : String, historicalPrice : Dynamic){
		var historicalPriceMap = historicalPriceBuffer.get(key);
		if(historicalPriceMap == null){
			historicalPriceMap = new ObjectMap<Date, Dynamic> ();
			historicalPriceBuffer.set(key, historicalPriceMap);
		}
		historicalPriceMap.set(parseDate(historicalPrice.date), historicalPrice);

	}
	private function updateBuffer(key : String, stressValue : HistoricalStressValue) {
		var stressValueMap : ObjectMap<Date, HistoricalStressValue> = historicalStressValueBuffer.get(key);
		if(stressValueMap == null){
			stressValueMap = new ObjectMap<Date, HistoricalStressValue> ();
			historicalStressValueBuffer.set(key, stressValueMap);
		}
		stressValueMap.set(parseDate(stressValue.date), stressValue);
		return (count(stressValueMap));

	}
	private function clearBuffer(key : String){
		var stressValueMap = historicalStressValueBuffer.get(key);
		if(stressValueMap != null){
			stressValueMap = new ObjectMap<Date, HistoricalStressValue>();
			historicalStressValueBuffer.set(key, stressValueMap);
		}else {
			throw ("Stress value map not found for " + key + " at cleanup");
		}
	}
	private function swap (old : Chart, newChart : Chart, ctx : CanvasRenderingContext2D){
		trace("Swapping charts") ;
		return -1;
	}

	private function getChartWidth() {
		return Math.round (Browser.window.innerWidth / 3);
	}
	private function getChartHeight (){
		return Math.round(Browser.window.innerHeight / 3);
	}

	private function redrawChart(key : String) {
		if (count(historicalStressValueBuffer.get(key)) < 50){
			return;
		}
		var newKey = key + "STRESS";

		var canvasElement : CanvasElement = cast Browser.document.getElementById(newKey);

		if(canvasElement != null) {
			var parentElement = canvasElement.parentElement;
			var childNodes = parentElement.childNodes;
			var index : Int = 0;
			while (index < childNodes.length) {
				parentElement.removeChild(childNodes.item(index));
				index++;
			}
		}else {
			canvasElement = Browser.document.createCanvasElement();
		}
		canvasElement.id = newKey;
		canvasElement.height = getChartHeight();
		canvasElement.width  = getChartWidth();
		var ctx : CanvasRenderingContext2D = canvasElement.getContext("2d");
		var newChart : Chart = new Chart(ctx);
		createDataSet(newChart, historicalStressValueBuffer.get(key));
		//swap(oldChart, newChart, ctx);
		var element : Element = getPortfolioCharts();
		if(element != null){
			var divElement : DivElement = Browser.document.createDivElement();
			divElement.id = "div_" + newKey;
			var labelElement : LabelElement = Browser.document.createLabelElement();
			labelElement.innerHTML = newKey;
			divElement.appendChild(labelElement);
			divElement.appendChild(canvasElement);	
			element.appendChild(divElement);
		}else {
			trace("Unable to add element " + element);
		}

	}


	//Need to make this generic, creating an interface for date and price.
	private function createDataSet(newChart : Chart, historicalStress : ObjectMap<Date, HistoricalStressValue> ) {
		var dateArray : Array<Date> = new Array<Date>();
		var historicalPrice : Array<Dynamic> = new Array<Dynamic>();
		var stressValue : Array<HistoricalStressValue> = new Array<HistoricalStressValue>();
		var dateSet : ObjectMap<Date, Date> = new ObjectMap<Date, Date> ();
		var iterator2 : Iterator<Date> = historicalStress.keys();		
		for (i2 in iterator2) {
			dateSet.set(i2, i2);
		}

		for (i in dateSet.keys()){
			dateArray.push(i);
		}
		dateArray.sort(dateSort);
		var chartTitle = "";
		for(i in historicalStress.iterator()){
			stressValue.push(i);
		}
		var chartData = createDateSets (chartTitle, dateArray, stressValue);
		var lineChart : LineChart = newChart.Line(chartData);
	}	

	private function createDateSets(chartTitle : String , dateArray : Array<Date>  
				, stressValues : Array<HistoricalStressValue> ){
		var labels : Array<String> = new Array<String> ();
		var interval = 8;
		var count : Int = 0;
		for(i in dateArray) {
			if(count % interval == 0) {
				labels.push("" + format(i));
			}else {
				labels.push("");
			}
			count++;
		}
		stressValues.sort(sortHistoricalStress);
		var stressedPortfolioValue = stressValues.map(function (x) { 
					trace("Stress values " + x.portfolioValue + " " + x.date);
					return x.portfolioValue;});

		var dataSets = [
			{
				label: "Symbol",
				fillColor: "rgba(220,220,220,0.2)",
				strokeColor: "rgba(220,220,220,1)",
				pointColor: "rgba(220,220,220,1)",
				pointStrokeColor: "#fff",
				pointHighlightFill: "#fff",
				pointHighlightStroke: "rgba(220,220,220,1)",
				data : stressedPortfolioValue
			}

		];

		var chartData = {
			title : chartTitle + " Stress " + Date.now()
			, labels : labels
			, datasets : dataSets
		};
		return chartData;
	}
	private function getData(key : String, historicalPrice : Dynamic){
		var labelsA : Array<String> = new Array<String>();
		var dataA : Array<Dynamic> = new Array<Dynamic>();
		var resultSet : Array<Dynamic> = historicalPrice.resultSet;
		resultSet.sort(sortByDate);
		var count : Int = 0;
		var interval : Int = 8;

		for(i in resultSet){
			trace(i);
			if (count == max_buf_size) {
				break;
			}
			dataA.push(i.close);
			if(count % interval == 0) {
				labelsA.push("" + format(parseDate(i.date)));
			}else {
				labelsA.push("");
			}
			updateHistoricalPrice(key, i);
			count = count + 1;

		}
		//If the resultset is empty, then return.
		if (count == 0){
			return null;
		}		
		var dataSet = {
			title : historicalPrice.symbol
			, labels : labelsA
			, datasets : [
				{
				label: "Symbol", 
				fillColor: "rgba(220,220,220,0.2)",
				strokeColor: "rgba(220,220,220,1)",
				pointColor: "rgba(220,220,220,1)",
				pointStrokeColor: "#fff",
				pointHighlightFill: "#fff",
				pointHighlightStroke: "rgba(220,220,220,1)",
				data : dataA
				}
			]
		};
		return dataSet;
	}

	private function createCanvasElement(historicalPrice : Dynamic){
		var key : String = getKey(historicalPrice);
		var canvasElement : CanvasElement = 
			cast (Browser.document.getElementById(key));
		if(canvasElement == null){
			trace("Canvas element not found");
			canvasElement = Browser.document.createCanvasElement();
			canvasElement.height = getChartHeight();
			canvasElement.width  = getChartWidth();
			canvasElement.id = key;
			//True doesnt work on firefox.
			Global.responsive = false; //Setting to true was creating an issue:need to revisit.
			var ctx : CanvasRenderingContext2D = canvasElement.getContext("2d");
			var dataSet  = getData(key, historicalPrice);
			if(dataSet == null){
				return;
			}
			try {
				var chart = new Chart(ctx);
				trace("Chart object " + chart);
				var lineChart : LineChart = chart.Line(dataSet);
				updateChartMap(key, chart);
				updateDataSetMap(key, dataSet);

			}catch(e : Dynamic){
				trace("Error creating line chart " + e);
			}
			var element : Element = getPortfolioCharts();
			if(element != null){
				var divElement : DivElement = Browser.document.createDivElement();
				divElement.id = "div_" + key;
				var labelElement : LabelElement = Browser.document.createLabelElement();
				labelElement.innerHTML = historicalPrice.symbol;
				divElement.appendChild(labelElement);
				divElement.appendChild(canvasElement);	
				element.appendChild(divElement);
			}else {
				trace("Unable to add element " + element);
			}
			
		}else {
			var ctx : CanvasRenderingContext2D = canvasElement.getContext("2d");
			updateChartData(getData(key, historicalPrice));			
		}
	}

	private function updateChartData(data : Dynamic){
		trace("Update chart data " + data);
	}

	public function delete(historicalPrice : Dynamic){
		trace("Deleting chart for price " + historicalPrice);
		var key : String = getKey(historicalPrice);
		var divKey : String = "div_" + key;
		var divElement = Browser.document.getElementById(divKey);
		if(divElement != null){
			divElement.parentNode.removeChild(divElement);
		}else {
			trace("ERROR: Nothing to delete");
		}
	}

	public function deleteAll(){
		trace("Deleting all portfolio charts");
		var charts  = getPortfolioCharts();
		if(charts != null){
			for(child in charts.childNodes){
				charts.removeChild(child);
			}
		}		
	}
	private function updateChartMap(key: String, chart : Chart) {
		chartMap.set(key, chart);
	}
	private function updateDataSetMap(key : String, dataset) {
		lineDataMap.set(key, dataset);
	}

}