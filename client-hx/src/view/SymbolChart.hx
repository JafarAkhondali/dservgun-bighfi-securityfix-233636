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

	private function getData(historicalPrice : Dynamic){
		var labelsA : Array<String> = new Array<String>();
		var dataA : Array<Dynamic> = new Array<Dynamic>();
		var resultSet : Array<Dynamic> = historicalPrice.resultSet;
		var count : Int = 0;
		for(i in resultSet){
			trace(i);
			labelsA.push("" + count);
			dataA.push(i.close);
			count = count + 1;
		}
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
			canvasElement.height = Math.round(Browser.window.innerHeight / 5);
			canvasElement.width  = Browser.window.innerWidth;
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
				divElement.setAttribute("class", "col_12");
				var labelElement : LabelElement = Browser.document.createLabelElement();
				labelElement.innerHTML = historicalPrice.symbol;
				labelElement.setAttribute("class", "col_12");
				canvasElement.setAttribute("class", "col_12");
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

}