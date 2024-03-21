// Listen that DOMContent is loaded and then initiate functions //

document.addEventListener('DOMContentLoaded', function () {
	// Function to fetch Guestbook entries
	function fetchGuestbookData() {
		// Make an AJAX GET request to the server
		fetch('/ajaxGuestbook')
			// Parse response as JSON
			.then((response) => response.json())

			// Generate entries to htmlContent variable
			.then((entries) => {
				let htmlContent =
					'<table class="table table-bordered table-striped">' +
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
					htmlContent += `
                <tr>
                    <td>${entry.id}</td>
                    <td>${entry.username}</td>
                    <td>${entry.country}</td>
                    <td class="message-cell">${entry.message}</td>
                    <td>${entry.date}</td>
                </tr>
            `;
				}
				htmlContent += '</table>';

				// Render htmlContent to the #guestbook-table div
				document.getElementById('guestbook-table').innerHTML =
					htmlContent;
			})

			// Catch errors and inform of them in the console
			.catch((error) => {
				console.error(
					'Error when generating the guestbook data: ',
					error
				);
			});
	}

	// Fetch guestbook data after form submission is successful
	fetchGuestbookData();

	// Initiate ajaxForm variable, attach the ajaxmessage-form to it
	ajaxForm = document.getElementById('ajaxmessage-form');

	// Listen to the ajaxForm submit button
	ajaxForm.addEventListener('submit', function (event) {
		// Prevent default operations for the submit button
		event.preventDefault();

		// Generate date string to a variable
		const date =
			new Date().getDate() +
			'/' +
			(1 + parseInt(new Date().getMonth())) +
			'/' +
			new Date().getFullYear();

		// Create an object to hold form data
		const formData = {
			username: document.getElementById('username').value,
			country: document.getElementById('country').value,
			message: document.getElementById('message').value,
			date: date,
		};

		// Check for empty inputs and do not allow them to happen
		if (username === '' || country === '' || message === '') {
			alert('Please fill in all fields');
			return;
		} else {
			// Convert entry from the form data object to JSON
			const entryData = JSON.stringify(formData);

			// Fetch the submitAjaxMessage route and post the JSON entry data in to it
			fetch('/submitAjaxMessage', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: entryData,
			})
				// Check for response and show error if failed submit
				.then((response) => {
					if (!response.ok) {
						throw new Error('Failed to submit ajax message form');
					}
					return response.json();
				})
				// If response OK then show message in console.log
				.then((data) => {
					console.log('Form submitted successfully:', data);

					// Then run the fetchGuestbookData function and reset the ajax message form
					fetchGuestbookData();
					ajaxForm.reset();
				})
				// Catch errors and inform about them
				.catch((error) => {
					console.error(
						'Error, could not submit the ajax message form:',
						error.message
					);
				});
		}
	});
});
