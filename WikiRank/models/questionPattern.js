/* Question Pattern Schema */
var mongoose = require('mongoose'),
    questionPatternSchema = mongoose.Schema({
      patternId: {type:String },
      pIdForVar: { type: String}, 
      qIdForVar: { type: String}, 
      pIdForOpt: { type: String},
      topicIds:  {type:[String]}, 
      numberOfOptionsToBeGenerated: {type:Number}, 
      lastExecutedOn: {type:Date},
      totalQuestionsGenerated: {type:Number},
      successfullyInserted: {type:Number}, 
      insertionFailedFor:{type:Number},
      questionStub: { 
        pre:{type: String}, 
        var:{type: String}, 
        post:{type: String} 
      } 
    }),
    questionPattern = mongoose.model('questionPattern', questionPatternSchema, 'questionPattern');

module.exports = questionPattern;
