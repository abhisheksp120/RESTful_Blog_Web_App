var express = require("express"),
methodOverride = require("method-override"),
bodyParser = require("body-parser"),
expressSanitizer = require("express-sanitizer"),
mongoose = require('mongoose'),

app = express();

// App config
mongoose.connect("mongodb://localhost:27017/restful_blog_app", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }, (err) => {
    if (err)
        console.error(err);
    else
        console.log("Connected to the mongodb"); 
});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));


// Mongoose model config
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

// Restful Routes

app.get("/", function(req, res){
	res.redirect("/blogs");
})

// Index route
app.get("/blogs", function(req, res){

	Blog.find({}, function(err, blogs){
		if(err){
			console.log("Error !");
		}
		else{
			res.render("index", {blogs, blogs});
		}
	});
});

// New route(Display form to add new data)
app.get("/blogs/new", function(req, res){
	res.render("new");
});

// Create route
app.post("/blogs", function(req, res){

	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog, function(err, newBlog){
		if(err){
			res.render("new");	
		}
		else{
			res.redirect("/blogs");
		}
	});
});

// Show route
app.get("/blogs/:id", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		}
		else{
			res.render("show", {blog: foundBlog});
		}
	});
});

// Edit route
app.get("/blogs/:id/edit", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		}
		else{
			res.render("edit", {blog:foundBlog});
		}
	});
});

// Update route
app.put("/blogs/:id", function(req, res){

	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
		if(err){
			res.redirect("/blogs");
		}
		else{
			res.redirect("/blogs/"+req.params.id);
		}
	});
});

//Destroy route
app.delete("/blogs/:id", function(req, res){
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/blogs");
		}
		else{
			res.redirect("/blogs");
		}
	});
});

app.listen(3000, function(req, res){
	console.log("Server is On !");
})