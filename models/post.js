var mongoose = require("mongoose"),
	Schema = mongoose.Schema;

var PostSchema = new Schema({
	title: String,
	description: String,
	time: String,
	category: String,
	comments: [{
		type: Schema.Types.ObjectId,
		ref: "Comment"
	}],
	author: {
		type: Schema.Types.ObjectId,
		ref: "User"
	}
});

var Post = mongoose.model("Post", PostSchema);

module.exports = Post;