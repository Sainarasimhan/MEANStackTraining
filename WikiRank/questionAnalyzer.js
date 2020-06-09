var fs = require('fs');
var google = require('google-trends-api');
var mongoose = require("mongoose");
var questionPattern = require('./models/questionPattern');
var questionBank = require('./models/questionBank');
var wikiPageViews = require('./wikiPageViews');

/*********************************************************/
/* Handling Command Line Args */
/*********************************************************/
/*Read Args and get inputs */
var args = process.argv.slice(1);

if (args.length != 2)
{
	warning = "\tUsage : [" + args[0] + "] [Config-File]";
	console.log(warning);
	return undefined;
}

/*********************************************************/
/* Reading/Opening input files */ 
/*********************************************************/
/* Try to read req */
var configLines = fs.readFileSync(args[1]).toString().split("\n");

/* Get Databse Detail*/
var dbName = configLines[0];

/* Get Sources, from where analytics need to be retrieved*/
var dataSource = configLines[1].split(",");

/* Get Number of Difficulty Levels */
var numOfDifficultyLevels = configLines[2]; 

/* Track of num of Patterns */
var numOfPatterns= 0;

/*********************************************************/
/* Try to Connect with MongoDB */
/*********************************************************/
mongoose.connect(dbName);

var db = mongoose.connection;
db.on('error', function() {
   console.log("Error connecting to MongoDB:", dbName);
});
db.once('open', function () {

   console.log("Connected to MongoDB :",dbName);

   /* Main Logic */
   //questionPattern.find({'patternId' : "P31Q11424P161"}, function(err, docs) {
   questionPattern.find({}, function(err, docs) {
   //questionPattern.find({'patternId' : "P106Q33999P19"}, function(err, docs) {

     docs.forEach(function(d) {
        doRankForPattern(d); /* Rank the questions of this Pattern */
     });
   });

   questionPattern.count({},function(err,count) {
     console.log("NumberofPatterns:", count);   
     numOfPatterns = count;
   });

});

/*********************************************************/

/* Function to retrieve questions and Variables for an pattern */
var doRankForPattern = function(pattern)
{
      /* Get The questions Matching this Topic Id and Pattern */
      var re =  new RegExp(pattern.questionStub.pre + '(.+)' + pattern.questionStub.post);
      questionBank.find({'question' : {$regex: re}}, function(err, questions) { /* ==> Need to Change once PatternId is stored as part of Question */

         if (err) {
           console.log("Error getting Questions for Pattern",err);
         }

      }).then(function(data) {
         var questionAndVars = [];
         var patternId = pattern.patternId;

         /* Get Data */
         data.forEach(function(e) {
           var reRes = re.exec(e.question);   
           var questionVar = reRes[1].replace(pattern.questionStub.post,"");
 
           questionAndVars.push({'qId': e.questionId , 'vars':questionVar});
         });


         /*Rank the questions based on Wiki/Google */
	 if (dataSource.indexOf("Wiki") != -1) {
  	    /*Rank Questions Based on Wiki Data */
            var inputParams = { 'patternId' : patternId, 'numOfPatterns' : numOfPatterns , 'numOfDifficultyLevels' : numOfDifficultyLevels};
            console.log("[Pattern:" , patternId , "] Triggered Wiki Rank Process for documents (",questionAndVars.length,")");

            wikiPageViews.wikiPageRank(questionAndVars, inputParams);
         }

	 if (dataSource.indexOf("Google") != -1) {
	 }

      }).catch( function (err) {
         console.log("Error While Getting Questions for pattern:", pattern.patternId, err);
      });
}

/*********************************************************/
