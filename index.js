var http = require("http"),
		fs = require("fs"),
		linefeed = require("../linefeed"),
		gitfiles = require("../gitfiles");

var app = http.createServer(handleRequest);

app.listen(3000);

var logPath = "./data/node-log.txt";

function handleRequest( req, res ) {

	if (/\/plain\/async$/.test(req.url)) {
		async(req, res);
	} else if (/\/plain\/streaming$/.test(req.url)) {
		streaming(req, res);
	} else if (/\/html\/async$/.test(req.url)) {
		asyncHTML(req, res);
	} else if (/\/html\/streaming$/.test(req.url)) {
		streamingHTML(req, res);
	}
}

function async( req, res ) {
	res.writeHead(200, {"Content-Type": "text/plain"});
	fs.readFile(logPath, "utf-8", function( err, data ) {
		res.end(data);
	});
}

function streaming( req, res ) {
	res.writeHead(200, {"Content-Type": "text/plain"});
	fs.createReadStream(logPath).pipe(res);
}

function asyncHTML( req, res ) {
	res.writeHead(200, {"Content-Type": "text/html"});
	fs.readFile(logPath, "utf-8", function( err, data ) {
		var lines = data.split(/(?:\n)|(?:\r\n)|(?:\r)/),
				statusMatcher = /^([AMDR])\s+(.+?)$/,
				lineMatch;

		for (var i = 0, j = lines.length; i < j; i++) {
			lineMatch = lines[i].match(statusMatcher);
			if (lineMatch) {
				res.write(lineMatch[2] + "<br/>");
			}
		}

		res.end();
	});
}

function streamingHTML( req, res ) {
	res.writeHead(200, {"Content-Type": "text/html"});
	var gf = gitfiles();
	gf.unique = false;
	gf.newline = "<br/>";
	fs.createReadStream(logPath).pipe(linefeed()).pipe(gf).pipe(res);
}
