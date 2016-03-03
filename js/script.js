/* Input Obj contains below args
   heading:
   yLabel:
   tab:
   JSON File:
*/
var drawLine = function (objt){

    /* Define Variables */
    var MaxWidth = 1050;
    var MaxHeight = 650;
    var xrange = 800;
    var yrange = 500;
    var gxMin = 70;
    var gyMin = 60;
    var gyMax = 560;

    var svg = d3.select(objt.tab).append("svg");
    svg.attr("width", MaxWidth);
    svg.attr("height", MaxHeight);

    var xscale = d3.scale.linear()
      .rangeRound([0, xrange]);

    var yscale = d3.scale.linear()
      .rangeRound([yrange, 0]);

    var x3Axis = d3.svg.axis()
      .orient("bottom")
      .scale(xscale);

    var y3Axis = d3.svg.axis()
      .orient("left")
      .ticks(15)
      .tickFormat(d3.format("s"))
      .scale(yscale);

    var text = svg.append("text")
      .attr("x", "20")
      .attr("class", "text")
      .attr("y", "30");

    var text1 = svg.append("text")
      .attr("x", "5")
      .attr("class", "text1")
      .attr("style", "writing-mode: tb")
      .attr("y", "230");

    var g = svg.append("g")
      .attr("transform", "translate(" + gxMin + "," + gyMin + ")");

    var g1 = svg.append("g")
      .attr("transform", "translate(" + gxMin + "," + gyMax + ")");

    var g2 = svg.append("g")
      .attr("transform", "translate(" + gxMin + "," + gyMin + ")");

    var ref = svg.append("g")
      .attr("transform", "translate(70,550)");

    var lgndX = d3.scale.linear()
      .range([60, 700])
      .domain([1, 7]);

    d3.json(objt.JSONFile, function(obj) {

      if (obj.country == undefined) /*Plot Three */
      {
        var minMaxX = [];
        var minMaxY = [];

        obj.forEach(function(o) {
          minMaxX.push(d3.extent(o.indPerYear, function(d) {
            return parseFloat(d.year)
          }));
          minMaxY.push(d3.extent(o.indPerYear, function(d) {
            return parseFloat(d.value)
          }));
        });

        minY = (d3.extent(minMaxY, function(d) {
          return (d[0])
        }))[0];
        maxY = (d3.extent(minMaxY, function(d) {
          return (d[1])
        }))[1];

        xscale.domain(minMaxX[0]);
        yscale.domain([minY, maxY]);
      }
      else { /* Plot Two */
        xscale.domain(d3.extent(obj.indPerYear, function(d) {
          return parseFloat(d.year);
        }));
        yscale.domain(d3.extent(obj.indPerYear, function(d) {
          return parseFloat(d.value);
        }));
      }

      text.text(objt.heading);
      text1.text(objt.yLabel);

      g1.attr("class", "xaxis")
        .call(x3Axis);

      g2.attr("class", "yaxis")
        .call(y3Axis);

      if (obj.country == undefined) {
        var count = 0;
        obj.forEach(function(o) {
          count = count + 1;
          fn_line(o.indPerYear, "line" + count);

          ref.append("text")
            .attr("x", lgndX(count))
            .attr("y", 80)
            .attr("id", "line" + count)
            .text(o.continent);
        });
      }
      else { /* plot Two */
          fn_line(obj.indPerYear);
      }
    });

    var line = d3.svg.line()
      .x(function(d) {
        return xscale(d.year);
      })
      .y(function(d) {
        return yscale(d.value);
      })

    var fn_line = function(data, id) {
      g.append("path").data(data)
        .attr("class", "line")
        .attr("id", id)
        .attr("d", line(data));
    }
};



/* Input Obj contains below args
   heading:
   yLabel:
   tab:
   JSON File:
*/
var drawStackBars = function (objt){

    /* Define Variables */
    var MaxWidth = 1200;
    var MaxHeight = 700;
    var xrange = 1100;
    var gxMin = 70;
    var gyMax = 560;
    var yrange = 490;
    var gyMin = 70;

    var svg = d3.select(objt.tab).append("svg");
    svg.attr("width", MaxWidth);
    svg.attr("height", MaxHeight);

    var xscale = d3.scale.ordinal()
      .rangeBands([0, 900], .2);

    var yscale = d3.scale.linear()
      .rangeRound([yrange, 0]);

    var yscaleAxis = d3.scale.linear()
      .rangeRound([yrange, 10]);

    var xAxis = d3.svg.axis()
      .orient("bottom")
      .scale(xscale);

    var yAxis = d3.svg.axis()
      .orient("left")
      .ticks(15)
      .tickFormat(d3.format("s"))
      .scale(yscaleAxis);

    var text = svg.append("text")
      .attr("x", "20")
      .attr("class", "text")
      .attr("y", "30");

    var text1 = svg.append("text")
      .attr("x", "5")
      .attr("class", "text1")
      .attr("style", "writing-mode: tb")
      .attr("y", "230");

    var g = svg.append("g")
      .attr("class", "layer")
      .attr("transform", "translate(" + gxMin + "," + gyMin + ")");

    var g1 = svg.append("g")
      .attr("transform", "translate(" + gxMin + "," + gyMax + ")");

    var g2 = svg.append("g")
      .attr("transform", "translate(" + gxMin + "," + gyMin + ")");

    var leg1 = svg.append("text")
      .attr("transform", "translate(600,100)")
      .attr("class", "text2")
      .attr("fill", "blue")
      .attr("font-weight", "bold")
      .text(objt.lgnd1);

    var leg2 = svg.append("text")
      .attr("transform", "translate(600,130)")
      .attr("class", "text3")
      .attr("fill", "steelblue")
      .attr("font-weight", "bold")
      .text(objt.lgnd2);

    d3.json(objt.JSONFile, function(obj) {

      var bar1 = [];
      if (objt.bars == "second")
      {
          obj.forEach(function(d) {
          bar1.push({
            country: d.country,
            ind: "ind1",
            value: d.ind3
            }, {
            country: d.country,
            ind: "ind2",
            value: d.ind4
          });
        });
      }
      else
      {
        obj.forEach(function(d) {
          bar1.push({
            country: d.country,
            ind: "ind1",
            value: d.ind1
          }, {
            country: d.country,
            ind: "ind2",
            value: d.ind2
          });
        });
      }

      var nested = d3.nest()
        .key(function(d) {
          return d.ind;
        })
        .entries(bar1);

      var stack = d3.layout.stack()
        .y(function(d) {
          return parseFloat(d.value);
        })
        .values(function(d) {
          return d.values;
        });

      var layers = stack(nested);

      xscale.domain(obj.map(function(d) {
        return d.country;
      }));

      minMax = d3.extent(obj, function(d) {
        if (objt.bars == "first") {
        return (parseFloat(d.ind1) + parseFloat(d.ind2));
        }
        else {
          return (parseFloat(d.ind3) + parseFloat(d.ind4));
        }

      });
      yscale.domain([0, minMax[1]]);
      yscaleAxis.domain([0, minMax[1]]);

      text.text(objt.heading);
      text1.text(objt.yLabel);

      g1.attr("class", "xaxis")
        .call(xAxis)
        .selectAll("text")
        .attr("dx", "-.5em")
        .attr("dy", "1em")
        .attr("transform", "rotate(-20)");

      g2.attr("class", "yaxis")
        .call(yAxis);

      var layerGroups = g.selectAll(".layer").data(layers);
      layerGroups.enter().append("g")
        .attr("class", "layer");
      layerGroups.style("fill", function(d) {
        if (d.key == "ind1") {
          return "blue";
        } else if (d.key == "ind2") {
          return "steelblue";
        }
      });

      var bars = layerGroups.selectAll("rect").data(function(d) {
        return d.values;
      });
      bars.enter().append("rect")
      bars.exit().remove();
      bars
        .attr("x", function(d) {
          return xscale(d.country);
        })
        .attr("y", function(d) {
          return (yscale(parseFloat(d.y) + parseFloat(d.y0)));
        })
        .attr("height", function(d) {
          return (yrange - yscale(parseFloat(d.y)));
        })
        .attr("width", xscale.rangeBand())
        .attr("style", "stroke:none");
    });
};
