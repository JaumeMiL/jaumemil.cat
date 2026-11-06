(() => {
    const english = document.documentElement.lang === 'en';
    const messages = english ? {
        pending: 'Sending your message…',
        success: 'Thanks! Your message has been sent.',
        error: 'Your message couldn’t be sent. Try again or email me directly.',
        copied: 'Email address copied.',
        copyError: 'The address couldn’t be copied. You can select and copy it manually.'
    } : {
        pending: 'S’està enviant el missatge…',
        success: 'Gràcies! El teu missatge s’ha enviat.',
        error: 'No s’ha pogut enviar el missatge. Torna-ho a provar o escriu-me per correu.',
        copied: 'S’ha copiat l’adreça de correu.',
        copyError: 'No s’ha pogut copiar l’adreça. Pots seleccionar-la i copiar-la manualment.'
    };

    const copyButton = document.querySelector('[data-copy-email]');
    const copyStatus = document.querySelector('[data-copy-status]');
    if (navigator.clipboard?.writeText) {
        copyButton.hidden = false;
        copyButton.addEventListener('click', async () => {
            const address = document.querySelector('[data-contact-email]').getAttribute('href').slice('mailto:'.length);
            copyStatus.textContent = '';
            try {
                await navigator.clipboard.writeText(address);
                copyStatus.dataset.state = 'success';
                copyStatus.textContent = messages.copied;
            } catch {
                copyStatus.dataset.state = 'error';
                copyStatus.textContent = messages.copyError;
            }
        });
    }

    const form = document.querySelector('[data-contact-form]');
    const status = form.querySelector('[data-form-status]');
    const submit = form.querySelector('button[type="submit"]');
    const fields = form.querySelectorAll('input, textarea');

    if (typeof fetch !== 'function') return;
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (submit.disabled) return;

        const data = new FormData(form);
        submit.disabled = true;
        for (const field of fields) field.readOnly = true;
        status.dataset.state = 'pending';
        status.textContent = messages.pending;

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                headers: { Accept: 'application/json' },
                body: data
            });
            if (!response.ok) throw new Error('Form submission failed');

            form.reset();
            status.dataset.state = 'success';
            status.textContent = messages.success;
        } catch {
            status.dataset.state = 'error';
            status.textContent = messages.error;
        } finally {
            for (const field of fields) field.readOnly = false;
            submit.disabled = false;
        }
    });
})();
