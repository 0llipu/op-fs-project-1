document.addEventListener('DOMContentLoaded', function () {
	function fetchGuestbookData() {
		// Make an AJAX GET request to the server
		fetch('/ajaxGuestbook')
			.then((response) => response.json()) // Parse response as JSON
			.then((entries) => {
				let htmlContent =
					'<table>' +
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

				document.getElementById('guestbook-table').innerHTML =
					htmlContent;
			})
			.catch((error) => {
				console.error('Error:', error);
			});
	}
	fetchGuestbookData(); // Fetch guestbook data after form submission is successful

	ajaxForm = document.getElementById('ajaxmessage-form');

	ajaxForm.addEventListener('submit', function (event) {
		event.preventDefault();

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

		if (username === '' || country === '' || message === '') {
			alert('Please fill in all fields');
			return;
		} else {
			// Convert form data object to JSON
			const jsonData = JSON.stringify(formData);

			fetch('/submitAjaxMessage', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: jsonData,
			})
				.then((response) => {
					if (!response.ok) {
						throw new Error('Failed to submit form');
					}
					return response.json();
				})
				.then((data) => {
					console.log('Form submitted successfully:', data);
					// Here you can handle the response from the backend, such as displaying a success message to the user
					ajaxForm.reset();
					fetchGuestbookData(); // Fetch guestbook data after form submission is successful
				})
				.catch((error) => {
					console.error('Error:', error.message);
					// Here you can handle errors, such as displaying an error message to the user
				});
		}
	});
});
