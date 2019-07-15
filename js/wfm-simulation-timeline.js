function displayResults(selection, data, widthPerTick = 60, leftMargin = 100, tickInterval = 1, tickTime = null, tickTimeFormat = null) {
	var rightMargin = 30
	
	var colorScale = d3.scale.category20().domain(tasks); 
	
	var tRange = timeRange(data)
	var startTime = tRange[0]
	var endTime = tRange[1]
	
    var totalTicks = 0;
    var tickFormat = null;
    if (tickTime != null) {
	    totalTicks = tickTime(startTime,endTime).length;
        if (tickTimeFormat == null) tickTimeFormat = d3.time.format.utc("%H");
        tickFormat = {
            format: tickTimeFormat,
			tickTime: tickTime,
			tickInterval: tickInterval,
			tickSize: 10,
		};
    } else {
	    totalTicks = endTime - startTime
        tickFormat = {
            format: d3.format("03d"),
			tickInterval: 1, 
			numTicks: totalTicks,
			tickSize: 10,
		};
    }
	
	console.log("Total Ticks: " + totalTicks);


	var chart = d3.timeline()
		.tickFormat(tickFormat)
		.stack()
		.margin({left: leftMargin, right: rightMargin, top:0, bottom:0})
		.colors( colorScale )
		.colorProperty('task')
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
		div.text(d.label + "\n" +
				 chart.tickFormat().format(new Date(d.starting_time)) + "-" + chart.tickFormat().format(new Date(d.ending_time)) + "\n" +
				 "Delay: " + chart.tickFormat().format(new Date(d.delay)) + "\n" +
				 "Cost: " + d.cost
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

function displayOne(tag, workflowData, widthPerTick = 60, leftMargin = 100, tickInterval = 1, tickTime = null, tickTimeFormat = null) {
	var div = d3.select(tag);
	div.selectAll("svg").remove();
	div.append("svg").attr("class","timeline");
	displayResults(div,workflowData,widthPerTick,leftMargin,tickInterval,tickTime,tickTimeFormat);
}
