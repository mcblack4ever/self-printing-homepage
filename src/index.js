import 'whatwg-fetch';
import 'es6-promise/auto';
import './gtm';
import './index.scss';
import parser from './parser';
import renderer from './renderer';

window.addEventListener('load', () => {
    // viewport patch for mobile
    let meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0';
    document.head.appendChild(meta);

    // remove cloak
    let main = document.querySelector('card');
    main.removeAttribute('cloak');

    // display loading
    let container = document.createElement('pre');
    container.classList.add('source');
    container.innerText = `loading...`;

    // clear main section
    main.innerHTML = '';
    main.appendChild(container);

    // fetch the page itself
    fetch(window.location.href).then(data => {
        // convert to text
        return data.text();

    }).then(body => {
        // parse text to simple dom tree
        return parser(body);

    }).then(dom => {
        // clear and rendered the dom
        container.innerHTML = '';
        return renderer(container, dom);

    }).then(() => {
        // social links map
        const links = {
            linkedin: 'https://www.linkedin.com/in/mutoo/',
            github: 'https://github.com/mutoo/',
            codepen: 'https://codepen.io/mutoo/',
            twitter: 'https://twitter.com/tmutoo/',
        };

        // find plain text like twitter: @mutoo
        // and add link to the usernames
        let codes = container.querySelectorAll('code');
        codes.forEach((code) => {
            code.innerHTML = code.innerText.replace(/(\w+): (.+)/g, (_, site, username) => {
                let link = links[site.toLowerCase()];
                return `${site}: <a href="${link}" title="${site}" target="_blank">${username}</a>`;
            });
        });

    }).then(() => {
        // add a caret to entry link
        let entry = document.querySelector('[tabindex="0"]');
        let caret = document.createElement('span');
        caret.classList.add('caret');
        entry.appendChild(caret);

    }, (err) => {
        container.innerText = err;
    });
});
