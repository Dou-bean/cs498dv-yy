
d3.csv("/src/static/data/state.csv").then(data => chart(data));
function chart(data) {
	data.forEach(d => {
		d.Infected = +d.Active;
		d.Confirmed = +d.Confirmed;
		d.Deaths = +d.Deaths;
		d.Recovered = +d.Recovered;
		d.Hospitalization_Rate = +d.Hospitalization_Rate;
		d.Incident_Rate = +d.Incident_Rate;
		d.Mortality_Rate = +d.Mortality_Rate;
		d.Testing_Rate = +d.Testing_Rate;
	});
	// console.log(data);

	var
		states = [...new Set(data.map(d => d.Province_State))],
		keys = ["Deaths", "Infected", "Recovered"],
		keysColor = ["red", "#db9e2c", "lightblue"];


	var padding = {
		top: 10,
		bottom: 50,
		left: 50,
		right: 50
	};

    var
        svgWidth = 900,
        svgHeight = 450,
		width = svgWidth - padding.left - padding.right,
		height = svgHeight - padding.left - padding.right,

        svg = d3.select("#state").append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight),
		plotArea = svg.append("g")
			.attr("transform",  "translate(" + padding.left + "," + padding.top + ")"),

		xScale = d3.scaleBand().range([0, width]).padding(0.2),
		yScale = d3.scaleLinear().range([height, 0]);
		zScale = d3.scaleOrdinal()
			.range(keysColor)
			.domain(keys);

		svg.append("g")
			.attr("transform", "translate(" + padding.left + "," + padding.top + ")")
			.attr("class", "y-axis");
    	svg.append("g")
			.attr("transform", "translate(" + padding.left + "," + (padding.top + height) + ")")
			.attr("class", "x-axis")
			.selectAll("text").attr("transform", "rotate(45)").style("text-anchor", "start");

	update(data, xScale, yScale, zScale, keys, keysColor, states, svg, plotArea, height, width, 2500);

	/*
	// plot legend
	var lengend = d3.select("#state-specific").selectAll(".legend").data(keys).enter()
		.append("g")
		.attr("class", "lengend");

	lengend.append("rect")
		.attr("width", "18")
		.attr("height", "12")
		.attr("x", width - 20)
		.attr("y", (d, i) => 20 * i)
		.style("fill", (d, i) => keysColor[i])
		.style("stroke", "black");

	lengend.append("text")
		.attr("x", width - 24)
		.attr("y", (d, i) => 20 * i + 10)
		.style("text-anchor", "end")
		.attr("fill", "#fff")
		.text(d => d);
	*/

	/*
	d3.select(".sort")
		.on("click", () => update(data, xScale, yScale, zScale, keys, states, svg, plotArea, 2500));
	*/
}

function update(data, xScale, yScale, zScale, keys, keysColor, states, svg, plotArea, height, width, speed){

	yScale.domain([0, d3.max(data, d => d.Confirmed)]);
	var	yAxis = d3.axisLeft(yScale);
	svg.selectAll(".y-axis")
		.transition().duration(speed)
		.call(yAxis);

	xScale.domain(data.map(d => d.Province_State));
	var	xAxis = d3.axisBottom(xScale);
	svg.selectAll(".x-axis")
		.transition().duration(speed)
		.call(xAxis)
		.selectAll("text").attr("transform", "rotate(45)").style("text-anchor", "start");

	pieChartAera = d3.select("#state-specific")
		.append("svg")
			.attr("width", 500)
			.attr("height", 300)
			.attr("id", "state-specific-svg")

	var bars = plotArea.selectAll("rect").data(data).enter().append("rect")
		.on("click", (d) => {
			d3.select(".state-specific-piechart").remove();
			pie(d.Province_State);
		})
		.on("mouseover", (d) => {
			var tooltip = d3.select(".tooltip");
			tooltip.transition().duration(50)
				.style("opacity", 1)
				.style("left", (d3.event.pageX) + "px")
				.style("top", (d3.event.pageY) + "px");
			tooltip.html("<p>" + d.Province_State + "</p><p> Confirmed case: " + d.Confirmed + " </p>");
		});

	// initialize the lengend and pie chart
	pieLengend(keys, keysColor);
	pie("New York");

	bars.attr("x", (d, i) => xScale(d.Province_State))
		.attr("width", xScale.bandwidth())
		.attr("y", (d, i) => yScale(0))
		.attr("height", (d, i) => height - yScale(0))
        .attr("fill", "lightblue")
		.attr("stroke", "black")
		.transition().duration(2500)
		.attr("y", (d, i) => yScale(d.Confirmed))
		.attr("height", (d, i) => height - yScale(d.Confirmed));

}

function pieLengend(keys, keysColor) {
	var lengend = d3.select("#state-specific-svg").selectAll(".legend").data(keys).enter()
		.append("g")
		.attr("class", "lengend");

	lengend.append("rect")
		.attr("width", "18")
		.attr("height", "12")
		.attr("x", 440)
		.attr("y", (d, i) => 20 * (i + 1))
		.style("fill", (d, i) => keysColor[i])
		.style("stroke", "black");

	lengend.append("text")
		.attr("x", 440)
		.attr("y", (d, i) => 20 * (i + 1) + 10)
		.style("text-anchor", "end")
		.attr("fill", "#fff")
		.text(d => d);
}

async function pie(state){
	console.log(state);
	const csvData = await d3.csv("/src/static/data/state.csv");
	var data = csvData.filter(d => d.Province_State === state);

	data.forEach(d => {
		d.Infected = +d.Active;
		d.Confirmed = +d.Confirmed;
		d.Deaths = +d.Deaths;
		d.Recovered = +d.Recovered;
		d.Hospitalization_Rate = +d.Hospitalization_Rate;
		d.Incident_Rate = +d.Incident_Rate;
		d.Mortality_Rate = +d.Mortality_Rate;
		d.Testing_Rate = +d.Testing_Rate;
	});


	var
		keys = ["Deaths", "Infected", "Recovered"],
		keysColor = ["red", "#db9e2c", "lightblue"],
		cases = [data[0].Deaths, data[0].Infected, data[0].Recovered],
		pie = d3.pie(),
		arc = d3.arc().innerRadius(60).outerRadius(100),
		translate = {x: 200, y:150},

		pieChartAeraG = d3.select("#state-specific-svg")
			.append("g")
				.attr('transform', 'translate(' + translate.x + ',' + translate.y + ')')
				.attr("class", "state-specific-piechart");
	pieChartAeraG.selectAll("path").data(pie(cases)).enter().append("path")
			.attr("d", arc)
			.attr("fill", (d, i) => keysColor[i]);

	d3.select("#case-details").text("Case details in " + state);
}