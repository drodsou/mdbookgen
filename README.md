# mdbookgen

A simple markdown book generator for Deno.

Simple enough to be understandable and hackable

# install

You'll need https://deno.land installed.

Then run in a terminal:

```deno install -A -f https://raw.githubusercontent.com/drodsou/mdbookgen/v1.0.0/mdbookgen.ts```

NOTE: Check and use `last release number`. Don't just use current mdbookgen.ts in master as it may be unstable or not work at all as advancements to next version are commited to master branch.

# initialize book folder
```
mkdir somefolder
cd some folder
mdbookgen init
```

creates default book structure

## writing the book

I recommend editing .md files with Visual Studio Code, with Live Server extension enabled. Complementarily you could use e.g.  Typora or any other text editor you feel comfortable with.

From book root folder, run `mdbookgen` and the chapters in `/chapters` folder willl be merged into `/public/index.html` using the layout in `/public/theme/layout.js`

If `/doc/props.js` exists it will be used for curly variables in your .md files (see bellow)

It also keeps watching changes to see results in realtime in your browser.

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

# advanced customization

If you are into programming you can add a copy of mdbookgen.ts to your book folder and use it for build with `deno run -A mdbookgent.ts` 
It is just one file, simple enough to be understandable on what it does, and modify it as you please for your own needs, with all the power of a full programming language (javascript/typescript) at your disposal.

# TODO

- remove local imports
- installer?, init? or just download repo zip?

