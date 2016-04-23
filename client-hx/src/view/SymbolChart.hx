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
import js.Browser;
using promhx.haxe.EventTools;


class SymbolChart {
	private static var PORTFOLIO_CHARTS: String = "portfolioCharts";
	public function new(historicalPriceStream : Deferred<Dynamic>){
		historicalPriceStream.then(createUpdateChart);
	}

	private function getPortfolioCharts() {
		return (Browser.document.getElementById(PORTFOLIO_CHARTS));
	}
	private function getKey(historicalPrice : Dynamic){
		return historicalPrice.portfolioId + "_" + historicalPrice.symbol;
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
						, Std.parseInt(month) - 1
						, Std.parseInt(day)
						, 0
						, 0
						, 0);

		}catch(err: Dynamic){
			trace("Error parsing " + x);
			return null;
		}

	}
	private function sortByDate(x : Dynamic, y : Dynamic) {
		try {
			var d1 : Date = parseDate(x.date);
			var d2 : Date = parseDate(y.date);
			var d1f : Float = d1.getTime();
			var d2f : Float = d2.getTime();
			if (d1f == d2f) {
				return 0;
			} 
			if (d1f < d2f){
				return -1;
			}
			return 1;	
		}catch (err : Dynamic){
			trace("Error parsing " + x + "-" + y);
			return -1;
		}
	}
	private function getData(historicalPrice : Dynamic){
		var labelsA : Array<String> = new Array<String>();
		var dataA : Array<Dynamic> = new Array<Dynamic>();
		var resultSet : Array<Dynamic> = historicalPrice.resultSet;
		resultSet.sort(sortByDate);
		var count : Int = 0;
		var interval : Int = 8;
		for(i in resultSet){
			trace(i);
			dataA.push(i.close);
			if(count % interval == 0) {
				labelsA.push("" + format(parseDate(i.date)));
			}else {
				labelsA.push("");
			}
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
			canvasElement.height = Math.round(Browser.window.innerHeight / 3);
			canvasElement.width  = Browser.window.outerWidth;
			canvasElement.id = key;
			Global.responsive = false;
			var ctx : CanvasRenderingContext2D = canvasElement.getContext("2d");
			var dataSet  = getData(historicalPrice);
			if(dataSet == null){
				return;
			}
			var lineChart = null;
			try {
				var chart = new Chart(ctx);
				trace("Chart object " + chart);
				lineChart = chart.Line(dataSet);	
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
			updateChartData(getData(historicalPrice));			
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
}