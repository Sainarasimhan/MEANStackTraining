var fs = require('fs');
var readLine = require('readline');

/*********************************************************
 * Varirables and Objects 
 *********************************************************/

/* General Vars */
var count = 0;
var headers = undefined;

/* Objects to hold the inputs for Plots */
var plotTwo = new Object();
  plotTwo.countryName = undefined;
  plotTwo.indicator = undefined;

var plotThree = new Object();
  plotThree.indicator = undefined;

/* Objects to hold Output */
function perYear(year, value) {
   this.year = year;
   this.value = value;
};

var plotOneOutput = {
  country : undefined,
  ind1    : undefined,
  ind2    : undefined,
  ind3    : undefined,
  ind4    : undefined
};

var plotTwoObj = {
  country : undefined,
  indPerYear : []
};

function plotThreeOutput(continent, indPerYear) 
{
  this.continent = continent;   /*String */
  this.indPerYear = indPerYear; /* Array */
};


/* Array of Objects */
var plotOneArray = [];
var plotThreeArray = [];

/*********************************************************/
/* Handling Command Line Args */
/*********************************************************/

/*Read Args and get inputs */
var args = process.argv.slice(1);

if (args.length != 4)
{
	warning = "\t[Usage : [" + args[0] + "] [Input CSV] [country-continent mapping] [req]";
	console.log(warning);
	return undefined;
}

/*********************************************************/
/* Reading/Opening input files */ 
/*********************************************************/
/* Try to read req */
list = fs.readFileSync(args[3]).toString();
list = list.split("\n");

/* Get PlotOne Params */
plotOneParams = list[0].split(",");
plotOneYear = plotOneParams.splice(0,1);

/* Get PlotTwo Params */
plotTwoParams = list[1].split(",");
plotTwo.countryName = plotTwoParams[0];
plotTwo.indicator = plotTwoParams[1];

/* Get PlotThree Params */
plotThree.indicator = list[2];

/* Populate Country-continent mapping */
var mapping = new Array();
mappingData = fs.readFileSync(args[2]).toString().split("\r\n");
for (i = 0, (len = mappingData.length-1); i < len ; i = i + 1 )
{
        m =  mappingData[i].split("|");
        mapping.push(m[0]+".");
        mapping.push(m[1]);
}

/* Try to create Stream From CSV File*/
var lines = readLine.createInterface( {
 input: fs.createReadStream(args[1])
});

/*********************************************************/
/* Extract information on reading every line */
/*********************************************************/

lines.on('line', function (line) {

        /*Split the Fields based on ','*/
        line = line.split(/,(?=(?:[^"]|"[^"]*")*$)/);

	/*Try to Store the Headers */
	if (count == 0){
		 headers = line;
		 countryIndex = headers.indexOf("Country Name");
		 indicatorIndex = headers.indexOf("Indicator Code");
		 yearIndex = headers.indexOf(plotOneYear.toString());
 
	         count = count + 1;
                 headers.splice(1,3);
	}

        /* Chk for the PlotOne Contents */
	currentIndicator = line[indicatorIndex];
	plotOneIndicatorIndex = plotOneParams.indexOf(currentIndicator);

	if (plotOneIndicatorIndex != -1)
	{
		 yearValue = line[yearIndex];
                 index = undefined;

                 plotOneArray.forEach( function(obj) {
                     if (obj.country == line[countryIndex])
                     {
                        index = obj;
                        return;
                     }
                 });
                 updatePlotOneInfo(index, line[countryIndex], yearValue, plotOneIndicatorIndex);
	} 

	/* Chk for the Country i.e. PlotTwo contents*/
	if ((line[countryIndex] == plotTwo.countryName) && (line[indicatorIndex] == plotTwo.indicator))
	{
                /* Remove the Unwanted fields */
                line.splice(1,3);
                plotTwoObj.country = line[0];

		for (i =1 ,len = (headers.length ) ; i < len; i = i + 1)
		{
                        chkForNull(line,i);

			var perYearObj = new perYear(headers[i],line[i]);
			plotTwoObj.indPerYear.push(perYearObj);
		}

	}

        /* Chk for Plot 3 */
        if ((currentIndicator == plotThree.indicator))
        {
            /* Remove the Unwanted fields */
            line.splice(1,3);
            
            cname = line[countryIndex].toString() + ".";
            mappingIndex = mapping.indexOf(cname)+1;
            cont = mapping[mappingIndex];

            var contIndex = undefined;
            plotThreeArray.forEach( function(obj) {
                if (obj.continent == cont)
                {
                    contIndex = obj;
                    return;
                }
            });
           
            /* If continent info not present, append */
            if ( contIndex == undefined)
	    {
                    var indPerYear = [];
		    for (i =1 ,len = (headers.length ) ; i < len; i = i + 1)
		    {
                            chkForNull(line,i);

			    var perYearObj = new perYear(headers[i],parseFloat(line[i]));
			    indPerYear.push(perYearObj);
		    }
		    plotThreeObj = new plotThreeOutput(cont,indPerYear);
                    plotThreeArray.push(plotThreeObj);
	    }
            else 
            {
                 plotThreeObj = contIndex;
                 i = 1;
                 plotThreeObj.indPerYear.forEach(function (perYear) {
                      chkForNull(line,i);
                      perYear.value = perYear.value + parseFloat(line[i]);
                      i=i+1;
                 });
            }

        }
});


/* Extract JSON once input file is completely read */
lines.on('close', function () {

   /* Create JSON For Plot One Req */
   plotOneArray = plotOneArray.sort(function (a,b) { /*Sort based on Ind1 */
       return b.ind1 - a.ind1;
   });

   plotOneArray.splice(15); /* Retain only Top 15 */
   plotOneJSON = JSON.stringify(plotOneArray);

   fs.writeFile("plotOne.JSON", plotOneJSON, function(err) {
      if (err) {
         console.log(err);
       }
   });

   /* Create JSON for Plot Two Req */
   plotTwoJSON = JSON.stringify(plotTwoObj);
   fs.writeFile("plotTwo.JSON", plotTwoJSON, function(err) {
      if (err) {
          console.log(err);
      }
   });

   /* Create JSON for Plot Thrid Req*/
   plotThreeJSON = JSON.stringify(plotThreeArray);
   fs.writeFile("plotThree.JSON", plotThreeJSON, function(err) {
       if (err) {
          console.log(err);
        }
      });

   console.log("Extraced the JSON Files \n 1) plotOne.JSON \n 2) plotTwo.JSON \n 3) plotThree.JSON");
});

/* Helper Functions */
var updatePlotOneInfo = function (index, countryName, indicatorValue, pos)
{
	if (index == undefined)
	{
		plotOneObj = Object.create(plotOneOutput);
		plotOneObj.country = countryName;
                plotOneArray.push(plotOneObj);
	} 
	else {
		plotOneObj = index; 
	}

	if (pos == 0) {
		plotOneObj.ind1 = indicatorValue;
	}
	else if (pos == 1) {
		plotOneObj.ind2 = indicatorValue;
	}
	else if (pos == 2){
		plotOneObj.ind3 = indicatorValue;
	}
	else {
		plotOneObj.ind4 = indicatorValue;
	}
};

var chkForNull = function(line,index) {
    if (line[index] == "") {
       line[index] = 0;
    }
};
