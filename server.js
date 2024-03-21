// LOAD MODULES

var express = require('express');
var app = express();
const fs = require('fs').promises;
// parse application/x-www-form-urlencoded
const bodyParser = require('body-parser');

app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);
app.use(bodyParser.json());

// DOT ENV MODULE
const dotenv = require('dotenv').config();
const PORT = dotenv.parsed.PORT01;

// STATIC FILES FROM PUBLIC DIR
app.use(express.static('public'));

// Route for /guestbook
app.get('/guestbook', async (req, res) => {
	try {
		// Read entries.json file and guestbook.html file asynchronously
		const [jsonData, htmlContent] = await Promise.all([
			fs.readFile('data/entries.json', 'utf8'),
			fs.readFile('public/guestbook.html', 'utf8'),
		]);

		// Parse JSON data from entries.json
		const entries = JSON.parse(jsonData);

		// Generate HTML table dynamically

		let htmlTable =
			'<table id="guestbook-table" class="table table-bordered table-striped">' +
			'<thead>' +
			'<tr>' +
			'<th scope="row">#</th>' +
			'<th scope="col">Name</th>' +
			'<th scope="col">Country</th>' +
			'<th scope="col">Date</th>' +
			'<th scope="col">Message</th>' +
			'</tr>' +
			'</thead>';

		for (const entry of entries) {
			htmlTable += `
                <tr>
                    <td>${entry.id}</td>
                    <td>${entry.username}</td>
                    <td>${entry.country}</td>
                    <td class="message-cell">${entry.message}</td>
                    <td>${entry.date}</td>
                </tr>
            `;
		}
		htmlTable += '</table>';

		// Replace placeholder div content with HTML table
		const modifiedHtml = htmlContent.replace(
			'<table id="guestbook-table" class="table table-bordered table-striped"></table>',
			`<table id="guestbook-table" class="table table-bordered table-striped">${htmlTable}</table>`
		);

		// Send the modified HTML content as response
		res.send(modifiedHtml);
	} catch (error) {
		console.error('Error:', error.message);
		res.status(500).send('Internal Server Error');
	}
});
// lisätään GET polku (route) joka hakee /public/adduser.html tiedoston ja lähettää sen selaimeen
app.get('/newmessage', function (req, res) {
	res.sendFile(__dirname + '/public/newmessage.html');
});

app.post('/newmessage', async (req, res) => {
	try {
		// Read existing entries from the file
		const jsonData = await fs.readFile(
			__dirname + '/data/entries.json',
			'utf8'
		);
		const existingEntries = JSON.parse(jsonData);

		// Get the form data from the request body
		const formData = req.body;

		const date =
			new Date().getDate() +
			'/' +
			(1 + parseInt(new Date().getMonth())) +
			'/' +
			new Date().getFullYear();

		// Generate an ID for the new entry
		const id = existingEntries.length + 1;

		// Append the ID to the form data
		const entryWithId = { id, ...formData, date };

		// Append the new entry to the existing entries
		existingEntries.push(entryWithId);

		// Write the updated entries back to the file
		await fs.writeFile(
			__dirname + '/data/entries.json',
			JSON.stringify(existingEntries)
		);

		console.log('Form data saved successfully');
		res.redirect('/messagesent.html');
	} catch (error) {
		console.error('Error saving form data:', error);
		res.status(500).send('Error saving form data');
	}
});

// Route handler for submitting the form data
app.post('/submitAjaxMessage', async (req, res) => {
	try {
		// Read existing entries from the file
		const jsonData = await fs.readFile(
			__dirname + '/data/entries.json',
			'utf8'
		);
		const existingEntries = JSON.parse(jsonData);

		// Get the form data from the request body
		const formData = req.body;

		// Generate an ID for the new entry
		const id = existingEntries.length + 1;

		// Append the ID to the form data
		const entryWithId = { id, ...formData };

		// Append the new form data to the existing entries
		existingEntries.push(entryWithId);

		// Write the updated entries back to the file
		await fs.writeFile(
			__dirname + '/data/entries.json',
			JSON.stringify(existingEntries)
		);

		console.log('Form data saved successfully');
		res.json({ success: true });
	} catch (error) {
		console.error('Error saving form data:', error);
		res.status(500).send('Error saving form data');
	}
});

app.get('/ajaxGuestbook', async (req, res) => {
	try {
		// Read entries.json file and guestbook.html file asynchronously
		const jsonData = await fs.readFile(
			__dirname + '/data/entries.json',
			'utf8'
		);
		const entries = JSON.parse(jsonData);
		res.json(entries);
	} catch (error) {
		console.error('Error:', error.message);
		res.status(500).send('Internal Server Error');
	}
});
//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function (req, res) {
	//res.send('Cant find the requested page', 404);
	res.sendFile(__dirname + '/public/error.html');
});

// käynnistetään palvelin kuuntelemaan valittua porttia
app.listen(PORT, function () {
	console.log('Example 02 app listening on port: ' + PORT);
});
