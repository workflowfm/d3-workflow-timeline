function displayResults(selection, data, widthPerTick = 10, leftMargin = 100, tickInterval = 100) {
	var rightMargin = 30
	
	var colorScale = d3.scale.category20().domain(processes); 
	
	var tRange = timeRange(data)
	var startTime = tRange[0]
	var endTime = tRange[1]
	
	var totalTicks = endTime-startTime
	
	//var tickTime = d3.time.seconds
	//var totalTicks = tickTime(startTime,endTime).length	
	
	console.log("Total Ticks: " + totalTicks)
	
	var chart = d3.timeline()
		.tickFormat( //
				{format: d3.time.format.utc("%H:%M:%S.%L"),
				//tickTime: tickTime,
				numTicks: totalTicks/tickInterval,
				tickInterval: tickInterval,
				tickSize: 1,
				})
		.stack()
		.margin({left: leftMargin, right: rightMargin, top:0, bottom:0})
		.colors( colorScale )
		.colorProperty('process')
		.width(totalTicks*widthPerTick+leftMargin+rightMargin);
	
	chart.showTimeAxisTick();
	chart.relativeTime();

	var backgroundColor = "#eeeeee";
	var altBackgroundColor = "white";
	chart.background(function (datum, i) {
		var odd = (i % 2) === 0;
		return odd ? altBackgroundColor : backgroundColor;
	});
	chart.fullLengthBackgrounds();

	var div = selection.append("div")	
		.attr("class", "tooltip")				
		.style("opacity", 0);
	
	chart.mouseover(function (d, i, datum) {
		// d is the current rendering object
		// i is the index during d3 rendering
		// datum is the data object
		div.style("left", (d3.event.pageX) + "px")		
           .style("top", (d3.event.pageY - 28) + "px");
		div.text(d.process + " (" + d.label + ")\n" +
				 chart.tickFormat().format(new Date(d.starting_time)) + "-" + chart.tickFormat().format(new Date(d.ending_time)) + "\n" +
				 "Result: " + d.result
		);
		div.transition()		
        	.duration(200)		
        	.style("opacity", .9);		
	});
	chart.mouseout(function (d, i, datum) {
		div.transition()		
        	.duration(500)		
        	.style("opacity", 0);	
	});
	
	selection.select("svg").selectAll("g").remove();
	var svg = selection.select("svg")
		.datum(data)
		.attr("width", totalTicks*widthPerTick+leftMargin+rightMargin)
		.call(chart);
}

function timeRange(data) {
	var start = new Date().getTime();
	var finish = 0;
	for (var i = 0; i < data.length; i++) {
		for (var j = 0; j < data[i].times.length; j++) {
		    if (data[i].times[j].starting_time < start)
		    	start = data[i].times[j].starting_time;
		    if (data[i].times[j].ending_time > finish)
	    		finish = data[i].times[j].ending_time;
		}
	}
	return [start,finish]
}

function workflow(datum) {
	var selection = d3.select(this);
	displayResults(selection,datum.data);
}

function newWorkflow(widthPerTick, leftMargin, tickInterval) {
    return function(datum) {
	    var selection = d3.select(this);
	    selection.append("p").text(datum.id);
	    selection.append("svg").attr("class","timeline")
	    displayResults(selection,datum.data,widthPerTick,leftMargin,tickInterval);
} }

function displayAll(tag, workflowData, widthPerTick = 10, leftMargin = 100, tickInterval = 100) {
	var div = d3.select(tag).selectAll("div")
		.data(workflowData, function(d) { return d ? d.id : this.id; })
		.each(workflow);
		
	div.enter()
		.append("div")
			.attr("id",function(d) {d.id})
			.each(newWorkflow(widthPerTick,leftMargin,tickInterval));
}
