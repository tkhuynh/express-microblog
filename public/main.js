$(function () {
	var baseUrl = "/api/posts";
	var allPosts;
	var $postList = $("#posts-list");
	var source = $("#blog-template").html();
	var template = Handlebars.compile(source);

	function render() {
		$postList.empty();
		$("form").find("input[name='title'], input[name='category'], textarea[name='description']").val("");
		var postsHtml = template({ posts: allPosts});
		$postList.append(postsHtml);
	}

	$.get(baseUrl, function (data) {
		console.log(data.posts);
		allPosts = data.posts.reverse(); //to post newest first
		render();
	});

	$("#new-post").on("submit", function (event) {
		event.preventDefault();
		var newPost = $(this).serialize();
		newPost = newPost.replace(/&category=.+&/g, function(x) {
			return x.slice(0,10) + x.slice(10, x.length-1).toLowerCase() + x.slice(-1);
		});
		newPost.like = false;
		newPost.time = (new Date()).toDateString();
		$.post(baseUrl, newPost, function (data) {
			allPosts.unshift(data);
			render();
		});
	});

	$postList.on("click", ".edit-button", function (event) {
		event.preventDefault();
		var id = $(this).attr("id");
		$("#form" + id).toggle();
		var editPostIndex;
		allPosts.forEach(function (post) {
			if (post._id === id) {
				editPostIndex = allPosts.indexOf(post);
			}
		});
		$("#form" + id).on("submit", function (event) {
			var editedPost = $("#form" + id).serialize();
			editedPost = editedPost.replace(/&category=.+&/g, function(x) {
			return x.slice(0,10) + x.slice(10, x.length-1).toLowerCase() + x.slice(-1);
		});
			editedPost= editedPost + "&like=" + allPosts[editPostIndex].like.toString() + "&time=" + allPosts[editPostIndex].time;
			event.preventDefault();
			$.ajax({
				type: "PUT",
				url: baseUrl + "/" + id,
				data: editedPost,
				success: function(data) {
					allPosts.splice(editPostIndex, 1, data);
					render();
				}
			});
		});
	});

	$postList.on("click", ".delete-button", function (event) {
		event.preventDefault();
		var id = $(this).attr("id").slice(3);
		var deletePostIndex;
		allPosts.forEach(function (post) {
			if (post._id === id) {
				deletePostIndex = allPosts.indexOf(post);
			}
		});
		$.ajax({
			type: "DELETE",
			url: baseUrl + "/" + id,
			data: allPosts[deletePostIndex],
			success: function (data) {
				allPosts.splice(deletePostIndex, 1);
				render();
			}
		});
	});

	$postList.on("click", ".like-button", function (event) {
		var id = $(this).attr("id").slice(4);
		$("#like" + id).toggleClass("btn-default").toggleClass("btn-info");
		var likePost = allPosts.filter(function (post) {
			return post._id == id;
		})[0];
		likePost = "title=" + likePost.title + "&description=" + likePost.description + "&like=" + (!likePost.like) + "&time=" + likePost.time + "&category=" + likePost.category;
		$.ajax({
			type: "PUT",
			url: baseUrl + "/" + id,
			data: likePost,
			success: function(data) {
				allPosts.splice(allPosts.indexOf(likePost), 1, data);
			}
		});
	});

	$("span").click(function () {
		var filterCategory = $(this).text().toLowerCase();
		console.log(filterCategory);
		foundCategoryPosts = [];
		if (filterCategory == "all categories") {
			foundCategoryPosts = allPosts;
		}
		allPosts.forEach(function (post) {
			if (post.category == filterCategory) {
				foundCategoryPosts.push(post);
			}
		});
		var allCategory = ["news", "sports", "economy", "sciences", "finances"];
		if (foundCategoryPosts.length === 0 && filterCategory === "more") {
			allPosts.forEach(function (post) {
				if (allCategory.indexOf(post.category) < 0) {
					foundCategoryPosts.push(post);
				}
			});
		}
		if (foundCategoryPosts.length === 0) {
			$postList.empty();
			$postList.addClass("text-center").append("<h3>No Post for This Category</h3>");
		} else {
			$.get(baseUrl, function () {
				$postList.empty();
				$postList.removeClass("text-center");
				var postsHtml = template({ posts: foundCategoryPosts});
				$postList.append(postsHtml);
			});
		}
	});

	$postList.on("click", ".comment-button", function (event) {
		var id = $(this).attr("id").slice(7);
		$("#comment-form" + id).toggle();
		$("#comment-form" + id).on("submit", function (event) {
			event.preventDefault();
			var comment = $(this).serialize();
			var commentedPost = allPosts.filter(function (post) {
				return post._id == id;
			})[0];
			var url = baseUrl + "/" + id + "/comments";
			$.post(url, comment, function(data) {
				commentedPost.comments.push(data);
				render();
			});
		});
	});
});