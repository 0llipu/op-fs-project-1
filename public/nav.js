const navSlide = () => {
	const burger = document.querySelector('.burger');
	const nav = document.querySelector('.nav-links');
	const navLinks = document.querySelectorAll('.nav-links li');
	nav.classList.add('nav-inactive');

	burger.addEventListener('click', () => {
		//Toggle X-Mark for Burger Div
		burger.classList.toggle('x-mark');
		//Toggle Nav
		if (burger.classList.contains('x-mark') == true) {
			nav.classList.add('nav-active');
			nav.classList.remove('nav-inactive');

			//Animate Links
			navLinks.forEach((link, index) => {
				if (link.style.animation) {
					link.style.animation = '';
				} else {
					link.style.animation = `navLinkFade 0.3s ease forwards  ${
						index / 6 + 0.5
					}s`;
				}
			});
		} else {
			nav.classList.add('nav-inactive');
			nav.classList.remove('nav-active');
			navLinks.forEach((link, index) => {
				if (link.style.animation) {
					link.style.animation = '';
				} else {
					link.style.animation = `navLinkFade 0.3s ease forwards  ${
						index / 6 + 0.5
					}s`;
				}
			});
		}
	});
};

navSlide();
