(function () {
	// Without fetch the forms still work as plain posts; they just leave the page.
	if (!window.fetch || !window.AbortController || !window.URLSearchParams) return;

	var EMAIL = 'hello@prodbuilds.com';
	var TIMEOUT_MS = 20000;

	function show(status, text, isError) {
		status.textContent = text;
		status.classList.toggle('is-error', isError);
		var link = document.createElement('a');
		link.href = 'mailto:' + EMAIL;
		link.textContent = EMAIL;
		status.appendChild(link);
		status.appendChild(document.createTextNode('.'));
	}

	document.querySelectorAll('form[data-lead]').forEach(function (form) {
		var btn = form.querySelector('button[type="submit"]');
		var input = form.querySelector('input[type="email"]');
		var label = btn.textContent;
		var status = document.getElementById(form.getAttribute('data-status'));
		var note = document.getElementById(form.getAttribute('data-note'));
		var sending = false;

		form.addEventListener('submit', function (event) {
			event.preventDefault();
			if (sending) return;
			sending = true;
			btn.disabled = true;
			btn.textContent = 'Sending…';
			status.textContent = '';

			var body = new URLSearchParams();
			new FormData(form).forEach(function (value, key) { body.append(key, value); });

			var controller = new AbortController();
			var timer = setTimeout(function () { controller.abort(); }, TIMEOUT_MS);

			// Same request the plain form sent. The Apps Script response isn't readable cross-origin,
			// so no-cors: resolving means it reached Google, rejecting means it never left the browser.
			fetch(form.action, { method: 'POST', mode: 'no-cors', credentials: 'include', body: body, signal: controller.signal })
				.then(function () {
					form.hidden = true;
					if (note) note.hidden = true;
					show(status, '✓  Thanks — we’ll be in touch by email. If you don’t hear from us, write to ', false);
					status.setAttribute('tabindex', '-1');
					status.focus();
				}, function () {
					btn.disabled = false;
					btn.textContent = label;
					show(status, 'That didn’t go through. Check your connection and try again, or write to ', true);
					input.focus();
				})
				.then(function () {
					clearTimeout(timer);
					sending = false;
				});
		});
	});
})();
