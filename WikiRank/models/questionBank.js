var mongoose = require('mongoose'),
    questionSchema = mongoose.Schema({
      image: String,
      questionId: String,
      question : String,
      correctIndex: Number,
      options: Array,
      topicId:Array,
      difficultyRank: Object 
    }),
    questionBank = mongoose.model('questionBank', questionSchema,'questionBank');

module.exports = questionBank;

