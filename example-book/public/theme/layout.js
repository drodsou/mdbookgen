export default (props,content) => /*html*/`
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="theme/style.css"/>
    <title>Document</title>
  </head>
  <body data-theme="light">
    
    <nav>
      ${props.htmlTOC}
    </nav>
    <article>
      ${content}
    </article>

    <script type="module" src="theme/script.js"></script>
  </body>
  </html>
`;