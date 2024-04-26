//model za stvaranje objekta ProjectUser
var mongoose = require('mongoose');  
var projectUserSchema = new mongoose.Schema({  
  projectId: { type:  mongoose.Schema.Types.ObjectId, required: true },
  user: { type: String, required: true },
});
module.exports = mongoose.model('ProjectUser', projectUserSchema);