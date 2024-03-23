// Load modules //

var express = require('express');
var app = express();
const fs = require('fs').promises;

// Initiate parsing for url-encoded and json data //

const bodyParser = require('body-parser');

app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);
app.use(bodyParser.json());

// Initiate dotenv module //

const dotenv = require('dotenv').config();
const PORT = dotenv.parsed.PORT01 || PORT == 3000;

// Load static files from public directory

app.use(express.static('public'));

// Route for guestbook //

app.get('/guestbook', async (req, res) => {
	try {
		// Read entries.json file and the guestbook.html page
		const [entryData, guestbookPage] = await Promise.all([
			fs.readFile('data/entries.json', 'utf8'),
			fs.readFile('public/guestbook.html', 'utf8'),
		]);

		// Parse JSON data from entries.json
		const entries = JSON.parse(entryData);

		// Generate HTML table dynamically to show guestbook entries
		let entryTable =
			'<thead>' +
			'<tr>' +
			'<th scope="row">#</th>' +
			'<th scope="col">Name</th>' +
			'<th scope="col">Country</th>' +
			'<th scope="col">Message</th>' +
			'<th scope="col">Date</th>' +
			'</tr>' +
			'</thead>';

		for (const entry of entries) {
			entryTable += `
                <tr>
                    <td>${entry.id}</td>
                    <td>${entry.username}</td>
                    <td>${entry.country}</td>
                    <td class="message-cell">${entry.message}</td>
                    <td>${entry.date}</td>
                </tr>
            `;
		}

		// Replace placeholder div content with html table
		const generatedGuestbook = guestbookPage.replace(
			'<table id="guestbook-table" class="table table-bordered table-striped"></table>',
			`<table id="guestbook-table" class="table table-bordered table-striped">${entryTable}</table>`
		);

		// Send the modified html content as response
		res.send(generatedGuestbook);

		// Catch errors and inform about them
	} catch (error) {
		console.error('Error:', error.message);
		res.status(500).send(
			'Internal Server Error, could not generate guestbook'
		);
	}
});

// Route for new message html page

app.get('/newmessage', function (req, res) {
	res.sendFile(__dirname + '/public/newmessage.html');
});

// Route for posting the new message to the guestbook

app.post('/newmessage', async (req, res) => {
	try {
		// Read existing entries from the file
		const entryData = await fs.readFile(
			__dirname + '/data/entries.json',
			'utf8'
		);

		// Parse JSON data from entries.json
		const existingEntries = JSON.parse(entryData);

		// Get the form data from the html form on the newmessage.html page
		const formData = req.body;

		// Generate date string to a variable
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

		// Write to console information about saving the data successfully
		console.log('New message data saved successfully!');

		// Redirect to the messagesent.html page
		res.redirect('/messagesent.html');

		// Catch errors and inform about them
	} catch (error) {
		console.error('Error saving form data:', error);
		res.status(500).send('Error saving the new message form data');
	}
});

// Route for handling the Ajax message //

app.post('/submitAjaxMessage', async (req, res) => {
	try {
		// Read existing entries from the entries.json file
		const entryData = await fs.readFile(
			__dirname + '/data/entries.json',
			'utf8'
		);
		const existingEntries = JSON.parse(entryData);

		// Get the form data from the request body
		const formData = req.body;

		// Generate an ID for the new entry
		const id = existingEntries.length + 1;

		// Append the ID to the form data
		const entryWithId = { id, ...formData };

		// Append the new form data to the existing entries
		existingEntries.push(entryWithId);

		// Write the updated entries back to the entries.json file
		await fs.writeFile(
			__dirname + '/data/entries.json',
			JSON.stringify(existingEntries)
		);

		// Write to console information about saving the data successfully
		console.log('Ajax Message data saved successfully');

		// Send information back to client about success as a JSON response
		res.json({ success: true });

		// Catch errors and inform about them
	} catch (error) {
		console.error('Error saving form data:', error);
		res.status(500).send('Error saving the ajax message form data');
	}
});

// Route for the Guestbook on the ajax message page //

app.get('/ajaxGuestbook', async (req, res) => {
	try {
		// Read existing entries from the entries.json file
		const entryData = await fs.readFile(
			__dirname + '/data/entries.json',
			'utf8'
		);
		const entries = JSON.parse(entryData);

		// Send response back to client
		res.json(entries);

		// Catch errors and inform about them
	} catch (error) {
		console.error('Error:', error.message);
		res.status(500).send(
			'Could not generate the guestbook to the Ajax message page'
		);
	}
});

// Error route //

app.get('*', function (req, res) {
	// Bring up the error page
	res.sendFile(__dirname + '/public/error.html');
});

// Start the server and listen to a specific port //

app.listen(PORT, function () {
	console.log('Website is running and listening on port: ' + PORT);
});
