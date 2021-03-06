//re quire mongoose and passport-local-mongoose
var mongoose = require('mongoose'),
		Schema = mongoose.Schema,
		passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new Schema({
	username: String,
	password: String,
	posts: [{
		type: Schema.Types.ObjectId,
		ref: "Post"
	}],
	comments: [{
		type: Schema.Types.ObjectId,
		ref: "Comment"
	}]
});

UserSchema.plugin(passportLocalMongoose , {
	populateFields: "posts"
});

var User = mongoose.model("User", UserSchema);
module.exports = User;