// @TODO: YOUR CODE HERE!

// Set Size of Chart 
var svgWidth = 960;
var svgHeight = 500;
var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an Svg Wrapper
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG Group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`)

// Initial Params
var chosenXAxis = "income";

// function used for updating x-scale var upon click on axis label
function xScale(health_data, chosenXAxis) {
  // create scales
  xLinearScale = d3.scaleLinear()
  .domain([d3.min(health_data, d => d[chosenXAxis]), d3.max(health_data, d => d[chosenXAxis])])
  .range([0, width]);
  return xLinearScale;
}
// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis, health_data) {
  circlesGroup.selectAll("circle")
    .transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));


  var yLinearScale = d3.scaleLinear()
  .domain([d3.min(health_data, d => d.smokes), d3.max(health_data, d => d.smokes)])
  .range([height, 0]);

  circlesGroup
    .append("text")
    .attr("dx", d => newXScale(d[chosenXAxis]))
    .attr("dy", d => yLinearScale(d.smokes))
    .attr("transform", `translate(-10, 5)`)
    .text(d => d.abbr);
  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {
  if (chosenXAxis === "income") {
    var label = "Income:";
  }
  else {
    var label = "Obesity";
  }

  //Initialize Tool Tip
  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([0, 0])
    .html(function (d) {
      return (`${d.state} <br> ${d[chosenXAxis]} <br> ${d.smokes}`)
    });
  chartGroup.call(toolTip);

  //Create Event Listeners For ToolTip
  circlesGroup.selectAll("circle")
    .on("click", function(data) {toolTip.show(data, this);})
    .on("mouseout", function(data, index) {toolTip.hide(data);});
  return circlesGroup;
}

// Retrieve Data
d3.csv("assets/data/data.csv").then(function (health_data, err) {
  if (err) throw err;

  //For Each Data
  health_data.forEach(function (data) {
    // Convert Data Properties To Numbers
    data.abbr = data.abbr
    data.income = +data.income
    data.smokes = +data.smokes
    data.state = data.state
    data.obesity = +data.obesity
  });

  // xLinearScale function above csv import
  xLinearScale = xScale(health_data, chosenXAxis);

  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(health_data, d => d.smokes), d3.max(health_data, d => d.smokes)])
    .range([height, 0]);

  //Create Axis Functions
  bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  //Append Axes to Chart
  chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);
  chartGroup.append("g")
    .call(leftAxis);

  //Create Circles Group
  var circlesGroup = chartGroup.selectAll("circle")
    .data(health_data)
    .enter();

  // Create group for  2 x- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "income") // value to grab for event listener
    .classed("active", true)
    .text("Income ($ Per Year)");

  var obesityLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .text("Obesity (% of Population)");

  //Add Circles 
  circlesGroup
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.smokes))
    .attr("r", "30")
    .attr("fill", "pink")
    .attr("opacity", ".5");

  //Add Text to Circles
  circlesGroup
    .append("text")
    .attr("dx", d => xLinearScale(d[chosenXAxis]))
    .attr("dy", d => yLinearScale(d.smokes))
    .attr("transform", `translate(-10, 5)`)
    .text(d => d.abbr);

  //Initialize Tool Tip
  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([0, 0])
    .html(function (d) {
      return (`${d.state} <br> ${d[chosenXAxis]} <br> ${d.smokes}`)
    });
  chartGroup.call(toolTip);

  //Creat Event Listeners For ToolTip
  circlesGroup.selectAll("circle")
    .on("click", function(data) {toolTip.show(data, this);})
    .on("mouseout", function(data, index) {toolTip.hide(data);});

  //Create Event Listeners For Display Data Color
  circlesGroup.selectAll("circle")
    .on("mouseover", function() {d3.select(this)
    .attr("fill", "red");
      })
  circlesGroup.selectAll("circle")
    .on("mouseout", function() {d3.select(this)
    .attr("fill", "pink")
    .attr("opacity", ".5");
      })     

  // Create axes labels
  chartGroup.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left + 40)
  .attr("x", 0 - (height / 2))
  .attr("dy", "1em")
  .attr("class", "axisText")
  .text("Smokes");

 labelsGroup.selectAll("text")
 .on("click", function() {
   // get value of selection
   var value = d3.select(this).attr("value");
   if (value !== chosenXAxis) {

     // replaces chosenXAxis with value
     chosenXAxis = value;

     // functions here found above csv import
     // updates x scale for new data
     xLinearScale = xScale(health_data, chosenXAxis);

     // updates x axis with transition
     xAxis = renderAxes(xLinearScale, xAxis);

     // updates circles with new x values
     circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, health_data);

     // updates tooltips with new info
     circlesGroup = updateToolTip(chosenXAxis, circlesGroup, yLinearScale);

     // changes classes to change bold text
     if (chosenXAxis === "income") {
        incomeLabel
         .classed("active", true)
         .classed("inactive", false);
        obesityLabel
         .classed("active", false)
         .classed("inactive", true);
     }
     else {
        incomeLabel
         .classed("active", false)
         .classed("inactive", true);
        obesityLabel
         .classed("active", true)
         .classed("inactive", false);
     }
   }
 });

  console.log(health_data);

});