import './index.scss';
import 'whatwg-fetch';
import 'es6-promise/auto';
import htmlparser from 'htmlparser2';

const links = {
    linkedin: 'https://www.linkedin.com/in/mutoo/',
    github: 'https://github.com/mutoo/',
    codepen: 'https://codepen.io/mutoo/',
    twitter: 'https://twitter.com/tmutoo/',
};

window.addEventListener('load', () => {
    let meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0';
    document.head.appendChild(meta);

    document.body.innerHTML = `<pre class="main">loading...</pre>`;

    fetch(window.location.href).then(data => {
        return data.text();
    }).then(body => {
        document.body.innerHTML = `<pre class="main"></pre>`;

        let handler = new htmlparser.DomHandler(function(error, dom) {
            if (error) {
                console.error(error);
                return;
            }

            let container = document.querySelector('.main');
            dom.forEach((d) => {
                translate(container, d);
            });

            let codes = container.querySelectorAll('code');
            codes.forEach((code) => {
                code.innerHTML = code.innerText.replace(/(\w+): (.+)/g, (_, site, username) => {
                    let link = links[site.toLowerCase()];
                    return `${site}: <a href="${link}" target="_blank">${username}</a>`;
                });
            });
        }, {
            withStartIndices: true,
            withEndIndices: true,
        });

        let parser = new htmlparser.Parser(handler, {
            decodeEntities: true,
            recognizeSelfClosing: true,
        });
        parser.write(body);
        parser.end();
    });
});

function translate(container, dom) {
    switch (dom.type) {
        case 'directive':
            let span = document.createElement('span');
            span.classList.add('comment');
            span.innerText = `<${dom.data}>`;
            container.appendChild(span);
            break;

        case'tag':
        case 'script':
            spanL(container);

            span = document.createElement('span');
            span.classList.add('tag');
            span.innerText = dom.name;
            container.appendChild(span);

            for (let attr in dom.attribs) {
                space(container);
                attribute(container, attr, dom.attribs[attr]);
            }

            spanR(container);

            if (dom.name === 'a') {
                let a = document.createElement('a');
                a.classList.add('link');
                a.href = dom.attribs.href;
                a.title = dom.attribs.title;
                a.target = dom.attribs.target;
                dom.children.forEach((d) => {
                    translate(a, d);
                });
                container.appendChild(a);
            } else {
                dom.children.forEach((d) => {
                    translate(container, d);
                });
            }

            switch (dom.name) {
                case 'html':
                case 'meta':
                case'link':
                    break;
                default:
                    let group = document.createElement('span');
                    group.classList.add('no-break');
                    spanL(group);
                    span = document.createElement('span');
                    span.classList.add('tag');
                    span.innerText = `/${dom.name}`;
                    group.appendChild(span);
                    spanR(group);
                    container.appendChild(group);
            }
            break;

        case 'text':
            text(container, dom.data);
            break;

        default:
            console.warn('unrecognized dom', dom);
    }
}

function text(container, text) {
    let code = document.createElement('code');
    code.innerText = text;
    container.appendChild(code);
}

function space(container) {
    let text = document.createTextNode(' ');
    container.appendChild(text);
}

function eq(container) {
    let span = document.createElement('span');
    span.classList.add('eq');
    span.innerText = '=';
    container.appendChild(span);
}

function spanL(container) {
    let span = document.createElement('span');
    span.classList.add('angle-bracket');
    span.innerText = '<';
    container.appendChild(span);
}

function spanR(container) {
    let span = document.createElement('span');
    span.classList.add('angle-bracket');
    span.innerText = '>';
    container.appendChild(span);
}

function quote(container) {
    let span = document.createElement('span');
    span.classList.add('quote');
    span.innerText = '"';
    container.appendChild(span);
}

function attribute(container, key, value) {
    let span = document.createElement('span');
    span.classList.add('key');
    span.innerText = key;
    container.appendChild(span);

    eq(container);
    quote(container);

    switch (key) {
        case 'src':
        case 'href':
            let a = document.createElement('a');
            a.href = value;
            a.target = '_blank';
            a.innerText = value;
            container.appendChild(a);
            break;
        default:
            span = document.createElement('span');
            span.classList.add('value');
            span.innerText = value;
            container.appendChild(span);
    }

    quote(container);
}
