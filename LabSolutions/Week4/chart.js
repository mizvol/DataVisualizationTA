/*

lab-4 solution

*/
const chartDiv = document.getElementById("chart-container");

const MARGIN = {
    top: 10,
    right: 40,
    bottom: 150,
    left: 60
  },
  width = chartDiv.clientWidth * 0.95,
  height = chartDiv.clientHeight * 0.5,
  contextHeight = 20;
contextWidth = width * 0.5;

const svg = d3.select(chartDiv).append("svg")
  .attr("width", width + MARGIN.left + MARGIN.right)
  .attr("height", height + MARGIN.top + MARGIN.bottom);

// d3.csv('climate_temperature_month_avg.csv', createChart);
d3.csv('climate_mean.csv', createChart);

function createChart(data) {
  let countries = [];
  let charts = [];
  let maxDataPoint = 0;
  let minDataPoint = 100; // the init value just have to be big enough to be less than the highest temperature

  // Get countries
  for (let prop in data[0]) {
    if (data[0].hasOwnProperty(prop)) {
      if (prop != 'Year') {
        countries.push(prop);
      }
    }
  };

  const countriesCount = countries.length;
  const startYear = data[0].Year;
  const endYear = data[data.length - 1].Year;
  const chartHeight = height * (1 / countriesCount);

  // Get max and min temperature bounds for Y-scale.
  data.map(d => {
    for (let prop in d) {
      if (d.hasOwnProperty(prop) && prop != 'Year') {
        d[prop] = parseFloat(d[prop]);

        if (d[prop] > maxDataPoint) {
          maxDataPoint = d[prop];
        }

        if (d[prop] < minDataPoint) {
          minDataPoint = d[prop];
        }
      }
    }

    /* Convert "Year" column to Date format to benefit
    from built-in D3 mechanisms for handling dates. */
    d.Year = new Date(d.Year, 0, 1);
  });

  // Create a chart for each country
  for (let i = 0; i < countriesCount; i++) {
    charts.push(new Chart({
      data: data.slice(),
      id: i,
      name: countries[i],
      width: width,
      height: height * (1 / countriesCount),
      maxDataPoint: maxDataPoint,
      minDataPoint: minDataPoint,
      svg: svg,
      MARGIN: MARGIN,
      showBottomAxis: (i == countries.length - 1)
    }));
  }

  // Create Context brush for zooming and scaling
  const contextXScale = d3.time.scale()
    .range([0, contextWidth])
    .domain(charts[0].xScale.domain());

  const contextAxis = d3.svg.axis()
    .scale(contextXScale)
    .tickSize(contextHeight)
    .tickPadding(-10)
    .orient("bottom");

  const contextArea = d3.svg.area()
    .interpolate("monotone")
    .x(function(d) {
      return contextXScale(d.date);
    })
    .y0(contextHeight)
    .y1(0);

  // Create brush
  const brush = d3.svg.brush()
    .x(contextXScale)
    .on("brush", onBrush);

  const context = svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + (MARGIN.left + width * .25) + "," + (height + MARGIN.top + chartHeight - 10) + ")");

  context.append("g")
    .attr("class", "x axis top")
    .attr("transform", "translate(0,0)")
    .call(contextAxis)

  context.append("g")
    .attr("class", "x brush")
    .call(brush)
    .selectAll("rect")
    .attr("y", 0)
    .attr("height", contextHeight);

  // Brush handler. Get time-range from a brush and pass it to the charts.
  function onBrush() {
    const b = brush.empty() ? contextXScale.domain() : brush.extent();
    charts.map(chart => chart.show(b));
  }
}

class Chart {
  constructor(options) {
    this.chartData = options.data;
    this.width = options.width;
    this.height = options.height;
    this.maxDataPoint = options.maxDataPoint;
    this.minDataPoint = options.minDataPoint;
    this.svg = options.svg;
    this.id = options.id;
    this.name = options.name;
    this.MARGIN = options.MARGIN;
    this.showBottomAxis = options.showBottomAxis;

    let localName = this.name;

    // Associate xScale with time
    this.xScale = d3.time.scale()
      .range([0, this.width])
      .domain(d3.extent(this.chartData.map(function(d) {
        return d.Year;
      })));

    // Bound yScale using minDataPoint and maxDataPoint
    this.yScale = d3.scale.linear()
      .range([this.height, 0])
      .domain([this.minDataPoint, this.maxDataPoint]);
    let xS = this.xScale;
    let yS = this.yScale;

    /* 
      Create the chart.
      Here we use 'monotone' interpolation.
      Play with the other ones: 'basis', 'linear', 'step-before'.
      */
    this.area = d3.svg.area()
      .interpolate("monotone")
      .x(function(d) {
        return xS(d.Year);
      })
      .y0(this.height)
      .y1(function(d) {
        return yS(d[localName]);
      });

    this.chartContainer = svg.append("g")
      .attr('class', this.name.toLowerCase())
      .attr("transform", "translate(" + this.MARGIN.left + "," + (this.MARGIN.top + (this.height * this.id) + (10 * this.id)) + ")");

    // Add the chart to the HTML page
    this.chartContainer.append("path")
      .data([this.chartData])
      .attr("class", "chart")
      .attr("clip-path", "url(#clip-" + this.id + ")")
      .attr("d", this.area);

    this.xAxisTop = d3.svg.axis().scale(this.xScale).orient("bottom");
    this.xAxisBottom = d3.svg.axis().scale(this.xScale).orient("top");
    /* We only want a top axis if it's the first country */
    if (this.id == 0) {
      this.chartContainer.append("g")
        .attr("class", "x axis top")
        .attr("transform", "translate(0,0)")
        .call(this.xAxisTop);
    }

    // show only the bottom axis
    if (this.showBottomAxis) {
      this.chartContainer.append("g")
        .attr("class", "x axis bottom")
        .attr("transform", "translate(0," + this.height + ")")
        .call(this.xAxisBottom);
    }

    this.yAxis = d3.svg.axis().scale(this.yScale).orient("left").ticks(5);

    this.chartContainer.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(-15,0)")
      .call(this.yAxis);

    this.chartContainer.append("text")
      .attr("class", "country-title")
      .attr("transform", "translate(15,40)")
      .text(this.name);

  }
}

Chart.prototype.show = (b) => {
  this.xScale.domain(b);
  this.chartContainer.select("path").data([this.chartData]).attr("d", this.area);
  this.chartContainer.select(".x.axis.top").call(this.xAxisTop);
  this.chartContainer.select(".x.axis.bottom").call(this.xAxisBottom);
}