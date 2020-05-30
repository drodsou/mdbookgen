# mdbookgen

A simple markdown book generator for Deno.

Simple enough to be understandable and hackable

# install

TODO: deno install -A -f ...

# initialize book folder
```
mkdir somefolder
cd some folder
mdbookgen init
```

creates default book structure

## writing the book

from book root run `mdbookgen` and the chapters in /chapters folder willl be merged into `/public/index.html` using the layout in `/public/theme/layout.js`

if exists `/doc/props.js` will be used for curly variables in your .md files (see bellow)

It also keeps watching changes

# vscode live server extension

use live server extension to open index.html and see changes in real time

# vscode renumber folder extension

to move .md files around the `Renumber folder` VS Code extension may be helpful:

https://marketplace.visualstudio.com/items?itemName=drodsou.renumber-folder

# using markdown curly templates

In your markdown you can use:

- `{{include:file.txt}}` : inserts content of file.txt
- `{{run:script.js}}` : inserts the result of script.js
- `{{prop:someprop}}` : inserts value of prof (from doc/props.js)     
- `{{ref:someref}}`: inserts a link to bibliography or character reference (from doc/props.js => props.refs)

# using images

put them in public img and reference them in your .md files as "img/whatever.jpg"

# TODO

- remove local imports
- installer?, init? or just download repo zip?

