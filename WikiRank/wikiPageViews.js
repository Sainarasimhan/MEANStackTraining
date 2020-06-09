var pageviews = require("pageviews");
var dupe = require('dupe');
var questionBank = require('./models/questionBank');
var mongoose = require("mongoose");

/* Global */
var patternsUpdated = 0; /* to keep track of Updated Patterns */
/* get Data for last 15 days */
var startDate = new Date(new Date() - 16*24*60*60*1000),
    endDate   = new Date(new Date() - 1*24*60*60*1000);


module.exports =  {

/* Inputs :
 inputParams : { 'patternId: xx', 'numOfPatterns' : xx, numOfDifficultyLevels : n}
 varArray : { 'qId' : xx, 'vars' : yy} */

wikiPageRank: function(varArray, inputParams) {
 

  var patternVariables = []; /* tmp array to store variables */
  var varsWithRank = [];  /* array to store object of vars and ranks. Structure {'element' :article, 'view' :averageView, 'Rank' : WikiRank}*/

  /* Get Variables alone from Input */
  varArray.forEach(function(obj) {
    patternVariables.push(obj['vars']); 
  });

  /*sort and remove Duplicates */
  patternVariables.sort();
  patternVariables = patternVariables.filter(dupe);  
//  patternVariables.splice(200); /*--> Testing */

  /* Request Wiki Page View for Each article and wait for all request to complete */ 
  var promises = [];
  while (patternVariables.length) {
    promises.push(getPageViews(varsWithRank,patternVariables.splice(0,1)));
  }

/* All Wiki Requests are Done and pageview stats are available*/
  Promise.all(promises).then(function () { 

    /* sort Variables based on pageview */
    varsWithRank.sort(function(a,b){
      return b.view-a.view;});
 
/*Main Ranking Logic :
     Split the Articles equally into difficuly Levels */

    /* tmp Variables */
    var len = varsWithRank.length;
    var qsPerLevel = Math.round(len/inputParams.numOfDifficultyLevels);
    var rank = 0;

    varsWithRank.forEach(function(obj,i) {
       if (i % qsPerLevel == 0 )
       {
          if (rank < inputParams.numOfDifficultyLevels)
          {
              rank += 1;
          }
       }
       obj['Rank'] = rank; 
    });

/* Now Variables available with Ranking */
    //console.log(varsWithRank,varsWithRank.length);
    console.log("[Pattern:" , inputParams.patternId , "] Successfully Ranked (" , varsWithRank.length, ") Articles based on wiki PageView");

    /* tmp Variables */
    var totalQs = varArray.length;
    var succUpdates = 0;

/* Update Database with Wiki Rank for Each Questions */
    varArray.forEach(function(obj,i) { 

       var wRank = 0;
       /* Get Calculated Wiki Rank for the question's variable */
       var varsWithRankObj = getRankforArticle(varsWithRank,obj.vars)[0]; 
       if (varsWithRankObj != undefined) {
           wRank = varsWithRankObj.Rank;
       }

       /* For the Question Updated the Wiki Rank */
       var query = {'questionId' : obj.qId};
       var value = {'difficultyRank.WikiRank' : wRank};

       /*Update DB */
       questionBank.update(query , value , function(err, doc) {
           if (err) {
             console.log("Error Updating DB",err);
             mongoose.connection.close();
           }
           succUpdates += 1;
          // console.log("Updated DB", doc,succUpdates);

           if (succUpdates == totalQs) {
              console.log("[Pattern:" , inputParams.patternId , "] Successfully Updated Wiki Rank for (" , succUpdates , ") documents");
              patternsUpdated +=1;
              if (inputParams.numOfPatterns == patternsUpdated) { 
                 console.log("All Done !!");
                 mongoose.connection.close();
              }
           }
       });
    });


  }).catch(function(err) {
    console.log("Error Getting Wiki PageViews", err);
  });
 }
}

var getPageViews = function(varsWithRank,input) {

 return  pageviews.getPerArticlePageviews ({ 
    articles: input,
    project : 'en.wikipedia.org',
    start   : startDate,
    end     : endDate
  }).then (function(res) {

    res.forEach(function (a) {
    var average = 0;
    var article = "";

    a.items.forEach(function (b) {
        average += b.views;
        article = b.article;
    });
 
    average /= a.items.length;
    varsWithRank.push({'element' :article, 'view' :average, 'Rank' : 0});
    });

  }).catch(function (err) {
      console.log(err,"Error Getting Wiki PageView for article:" , input);
  }); 

};

var getRankforArticle = function(varsWithRank,article) {
   return varsWithRank.filter(function (e) {
             article = article.replace(/\s/g ,'_');
             if (e.element == article) {
                return e;
             }
          }); 
};
